import { createHash } from "node:crypto";
import type { NewsCandidate, NewsEvidence } from "@/lib/editorial-workflow";

const text = (value: string) => value
  .replace(/<[^>]*>/gu, " ")
  .replace(/&(?:amp|quot|#39|lt|gt|nbsp);/gu, " ")
  .replace(/\s+/gu, " ")
  .trim();

const meta = (html: string, key: string) => {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const first = html.match(new RegExp(`<meta[^>]+(?:name|property)=["']${escaped}["'][^>]+content=["']([^"']+)["']`, "iu"));
  const second = html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${escaped}["']`, "iu"));
  return text(first?.[1] || second?.[1] || "");
};

const canonical = (html: string) => text(
  html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/iu)?.[1]
  || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/iu)?.[1]
  || "",
);
const hostname = (value: string) => new URL(value).hostname.replace(/^www\./iu, "").toLowerCase();

export async function verifyCandidateSourceEvidence(candidate: NewsCandidate): Promise<{ evidence?: NewsEvidence; reasons: string[] }> {
  const source = candidate.sources[0];
  if (!source?.url || !/^https:\/\//iu.test(source.url)) return { reasons: ["source-evidence-url-invalid"] };

  try {
    const response = await fetch(source.url, {
      cache: "no-store",
      redirect: "follow",
      signal: AbortSignal.timeout(15_000),
      headers: {
        accept: "text/html,application/xhtml+xml",
        "user-agent": "BZMAGNET-News-Evidence/2.0 (+https://bzmagnet.com/en/editorial-policy)",
      },
    });
    if (!response.ok) return { reasons: [`source-evidence-http-${response.status}`] };
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) return { reasons: ["source-evidence-content-type"] };

    const html = await response.text();
    const declaredCanonical = canonical(html);
    const canonicalUrl = declaredCanonical ? new URL(declaredCanonical, response.url).toString() : response.url;
    if (hostname(canonicalUrl) !== hostname(source.url)) return { reasons: ["source-evidence-canonical-domain-mismatch"] };

    const sourceTitle = meta(html, "og:title") || text(html.match(/<title[^>]*>([\s\S]*?)<\/title>/iu)?.[1] || "") || candidate.title;
    const sourceDescription = meta(html, "description") || meta(html, "og:description") || candidate.summary;
    if (!sourceTitle || sourceDescription.split(/\s+/u).filter(Boolean).length < 12) return { reasons: ["source-evidence-summary-insufficient"] };

    return {
      reasons: [],
      evidence: {
        canonicalUrl,
        sourceTitle: sourceTitle.slice(0, 300),
        sourceDescription: sourceDescription.slice(0, 1_500),
        contentHash: createHash("sha256").update(`${canonicalUrl}\n${sourceTitle}\n${sourceDescription}`).digest("hex"),
        verifiedAt: new Date().toISOString(),
        httpStatus: response.status,
      },
    };
  } catch (error) {
    return { reasons: [error instanceof Error && error.name === "TimeoutError" ? "source-evidence-timeout" : "source-evidence-unreachable"] };
  }
}
