import { permanentRedirect } from "next/navigation";
import { isLocale, localePath } from "@/lib/i18n";

export default async function About({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) permanentRedirect("/en/about-contact");
  permanentRedirect(localePath(locale, "about-contact"));
}
