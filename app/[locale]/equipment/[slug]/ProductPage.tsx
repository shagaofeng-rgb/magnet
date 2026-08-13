import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/ProductDetail";
import { isLocale, origin } from "@/lib/i18n";
import { findProduct, productPath } from "@/lib/product-model";
import { alternates } from "@/lib/seo";

export async function metadataFor({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const product = findProduct(locale, slug);
  if (!product) return {};
  const localized = product.locale[locale];
  const path = productPath(locale, localized.slug).split(`/${locale}/`)[1];
  const image = product.media.find((item) => item.isPrimary);
  return { title: localized.metaTitle, description: localized.metaDescription, alternates: alternates(locale, path), openGraph: { title: localized.metaTitle, description: localized.metaDescription, url: `${origin}${productPath(locale, localized.slug)}`, images: image ? [{ url: `${origin}${image.src}`, alt: image.alt[locale] }] : undefined } };
}
export async function ProductPage({ params }: { params: Promise<{ locale: string; slug: string }> }) { const { locale, slug } = await params; if (!isLocale(locale)) notFound(); const product = findProduct(locale, slug); if (!product) notFound(); return <ProductDetail product={product} locale={locale}/>; }
