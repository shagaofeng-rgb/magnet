import type { Metadata } from "next";
import { LocalizedProductsPage } from "@/components/LocalizedPages";
import { getDictionary, isLocale, localizedPageAlternates, type Locale } from "@/lib/i18n";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const current = isLocale(locale) ? locale : "en";
  const t = getDictionary(current);
  return { title: t.products.seoTitle, description: t.products.metaDescription, alternates: localizedPageAlternates(current, "/products") };
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  return <LocalizedProductsPage locale={(isLocale(locale) ? locale : "en") as Locale} />;
}
