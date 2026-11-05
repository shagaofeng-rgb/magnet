import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { QuoteForm } from "@/components/QuoteForm";
import { isLocale, type Locale } from "@/lib/i18n";
import { productPathFor, publicProducts } from "@/lib/product-model";
import { alternates } from "@/lib/seo";
import { quoteCopy } from "@/lib/site-copy";

const headings: Record<Locale, { checklist: string; form: string }> = {
  en: { checklist: "Useful details to prepare", form: "Tell us about your project" },
  es: { checklist: "Datos útiles para preparar", form: "Cuéntenos sobre su proyecto" },
  pt: { checklist: "Dados úteis para preparar", form: "Conte-nos sobre seu projeto" },
  ar: { checklist: "معلومات مفيدة للتحضير", form: "أخبرنا عن مشروعك" },
  ru: { checklist: "Полезные данные для подготовки", form: "Расскажите о проекте" },
};

const productCopy: Record<Locale, { back: string; selected: string; model: string }> = {
  en: { back: "Back to product", selected: "Equipment for this enquiry", model: "Model" },
  es: { back: "Volver al producto", selected: "Equipo para esta consulta", model: "Modelo" },
  pt: { back: "Voltar ao produto", selected: "Equipamento desta consulta", model: "Modelo" },
  ar: { back: "العودة إلى المنتج", selected: "المعدات لهذا الاستفسار", model: "الطراز" },
  ru: { back: "Вернуться к изделию", selected: "Оборудование для запроса", model: "Модель" },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = quoteCopy[locale];
  return { title: { absolute: `${copy.title} | BZMAGNET` }, description: copy.intro, alternates: alternates(locale, "request-quote") };
}

export default async function Page({ params, searchParams }: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ product?: string | string[] }>;
}) {
  const [{ locale }, { product: productId }] = await Promise.all([params, searchParams]);
  if (!isLocale(locale)) notFound();
  const copy = quoteCopy[locale];
  const product = typeof productId === "string" ? publicProducts.find((item) => item.id === productId) : undefined;

  if (product) {
    const t = productCopy[locale];
    const title = product.locale[locale].title;
    const productPath = productPathFor(locale, product);
    return <section className="product-quote">
      <div className="shell">
        <Link className="product-quote-back" href={productPath}>{t.back}</Link>
        <h1>{copy.eyebrow}</h1>
        <div className="product-quote-context">
          <span>{t.selected}</span>
          <strong>{title}</strong>
          {product.model && <span>{t.model} <bdi>{product.model}</bdi></span>}
        </div>
        <p>{copy.intro}</p>
        <QuoteForm locale={locale} productAttribution={{
          context: "product-detail",
          product: product.id,
          product_name: title.slice(0, 120),
          source: decodeURI(productPath).slice(0, 120),
        }} />
      </div>
    </section>;
  }

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
