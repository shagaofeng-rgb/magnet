import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/lib/editorial";
import { articlePath, editorialAssets } from "@/lib/editorial";
import { type Locale, localePath } from "@/lib/i18n";
import { uiCopy } from "@/lib/ui-copy";
import { PageHero } from "./PageHero";

type Section = "all" | "company" | "industry";
const PAGE_SIZE = 12;
export const newsIntro: Record<Locale, string> = {
  en: "Published company and industry updates with source context and links to related equipment.",
  es: "Actualizaciones publicadas de la empresa y del sector con contexto y enlaces a equipos relacionados.",
  pt: "Atualizações publicadas da empresa e do setor com contexto e links para equipamentos relacionados.",
  ar: "أخبار منشورة عن الشركة والقطاع مع سياق المصادر وروابط إلى المعدات ذات الصلة.",
  ru: "Опубликованные новости компании и отрасли с контекстом источников и ссылками на оборудование.",
};

function imageFor(article: Article) {
  const asset = article.hero && editorialAssets[article.hero.assetId as keyof typeof editorialAssets];
  return asset || (article.contentType === "company_news" ? editorialAssets.company : editorialAssets.industry);
}

function displayDate(value: string | undefined, locale: Locale) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value.slice(0, 10) : new Intl.DateTimeFormat(locale, { year: "numeric", month: "short", day: "numeric" }).format(date);
}

export function NewsListing({ locale, section, title, intro, empty, articles, requestedPage = 1 }: {
  locale: Locale; section: Section; title: string; intro: string; empty: string; articles: Article[]; requestedPage?: number;
}) {
  const copy = uiCopy[locale].article;
  const pageCount = Math.max(1, Math.ceil(articles.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number.isFinite(requestedPage) ? requestedPage : 1), pageCount);
  const items = articles.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const featured = section === "all" && page === 1 ? items[0] : undefined;
  const rest = featured ? items.slice(1) : items;
  const base = localePath(locale, section === "all" ? "news" : `news/${section}`);
  return <>
    <PageHero eyebrow={copy.news} title={title} intro={intro} />
    <section className="editorial-section"><div className="shell">
      <nav className="news-tabs" aria-label={copy.news}>
        <Link href={localePath(locale, "news")} aria-current={section === "all" ? "page" : undefined}>{copy.news}</Link>
        <Link href={localePath(locale, "news/company")} aria-current={section === "company" ? "page" : undefined}>{copy.companyNews}</Link>
        <Link href={localePath(locale, "news/industry")} aria-current={section === "industry" ? "page" : undefined}>{copy.industryNews}</Link>
      </nav>
      {featured && <Link className="featured-guide news-featured" href={articlePath(featured)}>
        <Image src={imageFor(featured).src} alt="" width={768} height={512} sizes="(max-width:700px) 100vw, 50vw" />
        <div><span>{featured.contentType === "company_news" ? copy.companyNews : copy.industryNews}</span><time dateTime={featured.publishedAt}>{displayDate(featured.publishedAt, locale)}</time><h2>{featured.title}</h2><p>{featured.summary}</p><strong>{copy.news} →</strong></div>
      </Link>}
      {rest.length > 0 && <div className="article-grid news-card-grid">{rest.map((article) => <Link key={article.id} href={articlePath(article)}>
        <div className="editorial-card-media"><Image src={imageFor(article).src} alt="" fill sizes="(max-width:700px) 100vw, 33vw" /></div>
        <div className="editorial-card-body"><span>{article.contentType === "company_news" ? copy.companyNews : copy.industryNews}</span><time dateTime={article.publishedAt}>{displayDate(article.publishedAt, locale)}</time><h2>{article.title}</h2><p>{article.summary}</p><strong>{copy.news} →</strong></div>
      </Link>)}</div>}
      {!items.length && <div className="empty-state" role="status">{empty}</div>}
      {pageCount > 1 && <nav className="editorial-pagination" aria-label={copy.news}>
        {page > 1 && <Link href={`${base}?page=${page - 1}`}>← {copy.news} {page - 1}</Link>}
        <span>{page} / {pageCount}</span>
        {page < pageCount && <Link href={`${base}?page=${page + 1}`}>{copy.news} {page + 1} →</Link>}
      </nav>}
    </div></section>
  </>;
}
