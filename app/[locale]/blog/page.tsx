import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, localePath } from "@/lib/i18n";
import { articlePath, editorialAssets, publishedArticles } from "@/lib/editorial";
import { homeCopy } from "@/lib/site-copy";

export default async function Blog({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy=homeCopy[locale];
  const featured = publishedArticles.find((item) => item.locale === locale && item.contentType === "blog");
  return <>
    <section className="editorial-hero"><div className="shell"><span className="eyebrow">BZMAGNET</span><h1>{copy.blogHeading}</h1><p>{copy.heroBody}</p></div></section>
    <div className="shell topic-grid">{copy.categories.map((topic) => <div key={topic.title}>{topic.title}</div>)}</div>
    <section className="editorial-section"><div className="shell">
      {featured ? <Link className="featured-guide" href={articlePath(featured)}><Image src={editorialAssets.guideHub.src} alt={editorialAssets.guideHub.alt} width={768} height={512}/><div><span>BLOG</span><h2>{featured.title}</h2><p>{featured.summary}</p><strong>{copy.viewBlog} →</strong></div></Link> : <div className="empty-state">{copy.noPublished}</div>}
      <div className="inline-cta"><span>{copy.checklistNote}</span><Link href={localePath(locale, "request-quote")}>{copy.requestQuote}</Link></div>
    </div></section>
  </>;
}
