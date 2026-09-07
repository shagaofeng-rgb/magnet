import { notFound, permanentRedirect } from "next/navigation";
import { findProductByLegacySlug, productPathFor } from "@/lib/product-model";
import { isLocale, type Locale } from "@/lib/i18n";

/** Compatibility route for the former English equipment URL pattern. */
export default async function LegacyEnglishEquipmentRoute({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const activeLocale = locale as Locale;
  const product = findProductByLegacySlug(activeLocale, slug);
  if (!product) notFound();
  permanentRedirect(productPathFor(activeLocale, product));
}
