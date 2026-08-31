import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/ProductDetail";
import { isLocale, locales, origin, type Locale } from "@/lib/i18n";
import { findProduct, productPathFor } from "@/lib/product-model";

export async function metadataFor({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const activeLocale = locale as Locale;
  const product = findProduct(activeLocale, slug);
  if (!product) return {};
  const localized = product.locale[activeLocale];
  const publicPath = productPathFor(activeLocale, product);
  const image = product.media.find((item) => item.isPrimary);
  const languages = Object.fromEntries(locales.map((code) => [code, `${origin}${productPathFor(code, product)}`]));
  return { title: { absolute: localized.metaTitle }, description: localized.metaDescription, alternates: { canonical: `${origin}${publicPath}`, languages: { ...languages, "x-default": `${origin}${productPathFor("en", product)}` } }, openGraph: { title: localized.metaTitle, description: localized.metaDescription, url: `${origin}${publicPath}`, images: image ? [{ url: `${origin}${image.src}`, alt: image.alt[activeLocale] }] : undefined } };
}
export async function ProductPage({ params }: { params: Promise<{ locale: string; slug: string }> }) { const { locale, slug } = await params; if (!isLocale(locale)) notFound(); const activeLocale = locale as Locale; const product = findProduct(activeLocale, slug); if (!product) notFound(); return <ProductDetail product={product} locale={activeLocale}/>; }
