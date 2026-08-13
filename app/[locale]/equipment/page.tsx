import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { families, products } from "@/lib/content";
import { isLocale, localePath } from "@/lib/i18n";
import { pageMetadata } from "@/lib/page-metadata";
import { pageTitle } from "@/lib/page-copy";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { const { locale } = await params; return isLocale(locale) ? pageMetadata({ locale, path: "products", title: "Products & Equipment", description: "Compare magnetic separation equipment by material flow, target metal, installation position and cleaning duty." }) : {}; }
export default async function Equipment({ params }: { params: Promise<{ locale: string }> }) { const { locale } = await params; if (!isLocale(locale)) notFound(); return <><PageHero eyebrow="Equipment" title={pageTitle("equipment", locale)} intro="Compare equipment by material flow, target metal, installation and cleaning duty."/><section className="section"><div className="shell grid">{families.map((family) => <article className="card" key={family.key}><span className="product-code">{family.key}</span><h2>{family.title}</h2><p>{products.filter((product) => product.family === family.key).length} reviewed starting point(s).</p><Link className="card-link" href={localePath(locale, `products/${family.slug}`)}>Open family <span aria-hidden="true">→</span></Link></article>)}</div></section></>; }
