import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { articlePath } from "@/lib/editorial";
import { isLocale } from "@/lib/i18n";
import { publishedNewsArticles } from "@/lib/news-public";
import { uiCopy } from "@/lib/ui-copy";
import { alternates } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params; if (!isLocale(locale)) return {};
  const copy = uiCopy[locale].news;
  return { title: { absolute: `${copy.companyTitle} | BZMAGNET` }, description: copy.companyEyebrow, alternates: alternates(locale, "news/company") };
}

export const dynamic = "force-dynamic";
export default async function CompanyNews({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; if (!isLocale(locale)) notFound();
  const copy = uiCopy[locale].news;
  const items = (await publishedNewsArticles(locale)).filter((item) => item.contentType === "company_news");
  return <section className="editorial-section"><div className="shell"><span className="eyebrow">{copy.companyEyebrow}</span><h1>{copy.companyTitle}</h1><div className="article-grid">{items.map((item) => <Link key={item.id} href={articlePath(item)}><time>{item.publishedAt}</time><h2>{item.title}</h2><p>{item.summary}</p></Link>)}{!items.length && <p className="empty-state">{copy.companyEmpty}</p>}</div></div></section>;
}
