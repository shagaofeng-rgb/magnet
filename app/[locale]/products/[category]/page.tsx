import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { families, products } from "@/lib/content";
import { isLocale, localePath } from "@/lib/i18n";
import { pageMetadata } from "@/lib/page-metadata";

export async function generateStaticParams() { return families.flatMap((family) => ["en", "es", "pt", "ar", "ru"].map((locale) => ({ locale, category: family.slug }))); }
export async function generateMetadata({ params }: { params: Promise<{ locale: string; category: string }> }): Promise<Metadata> {
  const { locale, category } = await params;
  if (!isLocale(locale)) return {};
  const family = families.find((item) => item.slug === category);
  return family ? pageMetadata({ locale, path: `products/${category}`, title: `${family.title} Equipment`, description: `Review ${family.title.toLowerCase()} by material flow, target metal, installation and operating conditions.` }) : {};
}
export default async function Family({ params }: { params: Promise<{ locale: string; category: string }> }) {
  const { locale, category } = await params; if (!isLocale(locale)) notFound();
  const family = families.find((item) => item.slug === category); if (!family) notFound();
  const items = products.filter((product) => product.family === family.key);
  return <><PageHero eyebrow="Equipment family" title={family.title} intro="Shortlist by process condition, then confirm the final configuration against project data."/><section className="section"><div className="shell grid">{items.map((product) => <article className="card" key={product.id}><span className="product-code">{product.model}</span><h2>{product.locales[locale].title}</h2><p>{product.locales[locale].summary}</p><Link className="card-link" href={localePath(locale, `equipment/${product.locales[locale].slug}`)}>Review selection inputs <span aria-hidden="true">→</span></Link></article>)}</div></section></>;
}
