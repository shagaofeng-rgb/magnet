import Link from "next/link";
import { notFound } from "next/navigation";
import { articlePath } from "@/lib/editorial";
import { isLocale, localePath } from "@/lib/i18n";
import { publishedNewsArticles } from "@/lib/news-public";

export const dynamic = "force-dynamic";

export default async function News({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const items = await publishedNewsArticles(locale);
  return <>
    <section className="editorial-hero"><div className="shell"><span className="eyebrow">BZMAGNET editorial</span><h1>Updates and Industry Insights</h1><p>Verified BZMAGNET updates and source-reviewed industry developments relevant to equipment buyers.</p><div className="news-tabs"><Link href={`/${locale}/news/company`}>Company News</Link><Link href={`/${locale}/news/industry`}>Industry News</Link></div></div></section>
    <section className="editorial-section"><div className="shell article-grid">{items.map((item) => <Link key={item.id} href={articlePath(item)}><span>{item.contentType.replace("_", " ")}</span><time>{item.publishedAt}</time><h2>{item.title}</h2><p>{item.summary}</p><strong>Read Article →</strong></Link>)}{!items.length && <div className="empty-state">No approved news items are available in this locale yet.</div>}</div><div className="shell inline-cta"><span>Need equipment for your application?</span><Link href={localePath(locale, "request-quote")}>Request a Quote</Link></div></section>
  </>;
}
