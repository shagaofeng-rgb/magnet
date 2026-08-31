import type { MetadataRoute } from "next";
import { articlePath, publishedArticles } from "@/lib/editorial";
import { families } from "@/lib/content";
import { locales, origin } from "@/lib/i18n";
import { industryNavigation } from "@/lib/navigation";
import { productPathFor, publicProducts } from "@/lib/product-model";
import { listPublishedNews } from "@/lib/news-store";

export const revalidate = 3600;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const fixed = ["", "products", "industry-solutions", "news", "news/company", "news/industry", "blog", "about-contact", "request-quote", "editorial-policy", "authors/editorial-team", "privacy", "terms"];
  const news = await listPublishedNews();
  const blog = publishedArticles.filter((article) => article.contentType === "blog");
  return [
    ...locales.flatMap((locale) => [
      ...fixed.map((path) => ({ url: `${origin}/${locale}${path ? `/${path}` : ""}`, changeFrequency: "weekly" as const, priority: path ? 0.7 : 1 })),
      ...families.map((family) => ({ url: `${origin}/${locale}/products/${family.slug}`, changeFrequency: "weekly" as const, priority: 0.8 })),
      ...publicProducts.map((product) => ({ url: `${origin}${productPathFor(locale, product)}`, changeFrequency: "weekly" as const, priority: 0.9 })),
      ...industryNavigation.map((item) => ({ url: `${origin}/${locale}/industry-solutions/${item.slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
    ]),
    ...news.map((article) => ({ url: `${origin}${articlePath(article)}`, lastModified: article.modifiedAt ?? article.publishedAt, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...blog.map((article) => ({ url: `${origin}${articlePath(article)}`, lastModified: article.modifiedAt ?? article.publishedAt, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
