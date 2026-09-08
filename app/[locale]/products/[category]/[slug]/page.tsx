import { notFound, permanentRedirect } from "next/navigation";
import { metadataFor, ProductPage } from "@/app/[locale]/equipment/[slug]/ProductPage";
import { isLocale, type Locale } from "@/lib/i18n";
import { findProduct, findProductByLegacySlug, legacyCategoryPathForSlug, productCategoryPath, productPathFor, productSlugFor, publicProducts } from "@/lib/product-model";

export async function generateStaticParams() {
  return publicProducts.flatMap((product) => ["en", "es", "pt", "ar", "ru"].map((locale) => ({
    locale,
    category: productCategoryPath(product.familyId),
    slug: productSlugFor(locale as Locale, product),
  })));
}

function resolveCanonicalProduct(locale: Locale, category: string, slug: string) {
  const product = findProduct(locale, slug);
  if (product) return product;
  const historicalProduct = findProductByLegacySlug(locale, slug);
  if (historicalProduct) permanentRedirect(productPathFor(locale, historicalProduct));
  return undefined;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; category: string; slug: string }> }) {
  const { locale, category, slug } = await params;
  if (!isLocale(locale)) return {};
  const product = resolveCanonicalProduct(locale, category, slug);
  if (!product || productCategoryPath(product.familyId) !== category) return {};
  return metadataFor({ params: Promise.resolve({ locale, slug }) });
}

export default async function ProductRoute({ params }: { params: Promise<{ locale: string; category: string; slug: string }> }) {
  const { locale, category, slug } = await params;
  if (!isLocale(locale)) notFound();
  // Old URLs used /products/category/<old-family-slug>. Redirect only that
  // explicit legacy shape to the matching current family page.
  if (category === "category") {
    const legacyCategory = legacyCategoryPathForSlug(slug);
    if (legacyCategory) permanentRedirect(`/${locale}/products/${legacyCategory}`);
  }
  const product = resolveCanonicalProduct(locale, category, slug);
  if (!product) notFound();
  if (productCategoryPath(product.familyId) !== category) permanentRedirect(productPathFor(locale, product));
  return <ProductPage params={Promise.resolve({ locale, slug })} />;
}
