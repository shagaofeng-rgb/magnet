import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LocalizedBlogDetailPage } from "@/components/LocalizedPages";
import { blogPosts, getBlogPost } from "@/data/blogs";
import { isLocale, locales, localizedPageAlternates, type Locale } from "@/lib/i18n";

type PageProps = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return locales.flatMap((locale) => blogPosts.map((post) => ({ locale, slug: post.slug })));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const current = isLocale(locale) ? locale : "en";
  const post = getBlogPost(slug);
  if (!post) return {};
  return { title: post.seoTitle, description: post.metaDescription, keywords: post.keywords, alternates: localizedPageAlternates(current, `/blog/${post.slug}`), openGraph: { title: post.seoTitle, description: post.metaDescription, images: [post.image], type: "article" } };
}

export default async function Page({ params }: PageProps) {
  const { locale, slug } = await params;
  const post = getBlogPost(slug);
  if (!post || !isLocale(locale)) notFound();
  return <LocalizedBlogDetailPage locale={locale as Locale} post={post} />;
}
