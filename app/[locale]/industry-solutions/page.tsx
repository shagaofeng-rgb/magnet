import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { isLocale, localePath } from "@/lib/i18n";
import { industryNavigation } from "@/lib/navigation";
import { alternates } from "@/lib/seo";
import { homeCopy } from "@/lib/site-copy";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = homeCopy[locale];
  return { title: { absolute: `${copy.industryTitle} | BZMAGNET` }, description: copy.industryDescription, alternates: alternates(locale, "industry-solutions") };
}

export default async function IndustrySolutions({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = homeCopy[locale];
  return <><PageHero eyebrow={copy.industryTitle} title={copy.industryTitle} intro={copy.industryDescription} /><section className="section"><div className="shell grid">{industryNavigation.map((item, index) => <article className="card" key={item.slug}><span className="product-code">0{index + 1}</span><h2>{copy.industries[index].title}</h2><p>{copy.industryDescription}</p><Link className="card-link" href={localePath(locale, `industry-solutions/${item.slug}`)}>{copy.exploreSolution} →</Link></article>)}</div></section></>;
}
