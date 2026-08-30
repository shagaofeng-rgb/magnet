import { articlePath } from "@/lib/editorial";
import { origin } from "@/lib/i18n";
import { listPublishedNews } from "@/lib/news-store";

export const runtime = "nodejs";
export const revalidate = 900;

const xml = (value: string) => value.replace(/&/gu, "&amp;").replace(/</gu, "&lt;").replace(/>/gu, "&gt;").replace(/"/gu, "&quot;").replace(/'/gu, "&apos;");

export async function GET() {
  const articles = (await listPublishedNews("en"))
    .filter((article) => article.contentType === "industry_news" || article.contentType === "company_news")
    .slice(0, 50);
  const items = articles.map((article) => {
    const url = `${origin}${articlePath(article)}`;
    const source = article.sources[0];
    return `<item><title>${xml(article.title)}</title><link>${xml(url)}</link><guid isPermaLink="true">${xml(url)}</guid><description>${xml(article.summary)}</description><pubDate>${new Date(article.publishedAt || Date.now()).toUTCString()}</pubDate><author>BZMAGNET Editorial Team</author>${source ? `<source url="${xml(source.url)}">${xml(source.publisher)}</source>` : ""}</item>`;
  }).join("");
  const body = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>BZMAGNET Industry News</title><link>${origin}/en/news</link><description>Source-reviewed magnetic separation and industrial material-handling news from BZMAGNET.</description><language>en</language><lastBuildDate>${new Date().toUTCString()}</lastBuildDate><atom:link xmlns:atom="http://www.w3.org/2005/Atom" href="${origin}/news/rss.xml" rel="self" type="application/rss+xml"/>${items}</channel></rss>`;
  return new Response(body, { headers: { "content-type": "application/rss+xml; charset=utf-8", "cache-control": "public, s-maxage=900, stale-while-revalidate=3600" } });
}
