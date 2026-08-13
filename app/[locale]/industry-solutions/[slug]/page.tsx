import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContextDetail } from "@/components/ContextDetail";
import { isLocale, locales } from "@/lib/i18n";
import { industryNavigation } from "@/lib/navigation";
import { pageMetadata } from "@/lib/page-metadata";

export function generateStaticParams() { return locales.flatMap((locale) => industryNavigation.map(({ slug }) => ({ locale, slug }))); }
export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> { const { locale, slug } = await params; if (!isLocale(locale)) return {}; const item = industryNavigation.find((entry) => entry.slug === slug); return item ? pageMetadata({ locale, path: `industry-solutions/${slug}`, title: item.title, description: `Selection guidance for ${item.title.toLowerCase()} magnetic separation applications.` }) : {}; }
export default async function Page({ params }: { params: Promise<{ locale: string; slug: string }> }) { const { locale, slug } = await params; if (!isLocale(locale) || !industryNavigation.some((item) => item.slug === slug)) notFound(); return <ContextDetail locale={locale} slug={slug} type="industry"/>; }
