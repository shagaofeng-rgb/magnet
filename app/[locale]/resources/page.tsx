import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { isLocale } from "@/lib/i18n";
import { pageTitle } from "@/lib/page-copy";
import { notFound } from "next/navigation";

// This legacy route remains usable for direct visitors while it is retired from
// search. Maintained editorial destinations are News and Blog.
export const metadata: Metadata = { robots: { index: false, follow: true } };
const items = ["Separator selection checklist", "Conveyor data worksheet", "Material-test preparation", "Maintenance planning questions"];
export default async function Resources({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <><PageHero eyebrow="Resources" title={pageTitle("resources", locale)} intro="Procurement notes written for practical technical comparison." /><section className="section"><div className="shell grid">{items.map((item, index) => <article className="card" key={item}><span className="product-code">GUIDE 0{index + 1}</span><h2>{item}</h2><p>Structured guidance with visible facts, review status and no placeholder sections.</p></article>)}</div></section></>;
}
