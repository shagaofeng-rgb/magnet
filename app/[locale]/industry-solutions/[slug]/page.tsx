import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContextDetail } from "@/components/ContextDetail";
import { isLocale, locales } from "@/lib/i18n";
import { industryNavigation } from "@/lib/navigation";
import { itemNames } from "@/lib/page-copy";
import { alternates } from "@/lib/seo";
import { uiCopy } from "@/lib/ui-copy";

export function generateStaticParams() { return locales.flatMap((locale) => industryNavigation.map(({ slug }) => ({ locale, slug }))); }

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale) || !industryNavigation.some((item) => item.slug === slug)) return { robots: { index: false, follow: true } };
  const name = itemNames[slug]?.[locale] || slug;
  return {
    title: { absolute: `${name} Magnetic Separation | BZMAGNET` },
    description: `${name}: ${uiCopy[locale].context.intro}`,
    alternates: alternates(locale, `industry-solutions/${slug}`),
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale) || !industryNavigation.some((item) => item.slug === slug)) notFound();
  return <ContextDetail locale={locale} slug={slug} type="industry" />;
}
