import Link from "next/link";
import { notFound } from "next/navigation";
import { articlePath } from "@/lib/editorial";
import { isLocale } from "@/lib/i18n";
import { publishedNewsArticles } from "@/lib/news-public";

export const dynamic = "force-dynamic";
export default async function IndustryNews({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; if (!isLocale(locale)) notFound();
  const items = (await publishedNewsArticles(locale)).filter((item) => item.contentType === "industry_news");
  return <section className="editorial-section"><div className="shell"><span className="eyebrow">Source-reviewed developments</span><h1>Industry News</h1><div className="article-grid">{items.map((item) => <Link key={item.id} href={articlePath(item)}><time>{item.publishedAt}</time><h2>{item.title}</h2><p>{item.summary}</p></Link>)}{!items.length && <p className="empty-state">No source-reviewed industry news is published in this locale.</p>}</div></div></section>;
}
