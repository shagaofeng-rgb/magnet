#!/usr/bin/env node

// Read-only smoke audit of the public, canonical URL graph. Keep the request
// concurrency low so this script is safe to run against production.
const origin = new URL(process.env.AUDIT_ORIGIN || "https://bzmagnet.com");
const userAgent = "BZMAGNET-site-quality-audit/1.0";
const maxConcurrent = 3;
const issues = [];
const timings = [];
const linkedPaths = new Set();
const imageUrls = new Set();

function attribute(tag, name) {
  return tag.match(new RegExp(`(?:^|\\s)${name}=["']([^"']*)["']`, "i"))?.[1] ?? null;
}

function tags(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, "gi"))].map((match) => match[0]);
}

async function get(url) {
  const started = performance.now();
  const response = await fetch(url, {
    headers: { "user-agent": userAgent },
    redirect: "follow",
    signal: AbortSignal.timeout(20000),
  });
  const html = await response.text();
  timings.push({ path: new URL(url).pathname, ms: Math.round(performance.now() - started) });
  return { response, html };
}

async function runPool(items, action) {
  let next = 0;
  await Promise.all(Array.from({ length: maxConcurrent }, async () => {
    while (next < items.length) {
      const item = items[next++];
      try { await action(item); }
      catch (error) { issues.push({ url: item, issue: String(error) }); }
    }
  }));
}

const { response: sitemapResponse, html: sitemap } = await get(new URL("/sitemap.xml", origin));
if (!sitemapResponse.ok) throw new Error(`Sitemap returned ${sitemapResponse.status}`);
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const sitemapPaths = new Set(urls.map((url) => new URL(url).pathname));

await runPool(urls, async (url) => {
  const { response, html } = await get(url);
  const path = new URL(url).pathname;
  if (response.status !== 200) issues.push({ url, issue: `HTTP ${response.status}` });
  if (response.url !== url) issues.push({ url, issue: `Redirected to ${response.url}` });
  if (!response.headers.get("content-type")?.includes("text/html")) issues.push({ url, issue: "Not HTML" });
  if (!/<title>[^<]+<\/title>/i.test(html)) issues.push({ url, issue: "Missing title" });
  if (!tags(html, "meta").some((tag) => attribute(tag, "name") === "description" && attribute(tag, "content"))) issues.push({ url, issue: "Missing description" });
  const h1Count = tags(html, "h1").length;
  if (h1Count !== 1) issues.push({ url, issue: `${h1Count} H1 elements` });
  const canonical = tags(html, "link").find((tag) => attribute(tag, "rel") === "canonical");
  if (attribute(canonical || "", "href") !== url) issues.push({ url, issue: `Canonical ${attribute(canonical || "", "href") || "missing"}` });
  const lang = attribute(tags(html, "html")[0] || "", "lang");
  if (lang !== path.split("/")[1]) issues.push({ url, issue: `HTML language ${lang || "missing"}` });
  if (tags(html, "img").some((tag) => attribute(tag, "alt") === null)) issues.push({ url, issue: "Image missing alt attribute" });
  for (const tag of tags(html, "img")) {
    const src = attribute(tag, "src")?.replaceAll("&amp;", "&");
    if (!src || src.startsWith("data:")) continue;
    try {
      const target = new URL(src, url);
      if (target.origin === origin.origin) imageUrls.add(target.href);
    } catch { issues.push({ url, issue: `Invalid image source ${src}` }); }
  }
  for (const tag of tags(html, "a")) {
    const href = attribute(tag, "href")?.replaceAll("&amp;", "&");
    if (!href || href.startsWith("#") || /^(mailto:|tel:|javascript:)/i.test(href)) continue;
    let target;
    try { target = new URL(href, url); } catch { continue; }
    if (target.origin === origin.origin && !target.pathname.startsWith("/_next/")) linkedPaths.add(target.pathname);
  }
});

const extraPaths = [...linkedPaths].filter((path) => !sitemapPaths.has(path) && !path.startsWith("/admin") && !path.startsWith("/api"));
await runPool(extraPaths.map((path) => new URL(path, origin).href), async (url) => {
  const { response } = await get(url);
  if (response.status >= 400) issues.push({ url, issue: `Linked target HTTP ${response.status}` });
});
await runPool([...imageUrls], async (url) => {
  const { response } = await get(url);
  if (!response.ok || !response.headers.get("content-type")?.startsWith("image/")) {
    issues.push({ url, issue: `Image HTTP ${response.status} (${response.headers.get("content-type") || "unknown type"})` });
  }
});

const sorted = timings.map((row) => row.ms).sort((a, b) => a - b);
const percentile = (p) => sorted[Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * p))] || 0;
const result = {
  origin: origin.origin,
  sitemapUrls: urls.length,
  additionalLinkedPaths: extraPaths.length,
  images: imageUrls.size,
  sampledRequests: timings.length,
  responseMs: { median: percentile(0.5), p95: percentile(0.95), max: sorted.at(-1) || 0 },
  issueCount: issues.length,
  issues,
};
console.log(JSON.stringify(result, null, 2));
if (issues.length) process.exitCode = 1;
