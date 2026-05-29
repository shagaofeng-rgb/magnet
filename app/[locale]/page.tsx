import type { Metadata } from "next";
import { LocalizedHomePage } from "@/components/LocalizedPages";
import { getDictionary, isLocale, localizedPageAlternates, type Locale } from "@/lib/i18n";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const current = isLocale(locale) ? locale : "en";
  const t = getDictionary(current);
  return {
    title: t.home.seoTitle,
    description: t.home.metaDescription,
    alternates: localizedPageAlternates(current, "/"),
    openGraph: { title: t.home.seoTitle, description: t.home.metaDescription, images: ["/images/generated/home-hero-cowinmagnet.png"] }
  };
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  return <LocalizedHomePage locale={(isLocale(locale) ? locale : "en") as Locale} />;
}
