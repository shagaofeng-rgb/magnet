import "server-only";

import { findStaticArticle, publishedArticles, type Article, type ContentType } from "./editorial";
import type { Locale } from "./i18n";
import { getPublishedNewsBySlug, listPublishedNews } from "./news-store";

/** Public read model: Blog stays in the editorial CMS/static seed; News comes only from the News store. */
export async function publishedNewsArticles(locale: Locale) {
  return listPublishedNews(locale);
}

export async function findPublicArticle(locale: Locale, type: ContentType, slug: string): Promise<Article | undefined> {
  if (type === "blog") return findStaticArticle(locale, type, slug);
  return getPublishedNewsBySlug(locale, type, slug);
}

export const publishedBlogArticles = publishedArticles.filter((article) => article.contentType === "blog");
