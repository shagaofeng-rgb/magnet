import type { Article } from "@/lib/editorial";

const blockText = (article: Article) => article.sections.flatMap((section) => section.blocks.flatMap((block) => {
  if (block.type === "paragraph" || block.type === "callout") return [block.text];
  if (block.type === "image") return [];
  if (block.type === "table") return [...block.columns, ...block.rows.flat()];
  return block.items;
}));
const countWords = (article: Article) => [article.title, article.summary, ...blockText(article)].join(" ").trim().split(/\s+/u).filter(Boolean).length;

export function validateNewsCitations(article: Article) {
  const errors: string[] = [];
  if (!article.sources.length) errors.push("citation-required");
  const seen = new Set<string>();
  for (const source of article.sources) {
    if (!/^https:\/\//iu.test(source.url)) errors.push("citation-url");
    if (!source.publisher || !source.title || !source.publishedAt || !source.accessedAt || !source.relevanceNote) errors.push("citation-fields");
    const published = source.publishedAt ? new Date(source.publishedAt).getTime() : NaN;
    if (!Number.isFinite(published) || Date.now() - published > 90 * 24 * 60 * 60 * 1000 || published > Date.now() + 24 * 60 * 60 * 1000) errors.push("citation-date");
    const key = source.url.toLowerCase();
    if (seen.has(key)) errors.push("duplicate-citation");
    seen.add(key);
  }
  return [...new Set(errors)];
}

export function validateNewsStructure(article: Article) {
  const errors: string[] = [];
  const wordCount = countWords(article);
  if (wordCount < 1100 || wordCount > 1600) errors.push("news-word-count");
  const hasReportingNote = article.sections.some((section) => section.blocks.some((block) => block.type === "paragraph" && /External developments are cited for context and do not indicate a commercial relationship with BZMAGNET\./u.test(block.text)));
  if (!hasReportingNote) errors.push("reporting-note-required");
  if (!article.related.some((relation) => relation.relation === "product") || !article.related.some((relation) => relation.relation === "industry") || !article.cta.href) errors.push("required-internal-links");
  return { wordCount, errors };
}

export function validateNewsBrandAndGeo(article: Article) {
  const errors: string[] = [];
  const publicPayload = JSON.stringify({ ...article, internal: undefined });
  const headings = article.sections.filter((section) => section.level === 2).map((section) => section.heading.toLowerCase());
  const requiredHeadings = ["what changed", "why it matters", "bzmagnet product context", "selection conditions", "source limits", "practical next steps"];
  if (/cowin/iu.test(publicPayload)) errors.push("brand-boundary-cowin-reference");
  if (/\b(?:guaranteed|100%|world[- ]leading|best[- ]in[- ]class|leading supplier|in stock)\b/iu.test(publicPayload)) errors.push("unsupported-promotional-claim");
  if (article.author.name !== "BZMAGNET Editorial Team") errors.push("bzmagnet-editorial-author-required");
  if (!article.seo.metaTitle.includes("BZMAGNET")) errors.push("bzmagnet-seo-brand-required");
  if (!requiredHeadings.every((required) => headings.some((heading) => heading.includes(required)))) errors.push("geo-answer-structure-required");
  if (!article.internal.evidenceIds.length || article.internal.evidenceIds.some((id) => !/^[a-f0-9]{64}$/iu.test(id))) errors.push("verified-evidence-fingerprint-required");
  if (!article.related.some((relation) => relation.relation === "product") || !article.related.some((relation) => relation.relation === "industry")) errors.push("seo-internal-link-graph-required");
  return errors;
}
