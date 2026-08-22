import { permanentRedirect } from "next/navigation";
import { isLocale, localePath } from "@/lib/i18n";

export default async function Industries({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) permanentRedirect("/en/industry-solutions");
  permanentRedirect(localePath(locale, "industry-solutions"));
}
