import type { Locale } from "./i18n";

/** Public editorial contract. Internal generation and evidence records never render. */
export type ContentType = "company_news" | "industry_news" | "blog";
export type ArticleStatus = "draft" | "review" | "approved" | "scheduled" | "publishing" | "published" | "needs_review" | "failed" | "archived";
export type Block =
  | { type: "paragraph"; text: string }
  | { type: "bullets" | "numbered" | "checklist"; items: string[] }
  | { type: "callout"; title: string; text: string; tone: "info" | "important" }
  | { type: "table"; columns: string[]; rows: string[][] }
  | { type: "image"; assetId: string; alt: string; caption?: string };

export type Article = {
  id: string;
  locale: Locale;
  contentType: ContentType;
  status: ArticleStatus;
  title: string;
  summary: string;
  primaryTopic: string;
  audience: string;
  hero?: { assetId: string; alt: string; caption?: string };
  sections: Array<{ heading: string; level: 2 | 3; blocks: Block[] }>;
  faq: Array<{ question: string; answer: string }>;
  sources: Array<{ publisher: string; title: string; url: string; publishedAt?: string; accessedAt: string; relevanceNote: string }>;
  related: Array<{ targetId: string; relation: "product" | "industry" | "guide" }>;
  author: { name: string; profilePath?: string; role?: string };
  cta: { label: string; href: string; text: string };
  seo: { slug: string; metaTitle: string; metaDescription: string; canonicalPath: string; ogImageAssetId?: string };
  publishedAt?: string;
  modifiedAt?: string;
  internal: { topicBriefId: string; evidenceIds: string[]; companyEvidenceApproved?: boolean; translationReviewed: boolean; generationRecordId: string; validationOutput: string[]; humanizerAudit?: { originalDraftHash: string; humanizedDraftHash: string; factualFieldsLocked: string[]; removedAiPatterns: string[]; prohibitedPhrasesFound: string[]; factDeltaDetected: boolean; processedAt: string } };
};

export const editorialAssets = {
  guide: { src: "/media/editorial/buyer-guide-material-review.webp", alt: "Bulk material on a conveyor beside generic inspection tools" },
  guideHub: { src: "/media/editorial/blog-hub-process-planning.webp", alt: "Blank process planning sheets, material samples and conveyor layout pieces" },
  industry: { src: "/media/editorial/industry-news-material-sorting.webp", alt: "Generic material sorting conveyors in an industrial setting" },
  company: { src: "/media/editorial/company-news-catalog-workflow.webp", alt: "Unbranded catalog and export coordination materials on a desk" },
} as const;

const guideBlocks = (a: string, b: string, c: string, d: string) => [
  { heading: a, level: 2 as const, blocks: [{ type: "paragraph" as const, text: "Start with the process condition and the material being handled before comparing equipment families." }] },
  { heading: b, level: 2 as const, blocks: [{ type: "bullets" as const, items: ["Material and particle-size range", "Target metal or contaminant", "Throughput and flow condition"] }] },
  { heading: c, level: 2 as const, blocks: [{ type: "paragraph" as const, text: "Installation position, available clearance and environmental conditions can change which options are practical." }] },
  { heading: d, level: 2 as const, blocks: [{ type: "checklist" as const, items: ["Share conveyor or process dimensions", "Describe the project objective", "Identify available power and controls"] }] },
];

