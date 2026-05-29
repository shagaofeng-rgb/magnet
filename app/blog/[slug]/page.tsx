import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, Clock, Mail, MessageCircle } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { MarkdownContent } from "@/components/MarkdownContent";
import { QuoteForm } from "@/components/QuoteForm";
import { blogPosts, getBlogPost } from "@/data/blogs";
import { site } from "@/data/site";
import { absoluteUrl, breadcrumbSchema } from "@/lib/seo";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return {};
  }

  return {
    title: post.seoTitle,
    description: post.metaDescription,
    keywords: post.keywords,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.seoTitle,
      description: post.metaDescription,
      url: absoluteUrl(`/blog/${post.slug}`),
      images: [post.image],
      type: "article"
    }
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.h1,
    description: post.metaDescription,
    image: absoluteUrl(post.image),
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Organization",
      name: site.name
    },
    publisher: {
      "@type": "Organization",
      name: site.name,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/images/logo.jpg")
      }
    },
    mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`)
  };

  return (
    <>
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Blog", path: "/blog" },
        { name: post.title, path: `/blog/${post.slug}` }
      ])} />

      <section className="blog-hero">
        <div className="blog-hero-copy">
          <span className="eyebrow">{post.category}</span>
          <h1>{post.h1}</h1>
          <p>{post.excerpt}</p>
          <div className="blog-meta">
            <span><CalendarDays size={16} aria-hidden /> Updated May 28, 2026</span>
            <span><Clock size={16} aria-hidden /> {post.readingTime} min read</span>
          </div>
        </div>
        <div className="blog-hero-image">
          <Image src={post.image} width={980} height={620} alt={post.title} priority />
        </div>
      </section>

      <section className="section blog-detail-layout">
        <article className="blog-article">
          <MarkdownContent content={post.content} />
        </article>

        <aside className="blog-sidebar">
          <div className="blog-quote-card">
            <span className="eyebrow">Quote Support</span>
            <h2>Send your conveyor and material data</h2>
            <p>Share belt width, material layer height, installation method, and iron contamination. Our team will suggest a practical magnetic separator configuration.</p>
            <div className="blog-contact-actions">
              <a href={`https://wa.me/${site.whatsapp}`}>
                <MessageCircle size={16} aria-hidden />
                WhatsApp
              </a>
              <a href={`mailto:${site.email}`}>
                <Mail size={16} aria-hidden />
                Email
              </a>
            </div>
          </div>

          <div className="quote-form-shell blog-form-shell">
            <h3>Ask for Selection Support</h3>
            <p>We will reply with a practical recommendation.</p>
            <QuoteForm compact />
          </div>
        </aside>
      </section>

      <section className="section cta-band">
        <div>
          <span className="eyebrow">Ready to Select</span>
          <h2>Need help choosing a magnetic separator?</h2>
          <p>Send your requirements and we will help match the right model for your conveyor line.</p>
        </div>
        <Link href="/request-quote" className="btn btn-primary">Get a Quote <ArrowRight size={17} aria-hidden /></Link>
      </section>
    </>
  );
}
