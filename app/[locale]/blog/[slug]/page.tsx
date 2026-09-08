import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { findArticle } from "@/lib/editorial";
import { articleMetadata } from "@/lib/news-metadata";
import { ArticleRenderer } from "@/components/ArticleRenderer";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return { robots: { index: false, follow: true } };
  const article = findArticle(locale, "blog", slug);
  return article ? articleMetadata(article) : { robots: { index: false, follow: true } };
}

export default async function Page({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const article = findArticle(locale, "blog", slug);
  if (!article) notFound();
  return <ArticleRenderer article={article} />;
}
