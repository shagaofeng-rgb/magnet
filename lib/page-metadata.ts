import type { Metadata } from "next";
import { type Locale } from "./i18n";
import { alternates } from "./seo";
import { absoluteUrl, siteConfig } from "./site";

type PageMetadataInput = {
  locale: Locale;
  path?: string;
  title: string;
  description: string;
  image?: string;
  robots?: Metadata["robots"];
  type?: "website" | "article";
};

export function pageMetadata({ locale, path = "", title, description, image = siteConfig.defaultOgImage, robots, type = "website" }: PageMetadataInput): Metadata {
  const url = absoluteUrl(`/${locale}/${path}`.replace(/\/$/, "/"));
  const imageUrl = absoluteUrl(image);
  return {
    title,
    description,
    alternates: alternates(locale, path),
    robots,
    openGraph: { title, description, url, siteName: siteConfig.name, type, images: [{ url: imageUrl, alt: title }] },
    twitter: { card: "summary_large_image", title, description, images: [imageUrl] },
  };
}
