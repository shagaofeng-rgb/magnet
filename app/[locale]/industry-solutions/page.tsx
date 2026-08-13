import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { isLocale, localePath } from "@/lib/i18n";
import { industryNavigation } from "@/lib/navigation";
import { pageMetadata } from "@/lib/page-metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { const { locale } = await params; return isLocale(locale) ? pageMetadata({ locale, path: "industry-solutions", title: "Industry Solutions", description: "Review magnetic separation considerations for mining, cement, recycling and bulk material handling applications." }) : {}; }
export default async function Page({ params }: { params: Promise<{ locale: string }> }) { const { locale } = await params; if (!isLocale(locale)) notFound(); return <><PageHero eyebrow="Applications" title="Industry Solutions" intro="Start with the process environment and separation objective before choosing an equipment family."/><section className="section"><div className="shell grid">{industryNavigation.map((item, index) => <article className="card" key={item.slug}><span className="product-code">0{index + 1}</span><h2>{item.title}</h2><p>Define material, throughput, target metal and installation constraints for this industry.</p><Link className="card-link" href={localePath(locale, `industry-solutions/${item.slug}`)}>Open solution <span aria-hidden="true">→</span></Link></article>)}</div></section></>; }
