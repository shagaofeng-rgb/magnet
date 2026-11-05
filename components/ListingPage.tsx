import Image from "next/image";
import Link from "next/link";
import { Locale, localePath } from "@/lib/i18n";
import { itemNames } from "@/lib/page-copy";
import { uiCopy } from "@/lib/ui-copy";
import { PageHero } from "./PageHero";

const industryImages: Record<string, string> = {
  "mining-minerals": "/media/generated/industry-mining.webp",
  "coal-bulk-handling": "/media/generated/industry-coal.webp",
  "aggregates-quarrying": "/media/generated/category-mineral-bulk-context.webp",
  "cement-building-materials": "/media/generated/industry-cement.webp",
  recycling: "/media/generated/industry-recycling.webp",
};
const solutionIcons: Record<string, string> = {
  "crusher-protection": "crusher", "tramp-iron-removal": "tramp", "material-purity": "purity",
  "ferrous-recovery": "recovery", "non-ferrous-sorting": "sorting", "fine-material-separation": "fine",
};

export function ListingPage({ locale, title, items, base }: { locale: Locale; title: string; items: string[]; base: string }) {
  const copy = uiCopy[locale].listing;
  const isSolution = base === "solutions";
  return <>
    <PageHero eyebrow={isSolution ? copy.solution : copy.industry} title={title} intro={copy.intro}
      image={isSolution ? "/media/generated/category-process-flow-context.webp" : "/media/generated/industry-mining.webp"}
      ctaHref={localePath(locale, "request-quote")} ctaLabel={uiCopy[locale].footer.quote} />
    <section className="section listing-section"><div className="shell">
      <div className="section-head"><div><span className="eyebrow">{isSolution ? copy.solution : copy.industry}</span><h2>{title}</h2></div><p>{copy.intro}</p></div>
      <div className={`listing-grid${isSolution ? " listing-grid-solutions" : ""}`}>
        {items.map((slug, index) => <article className="listing-card" key={slug}>
          {isSolution ? <div className="listing-icon"><Image src={`/design/icons/icon-${solutionIcons[slug]}.svg`} alt="" width={36} height={36} /></div>
            : <div className="listing-media"><Image src={industryImages[slug] || "/media/generated/industry-mining.webp"} alt="" fill sizes="(max-width:700px) 100vw, 33vw" /></div>}
          <div className="listing-card-body"><span className="eyebrow">{String(index + 1).padStart(2, "0")} / {isSolution ? copy.solution : copy.industry}</span>
            <h3>{itemNames[slug]?.[locale] || slug}</h3><p>{copy.description}</p>
            <Link className="card-link" href={localePath(locale, `${base}/${slug}`)}>{copy.open} <span aria-hidden="true">→</span></Link>
          </div>
        </article>)}
      </div>
    </div></section>
  </>;
}
