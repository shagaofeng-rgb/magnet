import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LocalizedApplicationDetailPage } from "@/components/LocalizedPages";
import { applications } from "@/data/applications";
import { getDictionary, isLocale, locales, localizedPageAlternates, type Locale } from "@/lib/i18n";

type PageProps = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return locales.flatMap((locale) => applications.map((application) => ({ locale, slug: application.slug })));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const application = applications.find((item) => item.slug === slug);
  const current = isLocale(locale) ? locale : "en";
  if (!application) return {};
  return { title: `${application.name} Magnetic Separator Solutions`, description: application.summary, alternates: localizedPageAlternates(current, `/applications/${application.slug}`) };
}

export default async function Page({ params }: PageProps) {
  const { locale, slug } = await params;
  const application = applications.find((item) => item.slug === slug);
  if (!application || !isLocale(locale)) notFound();
  return <LocalizedApplicationDetailPage locale={locale as Locale} application={application} />;
}
