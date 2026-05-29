import type { MetadataRoute } from "next";
import { applications } from "@/data/applications";
import { blogPosts } from "@/data/blogs";
import { products } from "@/data/products";
import { site } from "@/data/site";
import { localePath, locales } from "@/lib/i18n";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["/", "/products", "/applications", "/blog", "/about", "/projects", "/contact", "/request-quote"];
  const productRoutes = products.map((product) => `/products/${product.slug}`);
  const applicationRoutes = applications.map((application) => `/applications/${application.slug}`);
  const blogRoutes = blogPosts.map((post) => `/blog/${post.slug}`);
  const localizedRoutes = locales.flatMap((locale) =>
    [...staticRoutes, ...productRoutes, ...applicationRoutes, ...blogRoutes].map((route) => localePath(locale, route))
  );

  return localizedRoutes.map((route) => ({
    url: `${site.url}${route}`,
    lastModified: new Date(),
    changeFrequency: route.endsWith("/en") || route.endsWith("/es") || route.endsWith("/ru") || route.endsWith("/ar") || route.endsWith("/fr") || route.endsWith("/pt") ? "weekly" : "monthly",
    priority: route.split("/").length === 2 ? 1 : route.includes("/products/") ? 0.85 : route.includes("/blog/") ? 0.72 : 0.75
  }));
}
