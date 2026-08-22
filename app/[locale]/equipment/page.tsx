import { permanentRedirect } from "next/navigation";
import { isLocale, localePath } from "@/lib/i18n";

/** Legacy equipment hub: retain inbound links without publishing a duplicate. */
export default async function Equipment({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) permanentRedirect("/en/products");
  permanentRedirect(localePath(locale, "products"));
}
