import type { Article } from "./editorial";

export type NewsAutomationMode = "external_sources" | "paused";

/**
 * BZMAGNET News is fully automatic by default. Production can still be stopped
 * immediately with NEWS_AUTOMATION_MODE=paused (the legacy internal_review
 * value is also treated as paused during migration).
 */
export function newsAutomationMode(): NewsAutomationMode {
  return ["paused", "internal_review"].includes(process.env.NEWS_AUTOMATION_MODE || "") ? "paused" : "external_sources";
}

export function automaticNewsPublishingEnabled() {
  return newsAutomationMode() === "external_sources" && process.env.NEWS_AUTO_PUBLISH !== "false";
}

/** One source of truth for News automation. Blog is deliberately absent. */
export const siteEditorialConfig = {
  siteId: "bzmagnet",
  domain: "bzmagnet.com",
  locale: "en",
  publishingTimezone: "Asia/Shanghai",
  publishHourUtc: 1, // 09:00 Asia/Shanghai; Vercel invokes the publish route once daily.
  minimumPublishIntervalHours: 48,
  sourceMaxAgeDays: 90,
  maxNewsPerRun: 1,
  sourceAllowlist: ["government", "trade association", "standards body", "official newsroom", "reputable industry publication"],
  bannedClaims: ["factory ownership", "guaranteed performance", "stock", "certification without evidence", "named customer results"],
  ctaRoute: "/en/request-quote",
  mediaProvider: "BZMAGNET-owned media library",
} as const;

export type CandidateStatus = "discovered" | "fetched" | "verified" | "planned" | "generated" | "quality_checked" | "scheduled" | "publishing" | "published" | "needs_review" | "failed" | "archived";
export type NewsEvidence = {
  canonicalUrl: string;
  sourceTitle: string;
  sourceDescription: string;
  contentHash: string;
  verifiedAt: string;
  httpStatus: number;
};
export type NewsCandidate = { id: string; status: CandidateStatus; sourceFingerprint: string; eventFingerprint: string; title: string; summary: string; industry: string; scenario: string; productIds: string[]; sources: Article["sources"]; discoveredAt: string; rejectionReasons: string[]; articleId?: string; sourceId?: string; evidence?: NewsEvidence };

export function isAtLeast48Hours(lastSuccessfulPublishAt: string | null | undefined, now = new Date()) {
  return !lastSuccessfulPublishAt || now.getTime() - new Date(lastSuccessfulPublishAt).getTime() >= siteEditorialConfig.minimumPublishIntervalHours * 60 * 60 * 1000;
}

export function reviewCandidates<T extends NewsCandidate>(candidates: T[]) {
  return candidates.map((candidate) => ({ ...candidate, status: candidate.sources.some((source) => source.url.startsWith("https://")) && candidate.summary.length >= 40 ? "verified" as const : "needs_review" as const }));
}

/** Kept for compatibility with older tests; runtime publishing is implemented in news-automation.ts. */
export function publishApproved(queue: Array<{ article: Article; approvedAt: string; publishAfter: string }>, now = new Date()) {
  return queue.filter((item) => item.article.contentType !== "blog" && item.article.status === "scheduled" && new Date(item.publishAfter) <= now).sort((a, b) => a.publishAfter.localeCompare(b.publishAfter)).slice(0,1);
}
