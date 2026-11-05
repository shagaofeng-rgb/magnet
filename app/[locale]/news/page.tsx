import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NewsListing, newsIntro } from "@/components/NewsListing";
import { isLocale, origin } from "@/lib/i18n";
import { publishedNewsArticles } from "@/lib/news-public";
import { alternates } from "@/lib/seo";
import { homeCopy } from "@/lib/site-copy";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = homeCopy[locale];
  return { title: { absolute: `${copy.newsHeading} | BZMAGNET` }, description: newsIntro[locale], alternates: { ...alternates(locale, "news"), types: { "application/rss+xml": `${origin}/news/rss.xml` } } };
}

export default async function News({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ page?: string }> }) {
  const [{ locale }, { page }] = await Promise.all([params, searchParams]);
  if (!isLocale(locale)) notFound();
  const copy = homeCopy[locale];
  const items = await publishedNewsArticles(locale);
  return <NewsListing locale={locale} section="all" title={copy.newsHeading} intro={newsIntro[locale]}
    empty={copy.noPublished} articles={items} requestedPage={Number(page) || 1} />;
}
