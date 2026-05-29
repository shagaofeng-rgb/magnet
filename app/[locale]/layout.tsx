import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { getDirection, isLocale, locales, type Locale } from "@/lib/i18n";

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <div className="locale-shell" lang={locale} dir={getDirection(locale as Locale)}>
      {children}
    </div>
  );
}
