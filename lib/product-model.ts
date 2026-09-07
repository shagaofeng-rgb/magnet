import catalog from "@/data/products.generated.json";
import type { Locale } from "./i18n";

export type VerifiedValue<T = string> = { value: T; sourceId: string; conditions?: string; approvedAt: string };
export type Visibility = "public" | "on_request" | "hidden";
export type ProductLocale = { slug: string; title: string; summary: string; description: string; metaTitle: string; metaDescription: string; translatedAt?: string; reviewed: boolean };
export type ProductMedia = { assetId: string; src: string; alt: Record<Locale, string>; isPrimary: boolean; type: "product" | "diagram"; approved: boolean; aiGenerated: boolean };
export type ProductRecord = { id: string; status: "draft" | "approved" | "published" | "archived"; familyId: string; familyLabel: string; productType: string; verifiedName: string; model?: string; media: ProductMedia[]; applications: Array<{ title: string; context: string; placement: string; material: string }>; capabilities: string[]; selectionInputs: string[]; specifications: Array<{ label: string; value?: VerifiedValue; visibility: Visibility }>; options: Array<{ label: string; value?: VerifiedValue; visibility: Visibility }>; limitations: string[]; maintenance?: string[]; faq: Array<{ question: string; answer: string }>; relatedProductIds: string[]; locale: Record<Locale, ProductLocale> };

export const equipmentSegments: Record<Locale, string> = { en: "equipment", es: "equipos", pt: "equipamentos", ar: "المعدات", ru: "oborudovanie" };
export const productCategorySlugs: Record<string, string> = {
  conveyor: "conveyor-magnetic-separation",
  minerals: "mineral-bulk-separation",
  recycling: "recycling-metal-sorting",
  process: "process-magnets-filters",
};
export const productCategoryPath = (familyId: string) => productCategorySlugs[familyId] || "equipment";

const denied = /cowin|TBD|Update Note|sourceClaims|```|manufacturer|guaranteed/i;
export function validateProductForPublication(product: ProductRecord) {
  const errors: string[] = [];
  if (product.status !== "published") errors.push("status");
  for (const [code, value] of Object.entries(product.locale)) {
    if (!value.title || !value.slug || !value.metaTitle || !value.metaDescription || !value.reviewed) errors.push(`locale-${code}`);
    if (denied.test(JSON.stringify(value))) errors.push(`public-copy-${code}`);
  }
  if (!product.media.some((media) => media.type === "product" && media.approved && !media.aiGenerated)) errors.push("product-image-approval");
  for (const fact of [...product.specifications, ...product.options]) if (fact.visibility === "public" && (!fact.value?.sourceId || !fact.value.approvedAt)) errors.push(`unverified-${fact.label}`);
  if (product.faq.length < 3 || product.faq.length > 6 || new Set(product.faq.map((item) => item.question.toLowerCase())).size !== product.faq.length) errors.push("faq");
  const facts = JSON.stringify(product.specifications).toLowerCase();
  if (facts.includes("permanent") && facts.includes("electromagnetic")) errors.push("magnet-conflict");
  return errors;
}
export const productRecords = catalog.products as ProductRecord[];
export const publicProducts = productRecords.filter((product) => validateProductForPublication(product).length === 0);

function decodedSlug(value: string) {
  try { return decodeURIComponent(value); } catch { return value; }
}

/** Generates a human-readable BZMAGNET URL from the approved localized title. */
function slugStem(value: string) {
  const stem = value
    .normalize("NFKD")
    .replace(/\p{Mark}/gu, "")
    .toLocaleLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72)
    .replace(/-+$/g, "");
  return stem || "magnetic-separation-equipment";
}

export function productSlugFor(locale: Locale, product: Pick<ProductRecord, "id" | "locale">) {
  return `${slugStem(product.locale[locale].title)}-${product.id.slice(0, 8)}`;
}

/** The only URL emitted for a product in public navigation, metadata and sitemaps. */
export const productPath = (locale: Locale, slug: string, familyId?: string) => `/${locale}/products/${familyId ? productCategoryPath(familyId) : "equipment"}/${slug}`;
export const productPathFor = (locale: Locale, product: Pick<ProductRecord, "id" | "familyId" | "locale">) => productPath(locale, productSlugFor(locale, product), product.familyId);
export const legacyProductPath = (locale: Locale, slug: string) => `/${locale}/${equipmentSegments[locale]}/${slug}`;

/**
 * Strict canonical lookup. A suffix alone is deliberately insufficient: accepting
 * arbitrary text before an ID created an unbounded set of duplicate 200 URLs.
 */
export function findProduct(locale: Locale, slug: string) {
  const decoded = decodedSlug(slug);
  return publicProducts.find((product) => productSlugFor(locale, product) === decoded);
}

/** Resolves a known historical product URL only so the route can redirect once. */
export function findProductByLegacySlug(locale: Locale, slug: string) {
  const decoded = decodedSlug(slug);
  const opaqueSuffix = decoded.match(/-([0-9a-f]{8})$/i)?.[1];
  return publicProducts.find((product) =>
    product.locale[locale].slug === decoded ||
    (opaqueSuffix ? product.id.startsWith(opaqueSuffix) : false),
  );
}

/**
 * Non-English product detail pages remain available to buyers, but are withheld
 * from search indexing until their full product details are independently
 * localized. The English source record is the current complete public version.
 */
export function isProductLocaleIndexable(locale: Locale) {
  return locale === "en";
}

export function visibleRows(rows: ProductRecord["specifications"] | ProductRecord["options"]) {
  return rows.filter((row) => row.visibility !== "hidden").map((row) => ({
    ...row,
    display: row.visibility === "on_request" ? "Available on request" : row.value?.conditions ? `${row.value.value} — ${row.value.conditions}` : row.value?.value || "Available on request",
  }));
}
