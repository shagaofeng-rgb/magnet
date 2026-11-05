import Link from "next/link";
import { Locale, localePath } from "@/lib/i18n";
import { itemNames } from "@/lib/page-copy";
import { uiCopy } from "@/lib/ui-copy";
import { PageHero } from "./PageHero";

const contextImages: Record<string, string> = {
  "mining-minerals": "/media/generated/industry-mining.webp",
  "coal-bulk-handling": "/media/generated/industry-coal.webp",
  "aggregates-quarrying": "/media/generated/category-mineral-bulk-context.webp",
  "cement-building-materials": "/media/generated/industry-cement.webp",
  recycling: "/media/generated/industry-recycling.webp",
  "crusher-protection": "/media/generated/category-conveyor-context.webp",
  "tramp-iron-removal": "/media/generated/category-conveyor-context.webp",
  "material-purity": "/media/generated/category-process-flow-context.webp",
  "ferrous-recovery": "/media/generated/category-recycling-sorting-context.webp",
  "non-ferrous-sorting": "/media/generated/category-recycling-sorting-context.webp",
  "fine-material-separation": "/media/generated/category-mineral-bulk-context.webp",
};

export function ContextDetail({ locale, slug, type }: { locale: Locale; slug: string; type: "industry" | "solution" }) {
  const name = itemNames[slug]?.[locale] || slug.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  const copy = uiCopy[locale].context;
  const quote = localePath(locale, "request-quote");
  const steps = [
    { title: copy.dutyTitle, body: copy.dutyText },
    { title: copy.installationTitle, body: copy.installationText },
    { title: copy.validateTitle, body: copy.validateText },
  ];
  return <>
    <PageHero eyebrow={type === "industry" ? copy.industry : copy.solution} title={name} intro={copy.intro}
      image={contextImages[slug]} ctaHref={quote} ctaLabel={copy.send} />
    <section className="section context-section"><div className="shell">
      <div className="section-head"><div><span className="eyebrow">{type === "industry" ? copy.industry : copy.solution}</span><h2>{name}</h2></div><p>{copy.intro}</p></div>
      <ol className="context-steps">{steps.map((step, index) => <li key={step.title}><span className="context-number">{String(index + 1).padStart(2, "0")}</span><h3>{step.title}</h3><p>{step.body}</p></li>)}</ol>
    </div></section>
    <section className="section context-next"><div className="shell context-next-grid">
      <div><span className="eyebrow">{copy.enquiryTitle}</span><h2>{copy.enquiryTitle}</h2><p>{copy.enquiryText}</p><Link className="btn btn-orange" href={quote}>{copy.send} <span aria-hidden="true">↗</span></Link></div>
      <div className="context-next-link"><span className="eyebrow">{uiCopy[locale].footer.equipment}</span><h3>{uiCopy[locale].footer.equipment}</h3><p>{copy.intro}</p><Link className="card-link" href={localePath(locale, "products")}>{uiCopy[locale].footer.equipment} <span aria-hidden="true">→</span></Link></div>
    </div></section>
  </>;
}
