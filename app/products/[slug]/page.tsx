import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BadgeCheck, CheckCircle2, Mail, MessageCircle } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { QuoteForm } from "@/components/QuoteForm";
import { breadcrumbSchema, faqSchema, absoluteUrl } from "@/lib/seo";
import { products } from "@/data/products";
import { site } from "@/data/site";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find((item) => item.slug === slug);

  if (!product) {
    return {};
  }

  return {
    title: `${product.name} Supplier`,
    description: product.summary,
    keywords: product.keywords,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: `${product.name} | COWIN MAGNET`,
      description: product.summary,
      url: absoluteUrl(`/products/${product.slug}`),
      images: [product.image]
    }
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = products.find((item) => item.slug === slug);

  if (!product) {
    notFound();
  }

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: absoluteUrl(product.image),
    description: product.summary,
    brand: { "@type": "Brand", name: site.name },
    seller: { "@type": "Organization", name: site.legalName },
    category: product.category,
    url: absoluteUrl(`/products/${product.slug}`),
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: absoluteUrl("/request-quote")
    }
  };

  return (
    <>
      <JsonLd data={productSchema} />
      <JsonLd data={faqSchema(product.faqs)} />
      <JsonLd data={breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Products", path: "/products" },
        { name: product.name, path: `/products/${product.slug}` }
      ])} />

      <section className="detail-hero">
        <div>
          <span className="eyebrow">{product.category}</span>
          <h1>{product.name}</h1>
          <p>{product.summary}</p>
          <div className="hero-actions">
            <Link href={`/request-quote?product=${encodeURIComponent(product.name)}`} className="btn btn-primary">
              Get a Quote for This Product
            </Link>
            <Link href="/contact" className="btn btn-secondary">Contact Sales</Link>
          </div>
        </div>
        <div className="detail-image">
          <Image src={product.image} width={820} height={560} alt={product.name} priority />
        </div>
      </section>

      <section className="section detail-layout">
        <article className="detail-main">
          <div className="content-block">
            <h2>Product Overview</h2>
            <p>{product.summary}</p>
          </div>
          <div className="content-block">
            <h2>Key Features</h2>
            <ul className="feature-list">
              {product.features.map((feature) => (
                <li key={feature}><CheckCircle2 size={18} aria-hidden />{feature}</li>
              ))}
            </ul>
          </div>
          <div className="content-block">
            <h2>Working Principle</h2>
            <p>{product.principle}</p>
          </div>
          <div className="content-block">
            <h2>Specifications</h2>
            <div className="spec-table">
              {product.specs.map((spec) => (
                <div key={spec.label}>
                  <span>{spec.label}</span>
                  <strong>{spec.value}</strong>
                </div>
              ))}
            </div>
          </div>
          <div className="content-block">
            <h2>Application Industries</h2>
            <div className="tag-list">
              {product.applications.map((item) => <span key={item}>{item}</span>)}
            </div>
          </div>
          <div className="content-block">
            <h2>Installation Method</h2>
            <p>{product.installation}</p>
          </div>
          <div className="content-block">
            <h2>Customization Options</h2>
            <div className="tag-list">
              {product.customization.map((item) => <span key={item}>{item}</span>)}
            </div>
          </div>
          <div className="content-block">
            <h2>FAQ</h2>
            <div className="faq-list">
              {product.faqs.map((faq) => (
                <details key={faq.question}>
                  <summary>{faq.question}</summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </article>
        <aside className="quote-panel expert-quote-panel">
          <div className="expert-card">
            <div className="expert-card-photo">
              <Image src="/images/expert-david-sha.jpg" width={420} height={420} alt="David Sha, COWIN MAGNET selection consultant" />
            </div>
            <div className="expert-card-body">
              <span className="expert-label">Selection Consultant</span>
              <h2>Ask David for a suitable configuration</h2>
              <p>Send your conveyor width, material, installation height, and iron contamination level. We will help match the right magnetic separation solution.</p>
              <ul className="expert-card-points">
                <li><BadgeCheck size={16} aria-hidden /> Permanent or electromagnetic selection</li>
                <li><BadgeCheck size={16} aria-hidden /> OEM/ODM sizing suggestion</li>
                <li><BadgeCheck size={16} aria-hidden /> Fast reply by email or WhatsApp</li>
              </ul>
              <div className="expert-card-actions">
                <a href={`https://wa.me/${site.whatsapp}`} className="expert-action">
                  <MessageCircle size={16} aria-hidden />
                  WhatsApp
                </a>
                <a href={`mailto:${site.email}`} className="expert-action">
                  <Mail size={16} aria-hidden />
                  Email
                </a>
              </div>
            </div>
          </div>
          <div className="quote-form-shell">
            <h3>Quick Product Inquiry</h3>
            <p>Tell us the basic working condition.</p>
            <QuoteForm compact defaultProduct={product.name} />
          </div>
        </aside>
      </section>

      <section className="section cta-band">
        <div>
          <span className="eyebrow">Custom Selection</span>
          <h2>Need a separator for a specific conveyor or material?</h2>
          <p>Tell us your working conditions and we will recommend a practical configuration.</p>
        </div>
        <Link href="/request-quote" className="btn btn-primary">Start a Custom Quote <ArrowRight size={17} aria-hidden /></Link>
      </section>
    </>
  );
}
