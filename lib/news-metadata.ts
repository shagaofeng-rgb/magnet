import type { Metadata } from "next";
import { articlePath, type Article } from "./editorial";
import { origin } from "./i18n";

export function articleMetadata(article: Article): Metadata {
  const url = `${origin}${articlePath(article)}`;
  return {
    title: article.seo.metaTitle,
    description: article.seo.metaDescription,
    alternates: { canonical: url, languages: { [article.locale]: url, "x-default": url } },
    openGraph: { type: "article", url, title: article.seo.metaTitle, description: article.seo.metaDescription, publishedTime: article.publishedAt, modifiedTime: article.modifiedAt ?? article.publishedAt },
  };
}
