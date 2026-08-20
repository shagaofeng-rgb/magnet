import "server-only";

import { listSourceHealthCandidates, recordSourceHealthCheck } from "../news-store";

const timeoutMs = 12_000;
const agent = "BZMAGNET-Source-Validator/1.0 (+https://bzmagnet.com)";

function sourceUrlFor(value: string) {
  return new URL(/^https:\/\//iu.test(value) ? value : `https://${value}`);
}

/** Conservative interpretation: a wildcard Disallow: / blocks this worker. */
function permitsWorker(robots: string) {
  const normalized = robots.replace(/\r/g, "").toLowerCase();
  const wildcard = normalized.match(/user-agent\s*:\s*\*[\s\S]*?(?=\n\s*user-agent\s*:|$)/u)?.[0] || "";
  return !/^\s*disallow\s*:\s*\/\s*$/mu.test(wildcard);
}

function discoverFeedUrl(html: string, pageUrl: string) {
  const match = html.match(/<link\b[^>]*type=["']application\/(?:rss|atom)\+xml["'][^>]*href=["']([^"']+)["'][^>]*>/iu)
    || html.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*type=["']application\/(?:rss|atom)\+xml["'][^>]*>/iu);
  if (!match?.[1]) return undefined;
  const feed = new URL(match[1], pageUrl);
  const root = new URL(pageUrl);
  return feed.protocol === "https:" && feed.hostname === root.hostname ? feed.toString() : undefined;
}

async function checkSource(source: Awaited<ReturnType<typeof listSourceHealthCandidates>>[number]) {
  let sourceUrl: URL;
  try { sourceUrl = sourceUrlFor(source.canonicalDomain || source.requestedDomain); }
  catch {
    await recordSourceHealthCheck({ sourceId: source.id, status: "needs_review", detail: { reason: "invalid-requested-domain" } });
    return "needs_review" as const;
  }
  const root = sourceUrl.origin;
  try {
    const robotsResponse = await fetch(`${root}/robots.txt`, { signal: AbortSignal.timeout(timeoutMs), headers: { "user-agent": agent } });
    const robots = robotsResponse.ok ? await robotsResponse.text() : "";
    if (robotsResponse.ok && !permitsWorker(robots)) {
      await recordSourceHealthCheck({ sourceId: source.id, httpStatus: robotsResponse.status, robotsAllowed: false, status: "robots-blocked", detail: { root, robotsStatus: robotsResponse.status } });
      return "robots-blocked" as const;
    }
    const page = await fetch(sourceUrl.toString(), { signal: AbortSignal.timeout(timeoutMs), headers: { "user-agent": agent, accept: "text/html,application/xhtml+xml" } });
    if (!page.ok) {
      await recordSourceHealthCheck({ sourceId: source.id, httpStatus: page.status, robotsAllowed: robotsResponse.ok ? true : undefined, status: "inactive", detail: { root, robotsStatus: robotsResponse.status, pageStatus: page.status } });
      return "inactive" as const;
    }
    const feedUrl = discoverFeedUrl((await page.text()).slice(0, 500_000), page.url);
    if (!feedUrl) {
      await recordSourceHealthCheck({ sourceId: source.id, httpStatus: page.status, robotsAllowed: robotsResponse.ok ? true : undefined, status: "needs_review", detail: { root, robotsStatus: robotsResponse.status, pageStatus: page.status, reason: "rss-or-atom-feed-not-discovered" } });
      return "needs_review" as const;
    }
    await recordSourceHealthCheck({ sourceId: source.id, httpStatus: page.status, robotsAllowed: true, feedUrl, status: "verified", detail: { root, robotsStatus: robotsResponse.status, pageStatus: page.status, feedUrl } });
    return "verified" as const;
  } catch (error) {
    await recordSourceHealthCheck({ sourceId: source.id, status: "needs_review", detail: { root, reason: error instanceof Error ? error.name : "network-error" } });
    return "needs_review" as const;
  }
}

/** Validates a maximum of six sources per run; it never fetches article pages or bypasses robots. */
export async function runSourceHealthChecks() {
  const sources = await listSourceHealthCandidates();
  const results = await Promise.all(sources.map(checkSource));
  return {
    attempted: sources.length,
    verified: results.filter((result) => result === "verified").length,
    blocked: results.filter((result) => result === "robots-blocked").length,
    needsReview: results.filter((result) => result === "needs_review").length,
    inactive: results.filter((result) => result === "inactive").length,
  };
}
