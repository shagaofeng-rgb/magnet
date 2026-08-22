import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { families, products } from "@/lib/content";
import { isLocale, type Locale } from "@/lib/i18n";
import { alternates } from "@/lib/seo";
import { findProduct, productPathFor, publicProducts } from "@/lib/product-model";
import { homeCopy } from "@/lib/site-copy";

export async function generateStaticParams() { return families.flatMap((family) => ["en", "es", "pt", "ar", "ru"].map((locale) => ({ locale, category: family.slug }))); }

const legacyCategoryRedirects: Record<string, string> = {
  "metal-recycling-equipment": "recycling-metal-sorting",
  "mining-magnetic-separation-equipment": "mineral-bulk-separation",
  "food-grade-magnetic-separators": "process-magnets-filters",
  "magnetic-components": "process-magnets-filters",
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string; category: string }> }): Promise<Metadata> {
  const { locale, category } = await params;
  if (!isLocale(locale)) return {};
  const family = families.find((item) => item.slug === category);
  if (!family) return { robots: { index: false, follow: true } };
  const familyIndex = families.findIndex((item) => item.key === family.key);
  const copy = homeCopy[locale];
  const title = copy.categories[familyIndex].title;
  return { title: `${title} | BZMAGNET`, description: copy.categories[familyIndex].description, alternates: alternates(locale, `products/${family.slug}`) };
}

export default async function Family({ params }: { params: Promise<{ locale: string; category: string }> }) {
  const { locale, category } = await params;
  if (!isLocale(locale)) notFound();
  const family = families.find((item) => item.slug === category);
  if (!family) {
    const mappedCategory = legacyCategoryRedirects[category];
    if (mappedCategory) permanentRedirect(`/${locale}/products/${mappedCategory}`);
    const legacyProduct = findProduct(locale as Locale, category);
    if (legacyProduct) permanentRedirect(productPathFor(locale as Locale, legacyProduct));
    notFound();
  }
  const copy = homeCopy[locale];
  const familyIndex = families.findIndex((item) => item.key === family.key);
  const items = products.filter((product) => product.family === family.key);
  if (!items.length) notFound();
  return <><PageHero eyebrow={copy.browseTitle} title={copy.categories[familyIndex].title} intro={copy.categories[familyIndex].description}/><section className="section"><div className="shell grid">{items.map((product) => { const record = publicProducts.find((item) => item.id === product.id); return <article className="card" key={product.id}><div className="card-media"><Image src={product.approvedImage.src} alt={product.approvedImage.alt[locale]} fill sizes="(max-width:700px) 100vw, 33vw" style={{ objectFit: "contain" }}/></div>{product.model && <span className="product-code">{product.model}</span>}<h2>{product.locales[locale].title}</h2><p>{product.locales[locale].summary}</p>{record && <Link className="card-link" href={productPathFor(locale, record)}>{copy.viewProduct} →</Link>}</article>})}</div></section></>;
}
