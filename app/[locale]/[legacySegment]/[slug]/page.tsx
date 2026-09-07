import { notFound, permanentRedirect } from "next/navigation";
import { equipmentSegments, findProductByLegacySlug, productPathFor } from "@/lib/product-model";
import { isLocale, type Locale } from "@/lib/i18n";

/**
 * Retains historical locale-specific equipment URLs as one-hop permanent
 * redirects. Static public routes such as /products and /news win before this
 * fallback route, so only legacy two-segment product paths reach this handler.
 */
export default async function LegacyEquipmentRoute({
  params,
}: {
  params: Promise<{ locale: string; legacySegment: string; slug: string }>;
}) {
  const { locale, legacySegment, slug } = await params;
  if (!isLocale(locale)) notFound();
  const activeLocale = locale as Locale;
  if (legacySegment !== equipmentSegments[activeLocale]) notFound();

  const product = findProductByLegacySlug(activeLocale, slug);
  if (!product) notFound();
  permanentRedirect(productPathFor(activeLocale, product));
}
