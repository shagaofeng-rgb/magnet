import type { Metadata } from "next";
import { LocalizedApplicationsPage } from "@/components/LocalizedPages";
import { getDictionary, isLocale, localizedPageAlternates, type Locale } from "@/lib/i18n";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const current = isLocale(locale) ? locale : "en";
  const t = getDictionary(current);
  return { title: t.applications.seoTitle, description: t.applications.metaDescription, alternates: localizedPageAlternates(current, "/applications") };
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  return <LocalizedApplicationsPage locale={(isLocale(locale) ? locale : "en") as Locale} />;
}
