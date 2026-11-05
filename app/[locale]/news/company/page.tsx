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
  return { title: { absolute: `${copy.companyTitle} | BZMAGNET` }, description: copy.companyEyebrow, alternates: alternates(locale, "news/company") };
}

export default async function CompanyNews({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ page?: string }> }) {
  const [{ locale }, { page }] = await Promise.all([params, searchParams]);
  if (!isLocale(locale)) notFound();
  const copy = uiCopy[locale].news;
  const items = (await publishedNewsArticles(locale)).filter((item) => item.contentType === "company_news");
  return <NewsListing locale={locale} section="company" title={copy.companyTitle} intro={newsIntro[locale]}
    empty={copy.companyEmpty} articles={items} requestedPage={Number(page) || 1} />;
}
