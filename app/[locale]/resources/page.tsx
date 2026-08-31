import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { isLocale } from "@/lib/i18n";
import { pageTitle } from "@/lib/page-copy";
import { uiCopy } from "@/lib/ui-copy";
import { notFound } from "next/navigation";

// This legacy route remains usable for direct visitors while it is retired from
// search. Maintained editorial destinations are News and Blog.
export const metadata: Metadata = { robots: { index: false, follow: true } };
export default async function Resources({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = uiCopy[locale].resources;
  return <><PageHero eyebrow={copy.eyebrow} title={pageTitle("resources", locale)} intro={copy.intro} /><section className="section"><div className="shell grid">{copy.items.map((item, index) => <article className="card" key={item}><span className="product-code">{copy.guide} 0{index + 1}</span><h2>{item}</h2><p>{copy.description}</p></article>)}</div></section></>;
}
