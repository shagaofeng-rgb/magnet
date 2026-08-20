import "server-only";

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { articlePath, editorialAssets, normalize, similarity, validateArticle, type Article } from "./editorial";
import { isAtLeast48Hours, newsAutomationMode, siteEditorialConfig, type NewsCandidate } from "./editorial-workflow";
import { productPathFor, publicProducts } from "./product-model";
import { acquireNewsLock, existingNewsForDeduplication, getLastSuccessfulPublishAt, isNewsStoreConfigured, listActiveNewsFeeds, listAutomationCandidates, markNewsSourceUsed, nextScheduledArticle, recordNewsRun, releaseNewsLock, saveGeneratedArticle, setArticleState, upsertCandidate } from "./news-store";
import { getNewsReleaseReadiness } from "./news/readiness";
import { humanizeArticle } from "./news/humanize-content";
import { validateNewsCitations, validateNewsStructure } from "./news/content-validators";
import { runSourceHealthChecks } from "./news/source-health";

type Feed = { id: string; publisher: string; url: string; highTrust: boolean; region?: string; licenseNote?: string; sourceId?: string };
type FeedItem = { title: string; url: string; summary: string; publishedAt?: string };
type RunResult = { success: boolean; action: string; published: number; reviewed: number; needsReview: number; message: string; reasons?: string[] };

