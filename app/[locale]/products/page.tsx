import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { families, products } from "@/lib/content";
import { isLocale, localePath, type Locale } from "@/lib/i18n";
import { alternates } from "@/lib/seo";
import { homeCopy } from "@/lib/site-copy";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = homeCopy[locale];
  return { title: `${copy.browseTitle} | BZMAGNET`, description: copy.heroBody, alternates: alternates(locale, "products") };
}

export default async function Products({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const activeLocale = locale as Locale;
  const copy = homeCopy[activeLocale];
  return <><PageHero eyebrow={copy.browseTitle} title={copy.browseTitle} intro={copy.heroBody} /><section className="section"><div className="shell grid">{families.map((family, index) => <article className="card" key={family.key}><span className="product-code">{family.key}</span><h2>{copy.categories[index].title}</h2><p>{copy.categories[index].description}</p><p>{products.filter((product) => product.family === family.key).length} approved equipment records</p><Link className="card-link" href={localePath(activeLocale, `products/${family.slug}`)}>{copy.viewCategory} →</Link></article>)}</div></section></>;
}
