import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { InquiryForm } from "@/components/InquiryForm";
import { isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/page-metadata";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { const { locale } = await params; return isLocale(locale) ? pageMetadata({ locale, path: "request-quote", title: "Request a Quote", description: "Send equipment and project details for a BZMAGNET quotation review.", robots: { index: false, follow: true } }) : {}; }
export default async function Page({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ product?: string; category?: string }> }) { const { locale } = await params; const query = await searchParams; if (!isLocale(locale)) notFound(); return <><PageHero eyebrow="Request a Quote" title="Request a Practical Equipment Quote" intro="Complete the grouped form with contact details, equipment requirements and project information."/><section className="section section-white"><div className="shell prose"><p className="notice">No public prices are displayed. An equipment scope is reviewed before a quotation is prepared.</p><InquiryForm variant="rfq" productCategory={query.category} productModel={query.product} locale={locale}/></div></section></>; }
