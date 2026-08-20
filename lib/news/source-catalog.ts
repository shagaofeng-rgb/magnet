import { createHash } from "node:crypto";

export type SourceGroup =
  | "magnetics-rare-earths-metallurgy"
  | "recycling-waste-ewaste"
  | "mining-aggregates-cement"
  | "food-grain-agriculture"
  | "chemicals-plastics-ceramics-glass"
  | "bulk-handling-engineering"
  | "community-discovery";

export type SourceValidationStatus = "pending" | "verified" | "inactive" | "robots-blocked" | "needs_review";
export type SourceTier = "A" | "B" | "C" | "discovery-only";
export type DiscoveryMethod = "rss" | "sitemap" | "public-page" | "api";

export type NewsSource = {
  id: string;
  sourceOrdinal: number;
  rawEntry: string;
  name: string;
  requestedDomain: string;
  canonicalDomain?: string;
  feedUrl?: string;
  sourceGroup: SourceGroup;
  industryTags: string[];
  region?: string;
  contentLanguages: string[];
  discoveryMethod: DiscoveryMethod[];
  tier: SourceTier;
  active: boolean;
  validationStatus: SourceValidationStatus;
  robotsAllowed?: boolean;
  lastCheckedAt?: string;
  lastUsedAt?: string;
  useCount: number;
  notes?: string;
};

export type SourceCatalogVersion = {
  id: string;
  name: string;
  rawChecksum: string;
  sourceCount: number;
  status: "draft" | "active" | "archived";
  createdAt: string;
  replacesVersionId?: string;
};

const groupForOrdinal = (ordinal: number): SourceGroup => {
  if (ordinal <= 35) return "magnetics-rare-earths-metallurgy";
  if (ordinal <= 90) return "recycling-waste-ewaste";
  if (ordinal <= 155) return "mining-aggregates-cement";
  if (ordinal <= 200) return "food-grain-agriculture";
  if (ordinal <= 245) return "chemicals-plastics-ceramics-glass";
  if (ordinal <= 280) return "bulk-handling-engineering";
  return "community-discovery";
};

const normalized = (value: string) => value.trim().replace(/^\[([^\]]+)\]\([^)]*\)$/u, "$1").replace(/[，,;；]+$/u, "");
const rawDomain = (value: string) => normalized(value).replace(/^https?:\/\//iu, "").replace(/^www\./iu, "").replace(/\/$/u, "");

/** Parse a supplied catalogue without activating, correcting or crawling it. */
export function parseSourceCatalog(raw: string, versionId: string): NewsSource[] {
  return raw.split(/\r?\n/u).flatMap((line) => {
    const match = line.match(/^\s*(\d{1,3})\.\s+(.+?)\s*$/u);
    if (!match) return [];
    const sourceOrdinal = Number(match[1]);
    if (!Number.isInteger(sourceOrdinal) || sourceOrdinal < 1) return [];
    const parsed = match[2].match(/^(.+?)(?:\s+\(([^)]*)\))?$/u);
    const requestedDomain = rawDomain(parsed?.[1] || match[2]);
    const descriptor = normalized(parsed?.[2] || requestedDomain);
    const validHost = /^[a-z0-9.-]+(?:\/[a-z0-9._~:/?#[\]@!$&'()*+,;=%-]*)?$/iu.test(requestedDomain) && !/\s/u.test(requestedDomain);
    const discoveryOnly = groupForOrdinal(sourceOrdinal) === "community-discovery";
    return [{
      id: createHash("sha256").update(`${versionId}:${sourceOrdinal}:${line}`).digest("hex").slice(0, 32),
      sourceOrdinal,
      rawEntry: line,
      name: descriptor,
      requestedDomain,
      sourceGroup: groupForOrdinal(sourceOrdinal),
      industryTags: [],
      contentLanguages: ["en"],
      discoveryMethod: discoveryOnly ? ["public-page"] : ["rss", "sitemap", "public-page"],
      tier: discoveryOnly ? "discovery-only" : "C",
      active: false,
      validationStatus: validHost ? "pending" : "needs_review",
      useCount: 0,
      notes: validHost ? "Imported pending low-frequency health and robots validation." : "Raw entry is retained unchanged; the requested domain needs manual review before any use.",
    } satisfies NewsSource];
  });
}

export function sourceCatalogChecksum(raw: string) { return createHash("sha256").update(raw.replace(/\r\n/g, "\n")).digest("hex"); }

export function eligibleForCrawler(source: Pick<NewsSource, "active" | "validationStatus" | "robotsAllowed" | "discoveryMethod" | "tier">) {
  return source.active && source.validationStatus === "verified" && source.robotsAllowed === true && source.tier !== "discovery-only" && source.discoveryMethod.includes("rss");
}

export function sourceCatalogReport(sources: NewsSource[]) {
  return {
    total: sources.length,
    pending: sources.filter((source) => source.validationStatus === "pending").length,
    needsReview: sources.filter((source) => source.validationStatus === "needs_review").length,
    verified: sources.filter((source) => source.validationStatus === "verified").length,
    activeForCrawler: sources.filter(eligibleForCrawler).length,
  };
}
