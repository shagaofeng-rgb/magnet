import type { Metadata } from "next";
import { LocalizedContactPage } from "@/components/LocalizedPages";
import { getDictionary, isLocale, localizedPageAlternates, type Locale } from "@/lib/i18n";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const current = isLocale(locale) ? locale : "en";
  const t = getDictionary(current);
  return { title: t.contact.seoTitle, description: t.contact.metaDescription, alternates: localizedPageAlternates(current, "/contact") };
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  return <LocalizedContactPage locale={(isLocale(locale) ? locale : "en") as Locale} />;
}
