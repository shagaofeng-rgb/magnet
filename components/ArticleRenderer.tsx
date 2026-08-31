import Image from "next/image";
import Link from "next/link";
import { articlePath, editorialAssets, type Article } from "@/lib/editorial";
import { origin } from "@/lib/i18n";
import { productPathFor, publicProducts } from "@/lib/product-model";
import { uiCopy } from "@/lib/ui-copy";
import { JsonLd } from "./JsonLd";

export function ArticleRenderer({ article }: { article: Article }) {
  const copy = uiCopy[article.locale].article;
  const sectionName = article.contentType === "blog" ? copy.blog : copy.news;
  const typeName = article.contentType === "blog" ? copy.blog : article.contentType === "company_news" ? copy.companyNews : copy.industryNews;
  const hero = article.hero ? editorialAssets[article.hero.assetId as keyof typeof editorialAssets] : undefined;
  const path = articlePath(article);
  const relatedProducts = article.related.filter((relation) => relation.relation === "product").map((relation) => publicProducts.find((product) => product.id === relation.targetId)).filter(Boolean).slice(0, 3);
  const faqSchema = article.faq.length ? { "@type": "FAQPage", mainEntity: article.faq.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) } : undefined;
  return <>
    <JsonLd data={{ "@context": "https://schema.org", "@graph": [
      { "@type": article.contentType === "blog" ? "BlogPosting" : "NewsArticle", headline: article.title, description: article.summary, datePublished: article.publishedAt, dateModified: article.modifiedAt || article.publishedAt, author: { "@type": "Organization", name: article.author.name }, publisher: { "@type": "Organization", "@id": `${origin}/#organization`, name: "BZMAGNET", url: origin, logo: { "@type": "ImageObject", url: `${origin}/icon.png`, width: 256, height: 256 } }, mainEntityOfPage: `${origin}${path}`, image: hero ? `${origin}${hero.src}` : undefined },
      { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: copy.home, item: `${origin}/${article.locale}` }, { "@type": "ListItem", position: 2, name: sectionName, item: `${origin}/${article.locale}/${article.contentType === "blog" ? "blog" : "news"}` }, { "@type": "ListItem", position: 3, name: article.title, item: `${origin}${path}` }] },
      ...(faqSchema ? [faqSchema] : []),
    ] }} />
    <article className="article"><div className="article-head"><nav aria-label={copy.breadcrumb}><Link href={`/${article.locale}`}>{copy.home}</Link> / <Link href={article.contentType === "blog" ? `/${article.locale}/blog` : `/${article.locale}/news`}>{sectionName}</Link></nav><span className="eyebrow">{typeName}</span><h1>{article.title}</h1><p className="article-summary">{article.summary}</p><div className="article-meta"><time dateTime={article.publishedAt}>{article.publishedAt}</time>{article.modifiedAt && article.modifiedAt !== article.publishedAt ? <time dateTime={article.modifiedAt}>{copy.updated} {article.modifiedAt}</time> : null}<Link href={article.author.profilePath || `/${article.locale}/editorial-policy`}>{article.author.name}</Link></div></div>
      {hero && <figure className="article-hero"><Image src={hero.src} alt={article.hero!.alt} width={1536} height={1024} priority sizes="(max-width:900px) 100vw, 900px" /><figcaption>{article.hero?.caption}</figcaption></figure>}
      <div className="article-layout"><aside className="article-toc"><strong>{copy.onPage}</strong>{article.sections.filter((section) => section.level === 2).map((section) => <a key={section.heading} href={`#${slug(section.heading)}`}>{section.heading}</a>)}</aside><div className="article-copy">
        {article.sections.map((section) => { const Tag = section.level === 2 ? "h2" : "h3"; return <section key={section.heading}><Tag id={slug(section.heading)}>{section.heading}</Tag>{section.blocks.map((block, index) => <BlockView key={index} block={block} />)}</section>; })}
        {article.contentType !== "blog" && article.sources.length > 0 && <section><h2>{copy.sources}</h2><ul>{article.sources.map((source) => <li key={source.url}><a href={source.url} rel="nofollow noopener">{source.publisher}: {source.title}</a> ({source.publishedAt ?? copy.unavailableDate}; {copy.checked} {source.accessedAt.slice(0, 10)})</li>)}</ul></section>}
        {article.faq.length > 0 && <section><h2>{copy.faq}</h2>{article.faq.map((item) => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</section>}
        {relatedProducts.length > 0 && <section><h2>{copy.related}</h2><ul>{relatedProducts.map((product) => product && <li key={product.id}><Link href={productPathFor(article.locale, product)}>{product.locale[article.locale].title}</Link></li>)}</ul></section>}
        <div className="article-cta"><h2>{article.cta.label}</h2><p>{article.cta.text}</p><Link className="btn btn-orange" href={article.cta.href}>{article.cta.label}</Link></div>
      </div></div>
    </article>
  </>;
}

function slug(value: string) { return value.normalize("NFKD").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, ""); }
function BlockView({ block }: { block: Article["sections"][number]["blocks"][number] }) {
  if (block.type === "paragraph") return <p>{block.text}</p>;
  if (block.type === "bullets" || block.type === "checklist") return <ul>{block.items.map((item) => <li key={item}>{item}</li>)}</ul>;
  if (block.type === "numbered") return <ol>{block.items.map((item) => <li key={item}>{item}</li>)}</ol>;
  if (block.type === "callout") return <aside className={`article-callout ${block.tone}`}><strong>{block.title}</strong><p>{block.text}</p></aside>;
  if (block.type === "table") return <table><thead><tr>{block.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{block.rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table>;
  if (block.type !== "image") return null;
  const asset = editorialAssets[block.assetId as keyof typeof editorialAssets];
  return asset ? <figure><Image src={asset.src} alt={block.alt} width={1200} height={800} sizes="(max-width:900px) 100vw, 800px" /><figcaption>{block.caption}</figcaption></figure> : null;
}
