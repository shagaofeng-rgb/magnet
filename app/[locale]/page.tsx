import type {Metadata} from "next";
import Image from "next/image";
import Link from "next/link";
import {notFound} from "next/navigation";
import {JsonLd} from "@/components/JsonLd";
import {families,products} from "@/lib/content";
import {isLocale,localePath,origin} from "@/lib/i18n";
import {alternates} from "@/lib/seo";
import {homeCopy,industryCards} from "@/lib/homepage";

export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{
  const {locale}=await params;if(!isLocale(locale))return{};const c=homeCopy[locale];
  return {title:c.metaTitle,description:c.metaDescription,alternates:alternates(locale),openGraph:{title:c.metaTitle,description:c.metaDescription,url:`${origin}/${locale}/`,siteName:"BZMAGNET",type:"website",images:[{url:`${origin}/media/generated/home-hero-v2.png`,width:1536,height:1024,alt:c.heroAlt}]}};
}
const benefits=["Product Sourcing","Application Matching","Export Coordination"];
const benefitText=["Review equipment families suited to the stated material and process.","Compare options using the operating details you provide.","Coordinate quotation details and export communication for your enquiry."];
const checklist=["Material type","Conveyor or process position","Belt width and speed","Throughput or capacity target","Iron contamination details","Installation space and power supply"];
const categoryDescriptions=["For ferrous metal removal and conveyor protection.","For processing, recovery and material-purity applications.","For ferrous and non-ferrous sorting processes.","For dry materials, powders and process streams."];
const categoryImages=["home-hero-v2.png","industry-mining.png","industry-recycling.png","industry-cement.png"];
const approvedProducts=products.filter(p=>p.locales.en.title&&p.locales.en.summary&&p.approvedImage?.ownershipStatus==="approved").slice(0,8);

export default async function Home({params}:{params:Promise<{locale:string}>}){
  const {locale}=await params;if(!isLocale(locale))notFound();const c=homeCopy[locale];
  const schemas=[{"@context":"https://schema.org","@type":"Organization",name:"BZMAGNET",url:origin},{"@context":"https://schema.org","@type":"WebSite",name:"BZMAGNET",url:origin,inLanguage:locale},{"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:c.home,url:`${origin}/${locale}/`}]}];
  return <>{schemas.map((data,index)=><JsonLd key={index} data={data}/>)}
    <section className="home-hero"><div className="shell home-hero-grid"><div className="home-hero-copy"><span className="eyebrow">{c.eyebrow}</span><h1>{c.heroTitle}</h1><p>{c.heroBody}</p><div className="actions"><Link className="btn btn-blue" href={localePath(locale,"products")}>{c.exploreProducts}</Link><Link className="btn btn-outline" href={localePath(locale,"request-quote")}>{c.requestQuote}</Link></div></div><div className="home-hero-media"><Image src="/media/generated/home-hero-v2.png" alt={c.heroAlt} fill priority sizes="(max-width: 900px) 100vw, 50vw"/></div></div><div className="shell benefit-grid">{benefits.map((title,index)=><article key={title}><span aria-hidden="true">{["01","02","03"][index]}</span><div><h2>{title}</h2><p>{benefitText[index]}</p></div></article>)}</div></section>
    <section className="home-section"><div className="shell"><SectionTitle title={c.browseTitle}/><div className="category-grid">{families.map((family,index)=><Link className="image-card" key={family.key} href={localePath(locale,`products/${family.slug}`)}><div className="card-media"><Image src={`/media/generated/${categoryImages[index]}`} alt="" fill sizes="(max-width: 700px) 100vw, (max-width: 1000px) 50vw, 25vw"/></div><div className="image-card-body"><h3>{["Conveyor Magnetic Separators","Mineral & Bulk Separation","Recycling & Metal Sorting","Process Magnets & Filters"][index]}</h3><p>{categoryDescriptions[index]}</p><strong>{c.viewCategory} <span aria-hidden="true">→</span></strong></div></Link>)}</div></div></section>
    <section className="home-section home-muted"><div className="shell"><SectionTitle title={c.industryTitle}/><div className="industry-grid">{industryCards.map(card=><Link className="industry-card" key={card.slug} href={localePath(locale,`industry-solutions/${card.slug}`)}><div className="card-media"><Image src={`/media/generated/${card.image}`} alt={card.alt} fill sizes="(max-width: 700px) 100vw, 50vw"/></div><div><h3>{card.title}</h3><p>{c.industryDescription}</p><strong>{c.exploreSolution} <span aria-hidden="true">→</span></strong></div></Link>)}</div></div></section>
    <section className="home-section"><div className="shell quote-checklist"><div><span className="eyebrow">{c.quoteEyebrow}</span><h2>{c.checklistTitle}</h2><p>{c.checklistNote}</p><Link className="btn btn-blue" href={`${localePath(locale,"request-quote")}?context=homepage-checklist`}>{c.sendRequirements}</Link></div><ul>{checklist.map((item,index)=><li key={item}><span>{index+1}</span>{item}</li>)}</ul></div></section>
    <section className="home-section home-muted"><div className="shell"><SectionTitle title={c.featuredTitle}/>{approvedProducts.length>0&&<div className="product-grid">{approvedProducts.map(product=><article className="home-product" key={product.id}><div className="product-visual" aria-hidden="true"><span>{product.model??"BZ"}</span></div><h3>{product.locales[locale].title}</h3><p>{product.locales[locale].summary}</p><Link href={localePath(locale,`equipment/${product.locales[locale].slug}`)}>{c.viewProduct} <span aria-hidden="true">→</span></Link></article>)}</div>}</div></section>
    <section className="home-section"><div className="shell"><SectionTitle title={c.insightsTitle}/><div className="insights-empty"><div><span>NEWS</span><h3>{c.newsHeading}</h3><p>{c.noPublished}</p><Link href={localePath(locale,"news")}>{c.viewNews} →</Link></div><div><span>BLOG</span><h3>{c.blogHeading}</h3><p>{c.noPublished}</p><Link href={localePath(locale,"blog")}>{c.viewBlog} →</Link></div></div></div></section>
    <section className="shell final-cta"><div><h2>{c.finalTitle}</h2><p>{c.finalText}</p></div><Link className="btn btn-orange" href={localePath(locale,"request-quote")}>{c.requestQuote}</Link></section>
  </>;
}
function SectionTitle({title}:{title:string}){return <div className="home-section-title"><h2>{title}</h2><span aria-hidden="true"/></div>}
