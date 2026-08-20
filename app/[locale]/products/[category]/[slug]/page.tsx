import { notFound } from "next/navigation";
import { metadataFor, ProductPage } from "@/app/[locale]/equipment/[slug]/ProductPage";
import { isLocale, type Locale } from "@/lib/i18n";
import { findProduct, productCategoryPath, publicProducts } from "@/lib/product-model";

export async function generateStaticParams() {
  return publicProducts.flatMap((product) => ["en", "es", "pt", "ar", "ru"].map((locale) => ({
    locale,
    category: productCategoryPath(product.familyId),
    slug: product.locale[locale as keyof typeof product.locale].slug,
  })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; category: string; slug: string }> }) {
  const { locale, category, slug } = await params;
  if (!isLocale(locale)) return {};
  const product = findProduct(locale as Locale, slug);
  if (!product || productCategoryPath(product.familyId) !== category) return {};
  return metadataFor({ params: Promise.resolve({ locale, slug }) });
}

export default async function ProductRoute({ params }: { params: Promise<{ locale: string; category: string; slug: string }> }) {
  const { locale, category, slug } = await params;
  if (!isLocale(locale)) notFound();
  const activeLocale = locale as Locale;
  const product = findProduct(activeLocale, slug);
  if (!product || productCategoryPath(product.familyId) !== category) notFound();
  return <ProductPage params={Promise.resolve({ locale: activeLocale, slug })} />;
}
