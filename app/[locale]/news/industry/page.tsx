import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NewsListing, newsIntro } from "@/components/NewsListing";
import { isLocale } from "@/lib/i18n";
import { publishedNewsArticles } from "@/lib/news-public";
import { alternates } from "@/lib/seo";
import { uiCopy } from "@/lib/ui-copy";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = uiCopy[locale].news;
  return { title: { absolute: `${copy.industryTitle} | BZMAGNET` }, description: copy.industryEyebrow, alternates: alternates(locale, "news/industry") };
}

export default async function IndustryNews({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ page?: string }> }) {
  const [{ locale }, { page }] = await Promise.all([params, searchParams]);
  if (!isLocale(locale)) notFound();
  const copy = uiCopy[locale].news;
  const items = (await publishedNewsArticles(locale)).filter((item) => item.contentType === "industry_news");
  return <NewsListing locale={locale} section="industry" title={copy.industryTitle} intro={newsIntro[locale]}
    empty={copy.industryEmpty} articles={items} requestedPage={Number(page) || 1} />;
}
