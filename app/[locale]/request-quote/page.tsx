import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { QuoteForm } from "@/components/QuoteForm";
import { isLocale, type Locale } from "@/lib/i18n";
import { alternates } from "@/lib/seo";
import { quoteCopy } from "@/lib/site-copy";

const headings: Record<Locale, { checklist: string; form: string }> = {
  en: { checklist: "Useful details to prepare", form: "Tell us about your project" },
  es: { checklist: "Datos útiles para preparar", form: "Cuéntenos sobre su proyecto" },
  pt: { checklist: "Dados úteis para preparar", form: "Conte-nos sobre seu projeto" },
  ar: { checklist: "معلومات مفيدة للتحضير", form: "أخبرنا عن مشروعك" },
  ru: { checklist: "Полезные данные для подготовки", form: "Расскажите о проекте" },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = quoteCopy[locale];
  return { title: { absolute: `${copy.title} | BZMAGNET` }, description: copy.intro, alternates: alternates(locale, "request-quote") };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = quoteCopy[locale];
  return <>
    <PageHero eyebrow={copy.eyebrow} title={copy.title} intro={copy.intro} />
    <section className="section quote-section"><div className="shell quote-layout">
      <aside className="quote-aside"><span className="eyebrow">{copy.eyebrow}</span><h2>{headings[locale].checklist}</h2>
        <ul><li>{copy.name}</li><li>{copy.company}</li><li>{copy.material}</li><li>{copy.process}</li></ul>
      </aside>
      <div className="quote-form-column"><h2>{headings[locale].form}</h2><QuoteForm locale={locale} /></div>
    </div></section>
  </>;
}
