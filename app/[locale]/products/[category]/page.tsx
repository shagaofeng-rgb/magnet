import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { ProductCategoryCatalog } from "@/components/ProductCategoryCatalog";
import { families, products } from "@/lib/content";
import { isLocale, localePath, type Locale } from "@/lib/i18n";
import { alternates } from "@/lib/seo";
import { findProductByLegacySlug, legacyCategoryPathForSlug, productPathFor, publicProducts } from "@/lib/product-model";
import { homeCopy } from "@/lib/site-copy";
import { uiCopy } from "@/lib/ui-copy";

export async function generateStaticParams() { return families.flatMap((family) => ["en", "es", "pt", "ar", "ru"].map((locale) => ({ locale, category: family.slug }))); }

export async function generateMetadata({ params }: { params: Promise<{ locale: string; category: string }> }): Promise<Metadata> {
  const { locale, category } = await params;
  if (!isLocale(locale)) return {};
  const family = families.find((item) => item.slug === category);
  if (!family) return { robots: { index: false, follow: true } };
  const familyIndex = families.findIndex((item) => item.key === family.key);
  const copy = homeCopy[locale];
  const title = copy.categories[familyIndex].title;
  return { title: { absolute: `${title} | BZMAGNET` }, description: copy.categories[familyIndex].description, alternates: alternates(locale, `products/${family.slug}`) };
}

export default async function Family({ params }: { params: Promise<{ locale: string; category: string }> }) {
  const { locale, category } = await params;
  if (!isLocale(locale)) notFound();
  const family = families.find((item) => item.slug === category);
  if (!family) {
    const mappedCategory = legacyCategoryPathForSlug(category);
    if (mappedCategory) permanentRedirect(`/${locale}/products/${mappedCategory}`);
    const legacyProduct = findProductByLegacySlug(locale as Locale, category);
    if (legacyProduct) permanentRedirect(productPathFor(locale as Locale, legacyProduct));
    notFound();
  }
  const copy = homeCopy[locale];
  const familyIndex = families.findIndex((item) => item.key === family.key);
  const items = products.filter((product) => product.family === family.key);
  if (!items.length) notFound();
  const images: Record<string, string> = {
    conveyor: "/media/generated/category-conveyor-context.webp",
    minerals: "/media/generated/category-mineral-bulk-context.webp",
    recycling: "/media/generated/category-recycling-sorting-context.webp",
    process: "/media/generated/category-process-flow-context.webp",
  };
  const catalogItems = items.flatMap((product) => {
    const record = publicProducts.find((item) => item.id === product.id);
    if (!record) return [];
    return [{ id: product.id, title: product.locales[locale].title, summary: product.locales[locale].summary,
      model: product.model || undefined, productType: record.productType,
      image: product.approvedImage.src, alt: product.approvedImage.alt[locale], href: productPathFor(locale, record) }];
  });
  return <>
    <PageHero eyebrow={copy.browseTitle} title={copy.categories[familyIndex].title} intro={copy.categories[familyIndex].description}
      image={images[family.key]} ctaHref={localePath(locale, "request-quote")} ctaLabel={uiCopy[locale].footer.quote} />
    <section className="section catalog-section"><div className="shell">
      <ProductCategoryCatalog locale={locale} items={catalogItems} showMagnetFilters={family.key === "conveyor"} />
    </div></section>
  </>;
}
