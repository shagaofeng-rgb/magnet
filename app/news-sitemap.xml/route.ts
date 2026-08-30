import { articlePath } from "@/lib/editorial";
import { origin } from "@/lib/i18n";
import { listPublishedNews } from "@/lib/news-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const esc = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function GET() {
  const articles = (await listPublishedNews()).filter((article) => article.publishedAt && Date.now() - new Date(article.publishedAt).getTime() <= 48 * 60 * 60 * 1000);
  const items = articles.map((article) => `<url><loc>${esc(`${origin}${articlePath(article)}`)}</loc><news:news><news:publication><news:name>BZMAGNET</news:name><news:language>${article.locale}</news:language></news:publication><news:publication_date>${esc(article.publishedAt!)}</news:publication_date><news:title>${esc(article.title)}</news:title></news:news></url>`).join("");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">${items}</urlset>`, { headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "no-store, max-age=0" } });
}
