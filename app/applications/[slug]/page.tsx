import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { QuoteForm } from "@/components/QuoteForm";
import { applications } from "@/data/applications";
import { products } from "@/data/products";
import { breadcrumbSchema, faqSchema } from "@/lib/seo";

type ApplicationPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return applications.map((application) => ({ slug: application.slug }));
}

export async function generateMetadata({ params }: ApplicationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const application = applications.find((item) => item.slug === slug);

  if (!application) return {};

  return {
    title: `${application.name} Magnetic Separator Solutions`,
    description: application.summary,
    alternates: { canonical: `/applications/${application.slug}` }
  };
}

export default async function ApplicationPage({ params }: ApplicationPageProps) {
  const { slug } = await params;
  const application = applications.find((item) => item.slug === slug);

  if (!application) notFound();

  const related = products.filter((product) => application.recommendedProducts.includes(product.name));

  return (
    <>
      <JsonLd data={faqSchema(application.faqs)} />
      <JsonLd data={breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Applications", path: "/applications" },
        { name: application.name, path: `/applications/${application.slug}` }
      ])} />
      <section className="detail-hero">
        <div>
          <span className="eyebrow">Application</span>
          <h1>{application.name} Magnetic Separator Solutions</h1>
          <p>{application.summary}</p>
          <div className="hero-actions">
            <Link href="/request-quote" className="btn btn-primary">Tell Us Your Material & Belt Width</Link>
            <Link href="/products" className="btn btn-secondary">View Products</Link>
          </div>
        </div>
        <div className="detail-image">
          <Image src={application.image} width={820} height={560} alt={`${application.name} magnetic separator application`} priority />
        </div>
      </section>

      <section className="section detail-layout">
        <article className="detail-main">
          <div className="content-block">
            <h2>Common Buyer Pain Points</h2>
            <ul className="feature-list">
              {application.painPoints.map((point) => (
                <li key={point}><CheckCircle2 size={18} aria-hidden />{point}</li>
              ))}
            </ul>
          </div>
          <div className="content-block">
            <h2>Recommended Product Types</h2>
            <div className="related-products">
              {related.map((product) => (
                <Link href={`/products/${product.slug}`} key={product.slug}>
                  {product.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="content-block">
            <h2>FAQ</h2>
            <div className="faq-list">
              {application.faqs.map((faq) => (
                <details key={faq.question}>
                  <summary>{faq.question}</summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </article>
        <aside className="quote-panel">
          <h2>Application Quote</h2>
          <p>Tell us your material, belt width, capacity, and downstream equipment risk.</p>
          <QuoteForm compact />
        </aside>
      </section>
    </>
  );
}
