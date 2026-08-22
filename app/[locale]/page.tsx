import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { families } from "@/lib/content";
import { categoryImages, homeCopy, industrySlugs } from "@/lib/site-copy";
import { isLocale, localePath, origin } from "@/lib/i18n";
import { alternates } from "@/lib/seo";

export const dynamic = "force-dynamic";

const industryImages = ["industry-mining.png", "industry-cement.png", "industry-recycling.png", "industry-coal.png"];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = homeCopy[locale];
  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    alternates: alternates(locale),
    openGraph: {
      title: copy.metaTitle,
      description: copy.metaDescription,
      url: `${origin}/${locale}`,
      siteName: "BZMAGNET",
      type: "website",
      images: [{ url: `${origin}/media/generated/home-hero-v2.png`, width: 1536, height: 1024, alt: copy.heroAlt }],
    },
  };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = homeCopy[locale];
  const selectionSteps = copy.checklist.slice(0, 4);
  const schemas = [
    { "@context": "https://schema.org", "@type": "Organization", name: "BZMAGNET", url: origin },
    { "@context": "https://schema.org", "@type": "WebSite", name: "BZMAGNET", url: origin, inLanguage: locale },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: copy.home ?? "BZMAGNET", url: `${origin}/${locale}` }] },
  ];

  return <>
    {schemas.map((data, index) => <JsonLd key={index} data={data} />)}
    <section className="reference-hero">
      <div className="shell reference-hero-grid">
        <div className="reference-hero-copy">
          <p className="reference-eyebrow">{copy.eyebrow}</p><span className="reference-rule" aria-hidden="true" />
          <h1>{copy.heroTitle}</h1><p className="reference-lead">{copy.heroBody}</p>
          <div className="reference-actions"><Link className="reference-button reference-button-orange" href={localePath(locale, "products")}>{copy.exploreProducts}</Link><Link className="reference-button reference-button-outline" href={localePath(locale, "request-quote")}>{copy.requestQuote}</Link></div>
        </div>
        <div className="reference-hero-media"><Image src="/media/generated/home-hero-v2.png" alt={copy.heroAlt} fill priority sizes="(max-width: 940px) 100vw, 53vw" /></div>
      </div>
    </section>
    <section className="reference-section reference-families">
      <div className="shell"><div className="reference-section-heading"><p className="reference-eyebrow">{copy.browseTitle}</p><h2>{copy.browseTitle}</h2></div>
        <div className="reference-family-grid">{families.map((family, index) => <Link key={family.key} className="reference-family-card" href={localePath(locale, `products/${family.slug}`)}>
          <div className="reference-family-image"><Image src={`/media/generated/${categoryImages[index]}`} alt={copy.categories[index].title} fill sizes="(max-width: 620px) 100vw, (max-width: 960px) 50vw, 25vw" /></div>
          <div className="reference-family-copy"><h3>{copy.categories[index].title}</h3><p>{copy.categories[index].description}</p><span>{copy.viewCategory} <b aria-hidden="true">→</b></span></div>
        </Link>)}</div>
      </div>
    </section>
    <section className="reference-selection">
      <div className="shell reference-selection-inner">
        <div className="reference-selection-intro"><p className="reference-eyebrow">{copy.quoteEyebrow}</p><h2>{copy.checklistTitle}</h2><p>{copy.checklistNote}</p></div>
        <ol className="reference-selection-steps">{selectionSteps.map((step, index) => <li key={step}><span className="reference-step-number">{String(index + 1).padStart(2, "0")}</span><div><h3>{step}</h3><p>{copy.checklist[index + 1] ?? copy.checklistNote}</p></div></li>)}</ol>
        <Link className="reference-selection-link" href={`${localePath(locale, "request-quote")}?context=homepage-selection-guide`}>{copy.sendRequirements} <b aria-hidden="true">→</b></Link>
      </div>
    </section>
    <section className="reference-section reference-industries">
      <div className="shell"><div className="reference-industry-heading"><div><p className="reference-eyebrow">{copy.industryTitle}</p><h2>{copy.industryTitle}</h2></div><Link href={localePath(locale, "industry-solutions")}>{copy.exploreSolution} <b aria-hidden="true">→</b></Link></div>
        <div className="reference-industry-grid">{industrySlugs.map((slug, index) => <Link key={slug} className="reference-industry-card" href={localePath(locale, `industry-solutions/${slug}`)}>
          <div className="reference-industry-image"><Image src={`/media/generated/${industryImages[index]}`} alt={copy.industries[index].alt} fill sizes="(max-width: 620px) 100vw, (max-width: 960px) 50vw, 25vw" /></div><h3>{copy.industries[index].title}</h3><p>{copy.industryDescription}</p><span aria-hidden="true">→</span>
        </Link>)}</div>
      </div>
    </section>
    <section className="reference-final"><div className="shell reference-final-inner"><div><p className="reference-eyebrow">BZMAGNET</p><h2>{copy.finalTitle}</h2><p>{copy.finalText}</p></div><Link className="reference-button reference-button-orange" href={localePath(locale, "request-quote")}>{copy.requestQuote}</Link></div></section>
  </>;
}
