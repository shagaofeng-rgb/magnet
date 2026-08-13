import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/page-metadata";
import { pageTitle } from "@/lib/page-copy";

const items = ["Separator selection checklist", "Conveyor data worksheet", "Material-test preparation", "Maintenance planning questions"];
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { const { locale } = await params; return isLocale(locale) ? pageMetadata({ locale, path: "resources", title: "Resources for Equipment Selection", description: "Practical procurement notes, checklists and planning questions for magnetic separation equipment comparison." }) : {}; }
export default async function Page({ params }: { params: Promise<{ locale: string }> }) { const { locale } = await params; if (!isLocale(locale)) notFound(); return <><PageHero eyebrow="Resources" title={pageTitle("resources", locale)} intro="Procurement notes written for practical technical comparison."/><section className="section"><div className="shell grid">{items.map((item, index) => <article className="card" key={item}><span className="product-code">GUIDE 0{index + 1}</span><h2>{item}</h2><p>Structured guidance with visible facts, review status and no placeholder sections.</p></article>)}</div></section></>; }
