import Link from "next/link";
import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { families,products } from "@/lib/content";
import { isLocale,localePath } from "@/lib/i18n";
import { pageTitle } from "@/lib/page-copy";
import {homeCopy} from "@/lib/site-copy";
import { notFound } from "next/navigation";
export const metadata: Metadata = { robots: { index: false, follow: true } };
export default async function Equipment({params}:{params:Promise<{locale:string}>}){const{locale}=await params;if(!isLocale(locale))notFound();const copy=homeCopy[locale];return <><PageHero eyebrow={copy.browseTitle} title={pageTitle("equipment",locale)} intro={copy.heroBody}/><section className="section"><div className="shell grid">{families.map((f,index)=><article className="card" key={f.key}><span className="product-code">{f.key}</span><h2>{copy.categories[index].title}</h2><p>{products.filter(p=>p.family===f.key).length}</p><Link className="card-link" href={localePath(locale,`products/${f.slug}`)}>{copy.viewCategory} →</Link></article>)}</div></section></>}
