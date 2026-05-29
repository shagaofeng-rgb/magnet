import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LocalizedProductDetailPage } from "@/components/LocalizedPages";
import { products } from "@/data/products";
import { getDictionary, isLocale, locales, localizedPageAlternates, type Locale } from "@/lib/i18n";

type PageProps = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return locales.flatMap((locale) => products.map((product) => ({ locale, slug: product.slug })));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = products.find((item) => item.slug === slug);
  const current = isLocale(locale) ? locale : "en";
  const t = getDictionary(current);
  if (!product) return {};
  return {
    title: `${product.name} ${t.productDetail.manufacturer}`,
    description: product.summary,
    keywords: product.keywords,
    alternates: localizedPageAlternates(current, `/products/${product.slug}`),
    openGraph: { title: `${product.name} | COWIN MAGNET`, description: product.summary, images: [product.image] }
  };
}

export default async function Page({ params }: PageProps) {
  const { locale, slug } = await params;
  const product = products.find((item) => item.slug === slug);
  if (!product || !isLocale(locale)) notFound();
  return <LocalizedProductDetailPage locale={locale as Locale} product={product} />;
}
