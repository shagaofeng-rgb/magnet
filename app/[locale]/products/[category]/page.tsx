import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { families, products } from "@/lib/content";
import { isLocale } from "@/lib/i18n";
import { productPath } from "@/lib/product-model";
import { homeCopy } from "@/lib/site-copy";

export async function generateStaticParams() { return families.flatMap((family) => ["en", "es", "pt", "ar", "ru"].map((locale) => ({ locale, category: family.slug }))); }
export default async function Family({ params }: { params: Promise<{ locale: string; category: string }> }) {
  const { locale, category } = await params;
  if (!isLocale(locale)) notFound();
  const family = families.find((item) => item.slug === category);
  if (!family) notFound();
  const copy = homeCopy[locale];
  const familyIndex = families.findIndex((item) => item.key === family.key);
  const items = products.filter((product) => product.family === family.key);
  if (!items.length) notFound();
  return <><PageHero eyebrow={copy.browseTitle} title={copy.categories[familyIndex].title} intro={copy.categories[familyIndex].description}/><section className="section"><div className="shell grid">{items.map((product) => <article className="card" key={product.id}><div className="card-media"><Image src={product.approvedImage.src} alt={product.approvedImage.alt[locale]} fill sizes="(max-width:700px) 100vw, 33vw" style={{ objectFit: "contain" }}/></div>{product.model && <span className="product-code">{product.model}</span>}<h2>{product.locales[locale].title}</h2><p>{product.locales[locale].summary}</p><Link className="card-link" href={productPath(locale, product.locales[locale].slug)}>{copy.viewProduct} →</Link></article>)}</div></section></>;
}
