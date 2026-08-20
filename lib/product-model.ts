import catalog from "@/data/products.generated.json";
import type { Locale } from "./i18n";

export type VerifiedValue<T = string> = { value: T; sourceId: string; conditions?: string; approvedAt: string };
export type Visibility = "public" | "on_request" | "hidden";
export type ProductLocale = { slug: string; title: string; summary: string; description: string; metaTitle: string; metaDescription: string; translatedAt?: string; reviewed: boolean };
export type ProductMedia = { assetId: string; src: string; alt: Record<Locale, string>; isPrimary: boolean; type: "product" | "diagram"; approved: boolean; aiGenerated: boolean };
export type ProductRecord = { id: string; status: "draft" | "approved" | "published" | "archived"; familyId: string; familyLabel: string; productType: string; verifiedName: string; model?: string; media: ProductMedia[]; applications: Array<{ title: string; context: string; placement: string; material: string }>; capabilities: string[]; selectionInputs: string[]; specifications: Array<{ label: string; value?: VerifiedValue; visibility: Visibility }>; options: Array<{ label: string; value?: VerifiedValue; visibility: Visibility }>; limitations: string[]; maintenance?: string[]; faq: Array<{ question: string; answer: string }>; relatedProductIds: string[]; locale: Record<Locale, ProductLocale> };

export const equipmentSegments: Record<Locale, string> = { en: "equipment", es: "equipos", pt: "equipamentos", ar: "المعدات", ru: "oborudovanie" };
/**
 * Public product URLs are BZMAGNET-owned category URLs.  The older
 * locale-specific equipment URLs remain aliases only and are redirected in a
 * single hop by their route handlers, so an existing inbound link is never
 * silently turned into a duplicate canonical page.
 */
export const productCategorySlugs: Record<string, string> = {
  conveyor: "conveyor-magnetic-separation",
  minerals: "mineral-bulk-separation",
  recycling: "recycling-metal-sorting",
  process: "process-magnets-filters",
};
export const productCategoryPath = (familyId: string) => productCategorySlugs[familyId] || "equipment";
export const productPath = (locale: Locale, slug: string, familyId?: string) => `/${locale}/products/${familyId ? productCategoryPath(familyId) : "equipment"}/${slug}`;
export const productPathFor = (locale: Locale, product: Pick<ProductRecord, "familyId" | "locale">) => productPath(locale, product.locale[locale].slug, product.familyId);
export const legacyProductPath = (locale: Locale, slug: string) => `/${locale}/${equipmentSegments[locale]}/${slug}`;
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
export function findProduct(locale: Locale, slug: string) { let decoded = slug; try { decoded = decodeURIComponent(slug); } catch {} const opaqueSuffix = decoded.match(/-([0-9a-f]{8})$/i)?.[1]; return publicProducts.find((product) => product.locale[locale].slug === decoded || (opaqueSuffix && product.id.startsWith(opaqueSuffix))); }
export function visibleRows(rows: ProductRecord["specifications"] | ProductRecord["options"]) { return rows.filter((row) => row.visibility !== "hidden").map((row) => ({ ...row, display: row.visibility === "on_request" ? "Available on request" : row.value?.conditions ? `${row.value.value} — ${row.value.conditions}` : row.value?.value || "Available on request" })); }
