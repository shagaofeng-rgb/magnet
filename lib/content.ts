import type { Locale } from "./i18n";
import { publicProducts } from "./product-model";

export const families = [
  { key: "conveyor", slug: "conveyor-magnetic-separation", title: "Conveyor Magnetic Separators" },
  { key: "minerals", slug: "mineral-bulk-separation", title: "Mineral & Bulk Separation" },
  { key: "recycling", slug: "recycling-metal-sorting", title: "Recycling & Metal Sorting" },
  { key: "process", slug: "process-magnets-filters", title: "Process Magnets & Filters" }
] as const;
export const products = publicProducts.map((product) => ({ id: product.id, family: product.familyId, model: product.model, approvedImage: { src: product.media[0].src, alt: product.media[0].alt, ownershipStatus: "approved" as const }, locales: Object.fromEntries(Object.entries(product.locale).map(([locale, value]) => [locale, { title: value.title, summary: value.summary, slug: value.slug }])) as Record<Locale, { title: string; summary: string; slug: string }>, applications: product.applications.map((item) => item.title), principle: product.capabilities.join(" "), selection: product.selectionInputs, parameters: product.specifications.filter((item) => item.visibility === "public" && item.value).map((item) => ({ label: item.label, value: item.value!.value, status: "approved" as const })) }));
export const industries = ["mining-minerals", "coal-bulk-handling", "aggregates-quarrying", "cement-building-materials", "recycling"];
export const solutions = ["crusher-protection", "tramp-iron-removal", "material-purity", "ferrous-recovery", "non-ferrous-sorting", "fine-material-separation"];
export function productBySlug(locale: Locale, slug: string) { return products.find((product) => product.locales[locale].slug === slug); }
