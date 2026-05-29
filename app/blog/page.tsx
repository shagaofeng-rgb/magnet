import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { blogPosts } from "@/data/blogs";

export const metadata: Metadata = {
  title: "Blog | Magnetic Separator Selection Guides",
  description:
    "Read COWIN MAGNET selection guides, comparison articles, and application solutions for magnetic separators, overband magnets, magnetic pulleys, and industrial magnets.",
  alternates: { canonical: "/blog" }
};

export default function BlogPage() {
  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Magnetic separator guides for industrial buyers"
        description="Practical articles for procurement teams, plant engineers, distributors, and EPC buyers comparing magnetic separation equipment."
        image="/images/generated/recycling-application-cowinmagnet.png"
        secondaryHref="/request-quote"
        secondaryLabel="Send Requirements"
      />

      <section className="section blog-list-section">
        <div className="section-heading align-left">
          <span className="eyebrow">SEO Knowledge Hub</span>
          <h2>Selection, comparison, and application articles</h2>
          <p>Use these guides to prepare conveyor data, compare product options, and request a more accurate magnetic separator quotation.</p>
        </div>

        <div className="blog-grid">
          {blogPosts.map((post) => (
            <article className="blog-card" key={post.slug}>
              <Link href={`/blog/${post.slug}`} className="blog-card-image" aria-label={post.title}>
                <Image src={post.image} width={760} height={460} alt={post.title} />
              </Link>
              <div className="blog-card-body">
                <div className="blog-card-meta">
                  <span>{post.category}</span>
                  <span><Clock size={14} aria-hidden /> {post.readingTime} min read</span>
                </div>
                <h3><Link href={`/blog/${post.slug}`}>{post.title}</Link></h3>
                <p>{post.excerpt}</p>
                <Link href={`/blog/${post.slug}`} className="text-link">
                  Read article <ArrowRight size={16} aria-hidden />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