const maxAgeMs = siteEditorialConfig.sourceMaxAgeDays * 24 * 60 * 60 * 1000;
const fingerprint = (value: string) => createHash("sha256").update(value).digest("hex");
const safeText = (value: string) => value.replace(/<[^>]*>/g, " ").replace(/&(?:amp|quot|#39|lt|gt);/g, " ").replace(/\s+/g, " ").trim();
const valueBetween = (body: string, tag: string) => safeText(body.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"))?.[1] ?? "");

async function configuredFeeds(): Promise<Feed[]> {
  const catalogFeeds = await listActiveNewsFeeds();
  if (catalogFeeds.length) return catalogFeeds;
  // A legacy feed list may be used only during an explicitly configured
  // migration. It can never silently replace the versioned source catalog.
  if (process.env.NEWS_LEGACY_FEEDS_ALLOWED !== "true") return [];
  const raw = process.env.NEWS_SOURCE_FEEDS;
  if (!raw) return [];
  try {
    const feeds = JSON.parse(raw) as Feed[];
    return feeds.filter((feed) => /^https:\/\//.test(feed.url) && Boolean(feed.publisher) && Boolean(feed.id));
  } catch { return []; }
}

function parseFeed(xml: string): FeedItem[] {
  const nodes = xml.match(/<(?:item|entry)(?:\s[^>]*)?>[\s\S]*?<\/(?:item|entry)>/gi) ?? [];
  return nodes.slice(0, 12).map((node) => {
    const link = node.match(/<link[^>]+href=["']([^"']+)["']/i)?.[1] || valueBetween(node, "link");
    const published = valueBetween(node, "pubDate") || valueBetween(node, "published") || valueBetween(node, "updated");
    return { title: valueBetween(node, "title"), url: link.trim(), summary: valueBetween(node, "description") || valueBetween(node, "summary"), publishedAt: published || undefined };
  }).filter((item) => item.title && /^https:\/\//.test(item.url));
}

function sourceDateIsRecent(value?: string) {
  if (!value) return false;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) && timestamp <= Date.now() + 24 * 60 * 60 * 1000 && Date.now() - timestamp <= maxAgeMs;
}

function matchProduct(text: string) {
  const lower = text.toLowerCase();
  const family = lower.includes("recycl") || lower.includes("sorting") ? "recycling" : lower.includes("mineral") || lower.includes("ore") || lower.includes("aggregate") ? "minerals" : lower.includes("powder") || lower.includes("grain") || lower.includes("filter") ? "process" : "conveyor";
  const product = publicProducts.find((item) => item.familyId === family);
  return product ? { family, product } : undefined;
}

function candidateFrom(feed: Feed, item: FeedItem): NewsCandidate {
  const productMatch = matchProduct(`${item.title} ${item.summary}`);
  const source = { publisher: feed.publisher, title: item.title, url: item.url, publishedAt: item.publishedAt, accessedAt: new Date().toISOString(), relevanceNote: productMatch ? `Relevant to ${productMatch.family} magnetic-separation applications; editorial analysis is required before publication.` : "No approved BZMAGNET product-family match." };
  const reasons = [
    ...(sourceDateIsRecent(item.publishedAt) ? [] : ["source-date-outside-90-days-or-missing"]),
    ...(feed.highTrust ? [] : ["source-is-not-marked-high-trust"]),
    ...(feed.licenseNote ? [] : ["source-license-note-missing"]),
    ...(productMatch ? [] : ["no-approved-product-family-relation"]),
  ];
  return {
    id: crypto.randomUUID(), status: reasons.length ? "needs_review" : "verified", sourceFingerprint: fingerprint(item.url), eventFingerprint: fingerprint(`${normalize(item.title)}|${item.publishedAt?.slice(0, 10) ?? ""}`), title: item.title,
    summary: item.summary.slice(0, 1000), industry: productMatch?.family ?? "unclassified", scenario: "industry-event", productIds: productMatch ? [productMatch.product.id] : [], sources: [source], discoveredAt: new Date().toISOString(), rejectionReasons: reasons, sourceId: feed.sourceId,
  };
}

async function fetchFeed(feed: Feed) {
  const response = await fetch(feed.url, { cache: "no-store", signal: AbortSignal.timeout(12_000), headers: { accept: "application/rss+xml, application/atom+xml, application/xml, text/xml" } });
  if (!response.ok) throw new Error(`feed-http-${response.status}`);
  return parseFeed(await response.text());
}

function assertNewsArticle(article: Article, candidate: NewsCandidate, existing: Article[]) {
  const errors = validateArticle({ ...article, status: "published", contentType: "industry_news" }, [...existing, article]);
  if (article.contentType !== "industry_news") errors.push("news-must-not-write-blog");
  if (!article.sources.length || !article.sources.some((source) => /^https:\/\//.test(source.url))) errors.push("verified-source-required");
  if (article.faq.length < 3 || article.faq.length > 5) errors.push("news-faq-range");
  if (!candidate.productIds.length || !article.related.some((relation) => relation.relation === "product" && candidate.productIds.includes(relation.targetId))) errors.push("approved-product-relation-required");
  if (!candidate.productIds.every((id) => publicProducts.some((product) => product.id === id && product.media.some((media) => media.approved && !media.aiGenerated && media.type === "product")))) errors.push("approved-product-media-required");
  if (!article.related.some((relation) => relation.relation === "industry")) errors.push("category-relation-required");
  if (article.hero && !editorialAssets[article.hero.assetId as keyof typeof editorialAssets]) errors.push("unapproved-editorial-hero");
  if (existing.some((other) => normalize(other.title) === normalize(article.title) || similarity(other, article).blocked)) errors.push("duplicate-or-similar-content");
  if (article.seo.canonicalPath !== articlePath(article)) errors.push("canonical-path");
  errors.push(...validateNewsCitations(article));
  errors.push(...validateNewsStructure(article).errors);
  if (article.internal.humanizerAudit?.factDeltaDetected) errors.push("humanizer-fact-delta");
  return [...new Set(errors)];
}

async function requestGeneratedArticle(candidate: NewsCandidate) {
  const endpoint = process.env.NEWS_GENERATOR_WEBHOOK_URL;
  const token = process.env.NEWS_GENERATOR_TOKEN;
  if (!endpoint || !token) return { article: undefined, reason: "news-generator-not-configured" };
  const relation = candidate.productIds[0] ? publicProducts.find((product) => product.id === candidate.productIds[0]) : undefined;
  const response = await fetch(endpoint, {
    method: "POST", signal: AbortSignal.timeout(25_000), headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify({
      site: "BZMAGNET", kind: "industry_news", locale: "en", candidate,
      product: relation ? { id: relation.id, title: relation.locale.en.title, href: productPathFor("en", relation), family: relation.familyLabel } : null,
      categoryHref: relation ? `/en/products/${relation.familyId === "minerals" ? "mineral-bulk-separation" : relation.familyId === "recycling" ? "recycling-metal-sorting" : relation.familyId === "process" ? "process-magnets-filters" : "conveyor-magnetic-separation"}` : null,
      requirements: { h2Range: [4, 8], faqRange: [3, 5], originalAnalysis: true, noUnsupportedClaims: true, publicSources: true, noBrandComparison: true, noBlogContent: true },
    }),
  });
  if (!response.ok) return { article: undefined, reason: `news-generator-http-${response.status}` };
  const payload = await response.json() as { article?: Article };
  return payload.article ? { article: payload.article, reason: undefined } : { article: undefined, reason: "news-generator-invalid-response" };
}

async function verifyPublishedRoute(article: Article) {
  const url = `${process.env.NEXT_PUBLIC_SITE_ORIGIN || "https://bzmagnet.com"}${articlePath(article)}`;
  try {
    const response = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(15_000), headers: { "user-agent": "BZMAGNET-News-Verification/1.0" } });
    if (response.status !== 200) return [`post-publish-http-${response.status}`];
    const html = await response.text();
    if (!html.includes(`rel="canonical"`) || !html.includes(article.seo.canonicalPath)) return ["post-publish-canonical-missing"];
    if (/name="robots" content="[^\"]*noindex/i.test(html)) return ["post-publish-noindex"];
    if (!html.includes("NewsArticle")) return ["post-publish-schema-missing"];
    return [];
  } catch { return ["post-publish-route-unreachable"]; }
}

async function notifySitemapUpdate(article: Article) {
  const endpoint = process.env.GOOGLE_SEARCH_CONSOLE_SITEMAP_WEBHOOK_URL;
  const token = process.env.GOOGLE_SEARCH_CONSOLE_SITEMAP_WEBHOOK_TOKEN;
  if (!endpoint || !token) return "not-configured";
  const response = await fetch(endpoint, { method: "POST", signal: AbortSignal.timeout(10_000), headers: { "content-type": "application/json", authorization: `Bearer ${token}` }, body: JSON.stringify({ sitemap: `${process.env.NEXT_PUBLIC_SITE_ORIGIN || "https://bzmagnet.com"}/sitemap.xml`, newsSitemap: `${process.env.NEXT_PUBLIC_SITE_ORIGIN || "https://bzmagnet.com"}/news-sitemap.xml`, url: `${process.env.NEXT_PUBLIC_SITE_ORIGIN || "https://bzmagnet.com"}${articlePath(article)}`, event: "published" }) });
  return response.ok ? "submitted" : `submission-http-${response.status}`;
}

export async function reviewNewsCandidates(): Promise<RunResult> {
  if (!isNewsStoreConfigured()) return { success: false, action: "review", published: 0, reviewed: 0, needsReview: 0, message: "NEWS_DATABASE_URL is not configured; no candidate was persisted or published.", reasons: ["news-store-not-configured"] };
  if (!(await acquireNewsLock("bzmagnet:news-review"))) return { success: true, action: "review", published: 0, reviewed: 0, needsReview: 0, message: "A review run is already active." };
  const startedAt = new Date().toISOString();
  try {
    // Source validation is safe and useful even while automated publishing is
    // disabled: it only fetches a bounded set of robots files and landing pages.
    const sourceHealth = await runSourceHealthChecks();
    if (newsAutomationMode() !== "external_sources") {
      const result = { success: true, action: "review", published: 0, reviewed: 0, needsReview: 0, message: `Internal-only News mode is active; validated ${sourceHealth.attempted} sources and collected no external candidates.` };
      await recordNewsRun({ id: crypto.randomUUID(), kind: "review", status: "skipped", startedAt, finishedAt: new Date().toISOString(), details: result });
      return result;
    }
    const feeds = await configuredFeeds();
    if (!feeds.length) return { success: false, action: "review", published: 0, reviewed: 0, needsReview: 0, message: "No verified, robots-permitted source is available in the active BZMAGNET source catalog; collection skipped.", reasons: ["active-source-catalog-not-configured"] };
    let reviewed = 0, needsReview = 0;
    for (const feed of feeds) {
      try {
        for (const item of await fetchFeed(feed)) {
          const candidate = candidateFrom(feed, item);
          await upsertCandidate(candidate);
          reviewed += 1;
          needsReview += Number(candidate.status === "needs_review");
        }
      } catch { needsReview += 1; }
    }
    const result = { success: true, action: "review", published: 0, reviewed, needsReview, message: `Validated ${sourceHealth.attempted} sources and reviewed ${reviewed} candidates; ${needsReview} require review.` };
    await recordNewsRun({ id: crypto.randomUUID(), kind: "review", status: "succeeded", startedAt, finishedAt: new Date().toISOString(), details: result });
    return result;
  } catch (error) {
    const result = { success: false, action: "review", published: 0, reviewed: 0, needsReview: 0, message: "News review failed safely.", reasons: [error instanceof Error ? error.message : "unknown"] };
    await recordNewsRun({ id: crypto.randomUUID(), kind: "review", status: "failed", startedAt, finishedAt: new Date().toISOString(), details: result });
    return result;
  } finally { await releaseNewsLock("bzmagnet:news-review"); }
}

export async function generateScheduledNews(): Promise<RunResult> {
  if (!isNewsStoreConfigured()) return { success: false, action: "generate", published: 0, reviewed: 0, needsReview: 0, message: "News store is not configured.", reasons: ["news-store-not-configured"] };
  const candidates = (await listAutomationCandidates()).filter((candidate) => candidate.status === "verified" && !candidate.articleId).slice(0, 1);
  if (!candidates.length) return { success: true, action: "generate", published: 0, reviewed: 0, needsReview: 0, message: "No verified News candidate is ready for generation." };
  const existing = await existingNewsForDeduplication();
  const candidate = candidates[0];
  const generated = await requestGeneratedArticle(candidate);
  if (!generated.article) {
    candidate.status = "needs_review"; candidate.rejectionReasons.push(generated.reason!); await upsertCandidate(candidate);
    return { success: false, action: "generate", published: 0, reviewed: 1, needsReview: 1, message: "Candidate requires review; no article was published.", reasons: [generated.reason!] };
  }
  const relation = candidate.productIds[0] ? publicProducts.find((product) => product.id === candidate.productIds[0]) : undefined;
  const humanized = humanizeArticle(generated.article, ["locale", "contentType", "sources", "related", "cta", "seo", "hero"]);
  const errors = assertNewsArticle(humanized.article, candidate, existing);
  if (errors.length) { await saveGeneratedArticle(candidate.id, humanized.article, "needs_review", errors); return { success: false, action: "generate", published: 0, reviewed: 1, needsReview: 1, message: "Generated News failed quality gates.", reasons: errors }; }
  if (!relation) { await saveGeneratedArticle(candidate.id, humanized.article, "needs_review", ["approved-product-relation-required"]); return { success: false, action: "generate", published: 0, reviewed: 1, needsReview: 1, message: "Generated News has no approved product relation.", reasons: ["approved-product-relation-required"] }; }
  await saveGeneratedArticle(candidate.id, { ...humanized.article, status: "scheduled" }, "scheduled");
  return { success: true, action: "generate", published: 0, reviewed: 1, needsReview: 0, message: "One verified News article is scheduled for the next eligible publication window." };
}

export async function publishScheduledNews(): Promise<RunResult> {
  if (!isNewsStoreConfigured()) return { success: false, action: "publish", published: 0, reviewed: 0, needsReview: 0, message: "NEWS_DATABASE_URL is not configured; automatic News publication is safely blocked.", reasons: ["news-store-not-configured"] };
  if (!(await acquireNewsLock("bzmagnet:news-publish"))) return { success: true, action: "publish", published: 0, reviewed: 0, needsReview: 0, message: "A publish run is already active." };
  const startedAt = new Date().toISOString();
  try {
    if (newsAutomationMode() !== "external_sources") {
      const result = { success: true, action: "publish", published: 0, reviewed: 0, needsReview: 0, message: "Internal-only News mode is active; scheduled publishing is disabled until externally verified sources and a reviewed generator are explicitly configured." };
      await recordNewsRun({ id: crypto.randomUUID(), kind: "publish", status: "skipped", startedAt, finishedAt: new Date().toISOString(), details: result });
      return result;
    }
    if (process.env.NEWS_AUTO_PUBLISH !== "true") {
      const result = { success: true, action: "publish", published: 0, reviewed: 0, needsReview: 0, message: "News auto-publish is disabled; no scheduled article was published." };
      await recordNewsRun({ id: crypto.randomUUID(), kind: "publish", status: "skipped", startedAt, finishedAt: new Date().toISOString(), details: result });
      return result;
    }
    const readiness = await getNewsReleaseReadiness();
    if (!readiness.passed) {
      const result = { success: false, action: "publish", published: 0, reviewed: 0, needsReview: 0, message: "News release readiness is incomplete; automatic publication is blocked.", reasons: readiness.reasons };
      await recordNewsRun({ id: crypto.randomUUID(), kind: "publish", status: "skipped", startedAt, finishedAt: new Date().toISOString(), details: result });
      return result;
    }
    await generateScheduledNews();
    const lastPublishedAt = await getLastSuccessfulPublishAt();
    if (!isAtLeast48Hours(lastPublishedAt)) return { success: true, action: "publish", published: 0, reviewed: 0, needsReview: 0, message: "48-hour News publication interval has not elapsed." };
    const article = await nextScheduledArticle();
    if (!article) return { success: true, action: "publish", published: 0, reviewed: 0, needsReview: 0, message: "No quality-checked News article is scheduled." };
    const existing = await existingNewsForDeduplication();
    const candidate = (await listAutomationCandidates()).find((item) => item.articleId === article.id);
    const errors = !candidate ? ["candidate-not-found"] : assertNewsArticle(article, candidate, existing.filter((item) => item.id !== article.id));
    if (errors.length) { await setArticleState(article, "needs_review", errors); return { success: false, action: "publish", published: 0, reviewed: 0, needsReview: 1, message: "Scheduled News failed final gates and needs review.", reasons: errors }; }
    const published = await setArticleState(article, "published", [], new Date().toISOString());
    revalidatePath("/sitemap.xml"); revalidatePath("/news-sitemap.xml"); revalidatePath("/en/news"); revalidatePath(articlePath(published));
    const verificationErrors = await verifyPublishedRoute(published);
    if (verificationErrors.length) { await setArticleState(published, "needs_review", verificationErrors); return { success: false, action: "publish", published: 0, reviewed: 0, needsReview: 1, message: "Published route failed post-publication verification and was withdrawn for review.", reasons: verificationErrors }; }
    const submission = await notifySitemapUpdate(published);
    await markNewsSourceUsed(candidate?.sourceId);
    const result = { success: true, action: "publish", published: 1, reviewed: 0, needsReview: 0, message: `Published one News article at ${articlePath(published)}. Sitemap submission: ${submission}.` };
    await recordNewsRun({ id: crypto.randomUUID(), kind: "publish", status: "succeeded", startedAt, finishedAt: new Date().toISOString(), details: result });
    return result;
  } catch (error) {
    const result = { success: false, action: "publish", published: 0, reviewed: 0, needsReview: 0, message: "News publishing failed safely; no fallback article was published.", reasons: [error instanceof Error ? error.message : "unknown"] };
    await recordNewsRun({ id: crypto.randomUUID(), kind: "publish", status: "failed", startedAt, finishedAt: new Date().toISOString(), details: result });
    return result;
  } finally { await releaseNewsLock("bzmagnet:news-publish"); }
}
