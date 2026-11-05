import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { families, products } from "@/lib/content";
import { isLocale, localePath, type Locale } from "@/lib/i18n";
import { alternates } from "@/lib/seo";
import { homeCopy } from "@/lib/site-copy";
import { uiCopy } from "@/lib/ui-copy";

const sectionTitles: Record<Locale, string> = {
  en: "Find the right starting point", es: "Encuentre el punto de partida adecuado",
  pt: "Encontre o ponto de partida certo", ar: "ابدأ من فئة المعدات المناسبة",
  ru: "Выберите отправную точку",
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = homeCopy[locale];
  return { title: { absolute: `${copy.browseTitle} | BZMAGNET` }, description: copy.heroBody, alternates: alternates(locale, "products") };
}

export default async function Products({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const activeLocale = locale as Locale;
  const copy = homeCopy[activeLocale];
  const familyImages = [
    "/media/generated/category-conveyor-context.webp",
    "/media/generated/category-mineral-bulk-context.webp",
    "/media/generated/category-recycling-sorting-context.webp",
    "/media/generated/category-process-flow-context.webp",
  ];
  return <>
    <PageHero eyebrow={copy.browseTitle} title={copy.browseTitle} intro={copy.heroBody}
      ctaHref={localePath(activeLocale, "request-quote")} ctaLabel={uiCopy[activeLocale].footer.quote} />
    <section className="section listing-section"><div className="shell">
      <div className="section-head"><div><span className="eyebrow">{copy.browseTitle}</span><h2>{sectionTitles[activeLocale]}</h2></div><p>{copy.heroBody}</p></div>
      <div className="family-grid">{families.map((family, index) => {
        const count = products.filter((product) => product.family === family.key).length;
        return <article className="family-card" key={family.key}>
          <div className="family-media"><Image src={familyImages[index]} alt="" fill sizes="(max-width:700px) 100vw, 25vw" /></div>
          <div className="family-card-body"><span className="eyebrow">{String(index + 1).padStart(2, "0")} / {family.key}</span>
            <h3>{copy.categories[index].title}</h3><p>{copy.categories[index].description}</p>
            <small>{uiCopy[activeLocale].approvedRecords(count)}</small>
            <Link className="card-link" href={localePath(activeLocale, `products/${family.slug}`)}>{copy.viewCategory} <span aria-hidden="true">→</span></Link>
          </div>
        </article>;
      })}</div>
    </div></section>
  </>;
}
