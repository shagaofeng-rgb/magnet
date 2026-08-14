import { notFound } from "next/navigation";
import { ArticleRenderer } from "@/components/ArticleRenderer";
import { isLocale } from "@/lib/i18n";
import { findPublicArticle } from "@/lib/news-public";
import { articleMetadata } from "@/lib/news-metadata";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) { const { locale, slug } = await params; if (!isLocale(locale)) return {}; const article = await findPublicArticle(locale, "company_news", slug); return article ? articleMetadata(article) : {}; }
export default async function Page({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const article = await findPublicArticle(locale, "company_news", slug);
  if (!article) notFound();
  return <ArticleRenderer article={article} />;
}
