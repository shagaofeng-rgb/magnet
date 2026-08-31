import type { Metadata } from "next";
import { articlePath, editorialAssets, type Article } from "./editorial";
import { origin } from "./i18n";

export function articleMetadata(article: Article): Metadata {
  const url = `${origin}${articlePath(article)}`;
  const hero = article.hero ? editorialAssets[article.hero.assetId as keyof typeof editorialAssets] : undefined;
  const images = hero ? [{ url: `${origin}${hero.src}`, alt: article.hero?.alt }] : undefined;
  return {
    title: { absolute: article.seo.metaTitle },
    description: article.seo.metaDescription,
    alternates: { canonical: url, languages: { [article.locale]: url, "x-default": url } },
    robots: { index: true, follow: true },
    openGraph: { type: "article", url, siteName: "BZMAGNET", title: article.seo.metaTitle, description: article.seo.metaDescription, publishedTime: article.publishedAt, modifiedTime: article.modifiedAt ?? article.publishedAt, images },
    twitter: { card: "summary_large_image", title: article.seo.metaTitle, description: article.seo.metaDescription, images: hero ? [`${origin}${hero.src}`] : undefined },
  };
}
