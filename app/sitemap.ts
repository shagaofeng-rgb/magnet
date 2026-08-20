import type { MetadataRoute } from "next";
import { articlePath } from "@/lib/editorial";
import { families } from "@/lib/content";
import { locales, origin } from "@/lib/i18n";
import { industryNavigation } from "@/lib/navigation";
import { productPathFor, publicProducts } from "@/lib/product-model";
import { listPublishedNews } from "@/lib/news-store";

export const revalidate = 3600;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const fixed = ["", "products", "industry-solutions", "news", "blog", "about-contact", "editorial-policy", "privacy", "terms"];
  const news = await listPublishedNews();
  return [
    ...locales.flatMap((locale) => [
      ...fixed.map((path) => ({ url: `${origin}/${locale}${path ? `/${path}` : ""}`, changeFrequency: "weekly" as const, priority: path ? 0.7 : 1 })),
      ...families.map((family) => ({ url: `${origin}/${locale}/products/${family.slug}`, changeFrequency: "weekly" as const, priority: 0.8 })),
      ...publicProducts.map((product) => ({ url: `${origin}${productPathFor(locale, product)}`, changeFrequency: "weekly" as const, priority: 0.9 })),
      ...industryNavigation.map((item) => ({ url: `${origin}/${locale}/industry-solutions/${item.slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
    ]),
    ...news.map((article) => ({ url: `${origin}${articlePath(article)}`, lastModified: new Date(article.modifiedAt ?? article.publishedAt ?? Date.now()), changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
