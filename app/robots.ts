import type { MetadataRoute } from "next";
import { origin } from "@/lib/i18n";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/" }, sitemap: [`${origin}/sitemap.xml`, `${origin}/news-sitemap.xml`] };
}
