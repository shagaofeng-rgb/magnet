import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { articlePath } from "@/lib/editorial";
import { isLocale, localePath } from "@/lib/i18n";
import { publishedNewsArticles } from "@/lib/news-public";
import { alternates } from "@/lib/seo";
import { homeCopy } from "@/lib/site-copy";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = homeCopy[locale];
  return { title: `${copy.newsHeading} | BZMAGNET`, description: copy.industryDescription, alternates: alternates(locale, "news") };
}

export default async function News({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy=homeCopy[locale];
  const items = await publishedNewsArticles(locale);
  return <>
    <section className="editorial-hero"><div className="shell"><span className="eyebrow">BZMAGNET</span><h1>{copy.newsHeading}</h1><p>{copy.industryDescription}</p><div className="news-tabs"><Link href={`/${locale}/news/company`}>{copy.newsHeading}</Link><Link href={`/${locale}/news/industry`}>{copy.industryTitle}</Link></div></div></section>
    <section className="editorial-section"><div className="shell article-grid">{items.map((item) => <Link key={item.id} href={articlePath(item)}><span>{item.contentType.replace("_", " ")}</span><time>{item.publishedAt}</time><h2>{item.title}</h2><p>{item.summary}</p><strong>{copy.viewNews} →</strong></Link>)}{!items.length && <div className="empty-state">{copy.noPublished}</div>}</div><div className="shell inline-cta"><span>{copy.finalText}</span><Link href={localePath(locale, "request-quote")}>{copy.requestQuote}</Link></div></section>
  </>;
}
