import type { Metadata } from "next";
import { LocalizedSimplePage } from "@/components/LocalizedPages";
import { getDictionary, isLocale, localizedPageAlternates, type Locale } from "@/lib/i18n";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const current = isLocale(locale) ? locale : "en";
  const t = getDictionary(current);
  return { title: t.projects.seoTitle, description: t.projects.metaDescription, alternates: localizedPageAlternates(current, "/projects") };
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  return <LocalizedSimplePage locale={(isLocale(locale) ? locale : "en") as Locale} page="projects" />;
}
