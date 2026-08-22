import { notFound, permanentRedirect } from "next/navigation";
import { isLocale, localePath } from "@/lib/i18n";

const replacements: Record<string, string> = {
  "mining-minerals": "mining-minerals",
  "coal-bulk-handling": "coal-bulk-handling",
  recycling: "recycling",
  "aggregates-quarrying": "cement-aggregates",
  "cement-building-materials": "cement-aggregates",
};

/** Legacy industry URLs retain their ranking signals through a single redirect. */
export default async function Industry({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const target = replacements[slug];
  if (!target) notFound();
  permanentRedirect(localePath(locale, `industry-solutions/${target}`));
}