/** Blog is intentionally editorial-only: the News scheduler never writes this array or /blog. */
export const articles: Article[] = [{
  id: "f6907a90-8d2d-4fac-8992-a62de111d060", locale: "en", contentType: "blog", status: "published",
  title: "How to Prepare Process Details for a Magnetic Separator Enquiry",
  summary: "A practical checklist for organizing material, throughput, conveyor and installation information before requesting equipment options.",
  primaryTopic: "magnetic separator enquiry preparation", audience: "industrial equipment buyers",
  hero: { assetId: "guide", alt: editorialAssets.guide.alt, caption: "Illustrative material-review context; not a product photograph." },
  sections: guideBlocks("Define the material", "Describe the separation objective", "Record the installation conditions", "Prepare the enquiry"),
  faq: [
    { question: "Why is belt speed useful?", answer: "It helps describe how the material passes through the intended separation position." },
    { question: "Should unknown values be estimated?", answer: "No. Mark unknown information clearly so it can be confirmed during discussion." },
    { question: "Is a product model required before enquiry?", answer: "No. Process information can be reviewed before a specific configuration is discussed." },
  ],
  sources: [], related: [], author: { name: "BZMAGNET Editorial Team", profilePath: "/en/authors/editorial-team", role: "Editorial review" },
  cta: { label: "Send Your Process Details", href: "/en/request-quote", text: "Share the available material and process information for quotation support." },
  seo: { slug: "prepare-process-details-magnetic-separator-enquiry", metaTitle: "Prepare a Magnetic Separator Enquiry | BZMAGNET", metaDescription: "Organize material, throughput, conveyor and installation details before requesting suitable magnetic separation equipment options and a quotation.", canonicalPath: "/en/blog/prepare-process-details-magnetic-separator-enquiry", ogImageAssetId: "guide" },
  publishedAt: "2026-08-13", internal: { topicBriefId: "brief-guide-001", evidenceIds: [], translationReviewed: true, generationRecordId: "generation-001", validationOutput: [] },
}];

const forbidden = /Update Note|Industry Update|Call to action|Source and method note|Original Source|SEO Meta|AI Citation Ready Summary|Internal Linking Suggestions|CMS Publishing Checklist|sourceClaims|TBD|cowin|```|<\/?[a-z]/i;
export function normalize(value: string) { return value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim(); }
export function validateArticle(article: Article, all: Article[] = articles) {
  const errors: string[] = [];
  if (article.status !== "published") errors.push("status");
  if (forbidden.test(JSON.stringify({ ...article, internal: undefined }))) errors.push("forbidden-public-content");
  const h2s = article.sections.filter((section) => section.level === 2);
  if (h2s.length < 4 || h2s.length > 8) errors.push("heading-count");
  if (article.faq.length > 6 || new Set(article.faq.map((item) => normalize(item.question))).size !== article.faq.length) errors.push("faq");
  if (article.seo.metaDescription.length < 70 || article.seo.metaDescription.length > 160 || /\b(Includes|and|with|for)$/i.test(article.seo.metaDescription)) errors.push("meta-description");
  if (article.contentType === "company_news" && !article.internal.companyEvidenceApproved) errors.push("company-evidence");
  if (article.contentType === "blog" && article.sources.length) errors.push("blog-sources");
  if (!article.internal.translationReviewed) errors.push("locale-review");
  if (all.some((other) => other.id !== article.id && normalize(other.title) === normalize(article.title))) errors.push("duplicate-title");
  return errors;
}

export const publishedArticles = articles.filter((article) => validateArticle(article).length === 0);
export function articlePath(article: Article) { return article.contentType === "blog" ? `/${article.locale}/blog/${article.seo.slug}` : `/${article.locale}/news/${article.contentType === "company_news" ? "company" : "industry"}/${article.seo.slug}`; }
export function findStaticArticle(locale: Locale, type: ContentType, slug: string) { return publishedArticles.find((article) => article.locale === locale && article.contentType === type && article.seo.slug === slug); }
/** @deprecated Runtime News uses news-public.ts; retained for static Blog route compatibility. */
export const findArticle = findStaticArticle;
export function similarity(a: Article, b: Article) {
  const paragraphs = (article: Article) => new Set(article.sections.flatMap((section) => section.blocks.filter((block) => block.type === "paragraph").map((block) => block.text)));
  const left = paragraphs(a), right = paragraphs(b);
  const overlap = [...left].filter((item) => right.has(item)).length / Math.max(1, Math.min(left.size, right.size));
  return { paragraphOverlap: overlap, blocked: overlap >= 0.35 };
}
