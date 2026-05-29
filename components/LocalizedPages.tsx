import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, CheckCircle2, Globe2, Headphones, Mail, MapPin, MessageCircle, Phone, Settings, ShieldCheck, Truck, Wrench } from "lucide-react";
import { GoogleMapCard } from "@/components/GoogleMapCard";
import { HomeVideoShowcase } from "@/components/HomeVideoShowcase";
import { JsonLd } from "@/components/JsonLd";
import { LocalizedProductCard } from "@/components/LocalizedProductCard";
import { MarkdownContent } from "@/components/MarkdownContent";
import { PageHero } from "@/components/PageHero";
import { QuoteForm } from "@/components/QuoteForm";
import { applications } from "@/data/applications";
import { blogPosts } from "@/data/blogs";
import { productCategories, products, type Product } from "@/data/products";
import { site } from "@/data/site";
import { absoluteUrl, breadcrumbSchema, faqSchema, organizationSchema } from "@/lib/seo";
import type { Locale } from "@/lib/i18n";
import { getDictionary, localizeHref } from "@/lib/i18n";

const advantageIcons = [ShieldCheck, Settings, Headphones, Globe2];
const serviceIcons = [Headphones, Wrench, Truck, ShieldCheck, BadgeCheck, Globe2];

export function LocalizedHomePage({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const featured = products.slice(0, 6);

  return (
    <>
      <section className="home-hero">
        <Image src="/images/generated/home-hero-cowinmagnet.png" fill sizes="100vw" alt={t.home.heroAlt} className="hero-banner-image" priority />
        <div className="hero-copy">
          <span className="eyebrow">{t.home.heroEyebrow}</span>
          <h1>{t.home.h1}</h1>
          <p>{t.home.heroText}</p>
          <div className="hero-actions">
            <Link href={localizeHref("/request-quote", locale)} className="btn btn-primary">{t.common.getQuote}</Link>
            <Link href={localizeHref("/products", locale)} className="btn btn-secondary">{t.common.viewProducts}</Link>
          </div>
          <div className="hero-proof"><span>OEM/ODM</span><span>Mining</span><span>Recycling</span><span>Cement</span></div>
        </div>
      </section>

      <HomeVideoShowcase
        eyebrow={t.home.videoEyebrow}
        title={t.home.videoTitle}
        text={t.home.videoText}
        quoteHref={localizeHref("/request-quote", locale)}
        quoteLabel={t.common.sendRequirements}
      />

      <section className="section">
        <div className="section-heading">
          <span className="eyebrow">{t.home.categoriesEyebrow}</span>
          <h2>{t.home.categoriesTitle}</h2>
          <p>{t.home.categoriesText}</p>
        </div>
        <div className="category-grid">
          {productCategories.map((category) => (
            <Link href={localizeHref("/products", locale)} key={category} className="category-tile">
              <Wrench size={22} aria-hidden />
              <h3>{category}</h3>
              <p>{products.filter((product) => product.category === category).length} {t.products.options}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="section section-muted">
        <div className="section-heading">
          <span className="eyebrow">{t.home.featuredEyebrow}</span>
          <h2>{t.home.featuredTitle}</h2>
        </div>
        <div className="product-grid">
          {featured.map((product) => <LocalizedProductCard key={product.slug} product={product} locale={locale} />)}
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <span className="eyebrow">{t.home.whyEyebrow}</span>
          <h2>{t.home.whyTitle}</h2>
        </div>
        <div className="advantage-grid">
          {t.advantages.map(([title, text], index) => {
            const Icon = advantageIcons[index] || ShieldCheck;
            return <article key={title} className="advantage-item"><Icon size={28} aria-hidden /><h3>{title}</h3><p>{text}</p></article>;
          })}
        </div>
      </section>

      <section className="section section-split">
        <div>
          <span className="eyebrow">{t.home.applicationEyebrow}</span>
          <h2>{t.home.applicationTitle}</h2>
          <p>{t.home.applicationText}</p>
          <Link href={localizeHref("/applications", locale)} className="text-link">{t.nav.applications} <ArrowRight size={16} aria-hidden /></Link>
        </div>
        <div className="application-mini-grid">
          {applications.map((application) => (
            <Link key={application.slug} href={localizeHref(`/applications/${application.slug}`, locale)} className="application-mini">
              <Image src={application.image} width={340} height={220} alt={`${application.name} ${t.applications.heroAlt}`} />
              <span>{application.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section expert-band">
        <div className="expert-photo">
          <Image src="/images/expert-david-sha.jpg" width={520} height={520} alt="David Sha, COWIN MAGNET selection consultant" />
        </div>
        <div>
          <span className="eyebrow">{t.home.expertEyebrow}</span>
          <h2>{t.home.expertTitle}</h2>
          <p>{t.home.expertText}</p>
          <ul className="check-list">
            <li><BadgeCheck size={18} aria-hidden /> Conveyor and material condition review</li>
            <li><BadgeCheck size={18} aria-hidden /> Permanent or electromagnetic selection advice</li>
            <li><BadgeCheck size={18} aria-hidden /> OEM/ODM sizing for industrial layouts</li>
          </ul>
          <Link href={localizeHref("/request-quote", locale)} className="btn btn-primary">{t.common.tellMaterial}</Link>
        </div>
      </section>

      <section className="section quote-section">
        <div>
          <span className="eyebrow">{t.home.quoteEyebrow}</span>
          <h2>{t.home.quoteTitle}</h2>
          <p>{t.home.quoteText}</p>
        </div>
        <QuoteForm compact />
      </section>
    </>
  );
}

export function LocalizedProductsPage({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  return (
    <>
      <PageHero eyebrow={t.products.eyebrow} title={t.products.h1} description={t.products.description} image="/images/catalog/page-3-image-9-1871x840.jpg" imageAlt={t.products.heroAlt} primaryHref={localizeHref("/request-quote", locale)} primaryLabel={t.common.getQuote} secondaryHref={localizeHref("/request-quote", locale)} secondaryLabel={t.common.requestSelectionSupport} />
      <section className="section">
        {productCategories.map((category) => (
          <div className="product-category-block" key={category}>
            <div className="section-heading align-left"><span className="eyebrow">{category}</span><h2>{category}</h2></div>
            <div className="product-grid">
              {products.filter((product) => product.category === category).map((product) => <LocalizedProductCard key={product.slug} product={product} locale={locale} />)}
            </div>
          </div>
        ))}
      </section>
    </>
  );
}

export function LocalizedProductDetailPage({ locale, product }: { locale: Locale; product: Product }) {
  const t = getDictionary(locale);
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: absoluteUrl(product.image),
    description: product.summary,
    brand: { "@type": "Brand", name: site.name },
    seller: { "@type": "Organization", name: site.legalName },
    category: product.category,
    url: absoluteUrl(localizeHref(`/products/${product.slug}`, locale))
  };

  return (
    <>
      <JsonLd data={productSchema} />
      <JsonLd data={faqSchema(product.faqs)} />
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: `/${locale}` }, { name: t.nav.products, path: `/${locale}/products` }, { name: product.name, path: `/${locale}/products/${product.slug}` }])} />
      <section className="detail-hero">
        <div>
          <span className="eyebrow">{product.category}</span>
          <h1>{product.name} {t.productDetail.manufacturer}</h1>
          <p>{product.summary}</p>
          <div className="hero-actions">
            <Link href={localizeHref(`/request-quote?product=${encodeURIComponent(product.name)}`, locale)} className="btn btn-primary">{t.common.getQuote}</Link>
            <Link href={localizeHref("/contact", locale)} className="btn btn-secondary">{t.common.contactSales}</Link>
          </div>
        </div>
        <div className="detail-image"><Image src={product.image} width={820} height={560} alt={`${product.name} ${t.productDetail.manufacturer}`} priority /></div>
      </section>
      <section className="section detail-layout">
        <article className="detail-main">
          <ContentBlock title={t.productDetail.overview}><p>{product.summary}</p></ContentBlock>
          <ContentBlock title={t.productDetail.features}><FeatureList items={product.features} /></ContentBlock>
          <ContentBlock title={t.productDetail.principle}><p>{product.principle}</p></ContentBlock>
          <ContentBlock title={t.productDetail.specifications}><SpecTable specs={product.specs} /></ContentBlock>
          <ContentBlock title={t.productDetail.industries}><TagList items={product.applications} /></ContentBlock>
          <ContentBlock title={t.productDetail.installation}><p>{product.installation}</p></ContentBlock>
          <ContentBlock title={t.productDetail.customization}><TagList items={product.customization} /></ContentBlock>
          <ContentBlock title={t.productDetail.faq}><FaqList faqs={product.faqs} /></ContentBlock>
        </article>
        <aside className="quote-panel">
          <h2>{t.productDetail.quoteTitle}</h2>
          <p>{t.productDetail.quoteText}</p>
          <QuoteForm compact defaultProduct={product.name} />
        </aside>
      </section>
    </>
  );
}

export function LocalizedApplicationsPage({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  return (
    <>
      <PageHero eyebrow={t.applications.eyebrow} title={t.applications.h1} description={t.applications.description} image="/images/catalog/page-6-image-3-1349x734.jpg" imageAlt={t.applications.heroAlt} primaryHref={localizeHref("/request-quote", locale)} primaryLabel={t.common.getQuote} />
      <section className="section">
        <div className="application-grid">
          {applications.map((application) => (
            <article key={application.slug} className="application-card">
              <Image src={application.image} width={620} height={390} alt={`${application.name} ${t.applications.heroAlt}`} />
              <div><h2>{application.name}</h2><p>{application.summary}</p><Link href={localizeHref(`/applications/${application.slug}`, locale)} className="text-link">{t.common.viewSolution} <ArrowRight size={16} aria-hidden /></Link></div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

export function LocalizedApplicationDetailPage({ locale, application }: { locale: Locale; application: (typeof applications)[number] }) {
  const t = getDictionary(locale);
  const related = products.filter((product) => application.recommendedProducts.includes(product.name));
  return (
    <>
      <JsonLd data={faqSchema(application.faqs)} />
      <section className="detail-hero">
        <div>
          <span className="eyebrow">{t.applications.eyebrow}</span>
          <h1>{application.name} Magnetic Separator Solutions</h1>
          <p>{application.summary}</p>
          <div className="hero-actions"><Link href={localizeHref("/request-quote", locale)} className="btn btn-primary">{t.common.tellMaterial}</Link><Link href={localizeHref("/products", locale)} className="btn btn-secondary">{t.common.viewProducts}</Link></div>
        </div>
        <div className="detail-image"><Image src={application.image} width={820} height={560} alt={`${application.name} ${t.applications.heroAlt}`} priority /></div>
      </section>
      <section className="section detail-layout">
        <article className="detail-main">
          <ContentBlock title={t.applications.painPoints}><FeatureList items={application.painPoints} /></ContentBlock>
          <ContentBlock title={t.applications.recommended}><div className="related-products">{related.map((product) => <Link href={localizeHref(`/products/${product.slug}`, locale)} key={product.slug}>{product.name}</Link>)}</div></ContentBlock>
          <ContentBlock title={t.productDetail.faq}><FaqList faqs={application.faqs} /></ContentBlock>
        </article>
        <aside className="quote-panel"><h2>{t.applications.quoteTitle}</h2><p>{t.applications.quoteText}</p><QuoteForm compact /></aside>
      </section>
    </>
  );
}

export function LocalizedAboutPage({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  return (
    <>
      <JsonLd data={organizationSchema()} />
      <PageHero eyebrow={t.about.eyebrow} title={t.about.h1} description={t.about.description} image="/images/generated/contact-support-cowinmagnet.png" imageAlt={t.about.heroAlt} primaryHref={localizeHref("/request-quote", locale)} primaryLabel={t.common.getQuote} secondaryHref={localizeHref("/products", locale)} secondaryLabel={t.common.viewProducts} />
      <section className="section section-split">
        <div><span className="eyebrow">{t.about.profileEyebrow}</span><h2>{site.legalName}</h2><p>{t.about.profileText1}</p><p>{t.about.profileText2}</p></div>
        <div className="value-grid">{t.advantages.slice(0, 3).map(([title, text]) => <article key={title} className="value-item"><ShieldCheck size={26} aria-hidden /><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>
      <section className="section section-muted">
        <div className="section-heading"><span className="eyebrow">{t.about.serviceEyebrow}</span><h2>{t.about.serviceTitle}</h2><p>{t.about.serviceText}</p></div>
        <div className="service-grid">
          {t.about.services.map((service, index) => {
            const Icon = serviceIcons[index] || ShieldCheck;
            return <article className="service-card" key={service}><Icon size={22} aria-hidden /><p>{service}</p></article>;
          })}
        </div>
      </section>
      <section className="section expert-band"><div className="expert-photo"><Image src="/images/expert-david-sha.jpg" width={520} height={520} alt="David Sha from COWIN MAGNET" /></div><div><span className="eyebrow">{t.about.expertEyebrow}</span><h2>David Sha</h2><p>{t.about.expertText}</p></div></section>
      <section className="section map-section"><GoogleMapCard title="COWIN MAGNET Office Location" /></section>
    </>
  );
}

export function LocalizedContactPage({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  return (
    <>
      <PageHero eyebrow={t.contact.eyebrow} title={t.contact.h1} description={t.contact.description} image="/images/generated/contact-support-cowinmagnet.png" imageAlt={t.contact.heroAlt} primaryHref={localizeHref("/request-quote", locale)} primaryLabel={t.common.getQuote} />
      <section className="section map-section"><GoogleMapCard title="Find COWIN MAGNET in Quzhou, China" /></section>
      <section className="section contact-layout">
        <div className="contact-info"><h2>{t.contact.infoTitle}</h2><a href={`mailto:${site.email}`}><Mail size={18} aria-hidden />{site.email}</a><a href={`https://wa.me/${site.whatsapp}`}><MessageCircle size={18} aria-hidden />WhatsApp: {site.whatsapp}</a><a href={`tel:${site.phone.replaceAll(" ", "")}`}><Phone size={18} aria-hidden />{site.phone}</a><span><MapPin size={18} aria-hidden />{site.address}</span><p>{t.contact.fastTip}</p></div>
        <QuoteForm />
      </section>
    </>
  );
}

export function LocalizedRequestQuotePage({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  return (
    <>
      <PageHero eyebrow={t.requestQuote.eyebrow} title={t.requestQuote.h1} description={t.requestQuote.description} image="/images/catalog/page-4-image-9-1537x1023.jpg" imageAlt={t.requestQuote.heroAlt} primaryHref={localizeHref("/request-quote", locale)} primaryLabel={t.common.getQuote} secondaryHref={localizeHref("/products", locale)} secondaryLabel={t.common.viewProducts} />
      <section className="section quote-page"><div className="section-heading align-left"><span className="eyebrow">{t.requestQuote.formEyebrow}</span><h2>{t.requestQuote.formTitle}</h2><p>{t.requestQuote.formText}</p></div><QuoteForm /></section>
    </>
  );
}

export function LocalizedSimplePage({ locale, page }: { locale: Locale; page: "factory" | "projects" }) {
  const t = getDictionary(locale);
  const data = t[page];
  return (
    <>
      <PageHero eyebrow={data.eyebrow} title={data.h1} description={data.description} image={page === "factory" ? "/images/generated/about-factory-team-cowinmagnet.png" : "/images/generated/recycling-application-cowinmagnet.png"} imageAlt={data.heroAlt} primaryHref={localizeHref("/request-quote", locale)} primaryLabel={t.common.getQuote} secondaryHref={localizeHref("/products", locale)} secondaryLabel={t.common.viewProducts} />
      <section className="section">
        <div className="advantage-grid">
          {t.advantages.map(([title, text]) => <article key={title} className="advantage-item"><BadgeCheck size={26} aria-hidden /><h3>{title}</h3><p>{text}</p></article>)}
        </div>
      </section>
    </>
  );
}

export function LocalizedBlogListPage({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  return (
    <>
      <PageHero eyebrow={t.blog.eyebrow} title={t.blog.h1} description={t.blog.description} image="/images/generated/recycling-application-cowinmagnet.png" imageAlt={t.blog.heroAlt} primaryHref={localizeHref("/request-quote", locale)} primaryLabel={t.common.getQuote} secondaryHref={localizeHref("/request-quote", locale)} secondaryLabel={t.common.sendRequirements} />
      <section className="section blog-list-section">
        <div className="section-heading align-left"><span className="eyebrow">{t.blog.hubEyebrow}</span><h2>{t.blog.hubTitle}</h2><p>{t.blog.hubText}</p></div>
        <div className="blog-grid">{blogPosts.map((post) => <article className="blog-card" key={post.slug}><Link href={localizeHref(`/blog/${post.slug}`, locale)} className="blog-card-image"><Image src={post.image} width={760} height={460} alt={post.title} /></Link><div className="blog-card-body"><div className="blog-card-meta"><span>{post.category}</span><span>{post.readingTime} {t.common.minRead}</span></div><h3><Link href={localizeHref(`/blog/${post.slug}`, locale)}>{post.title}</Link></h3><p>{post.excerpt}</p><Link href={localizeHref(`/blog/${post.slug}`, locale)} className="text-link">{t.common.readArticle} <ArrowRight size={16} aria-hidden /></Link></div></article>)}</div>
      </section>
    </>
  );
}

export function LocalizedBlogDetailPage({ locale, post }: { locale: Locale; post: (typeof blogPosts)[number] }) {
  const t = getDictionary(locale);
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Article", headline: post.title, description: post.metaDescription, image: absoluteUrl(post.image), datePublished: post.publishedAt, dateModified: post.updatedAt, author: { "@type": "Organization", name: site.name }, publisher: { "@type": "Organization", name: site.name } }} />
      <section className="blog-hero"><div className="blog-hero-copy"><span className="eyebrow">{post.category}</span><h1>{post.h1}</h1><p>{post.excerpt}</p><div className="blog-meta"><span>{t.common.updated} May 28, 2026</span><span>{post.readingTime} {t.common.minRead}</span></div></div><div className="blog-hero-image"><Image src={post.image} width={980} height={620} alt={post.title} priority /></div></section>
      <section className="section blog-detail-layout"><article className="blog-article"><MarkdownContent content={post.content} /></article><aside className="blog-sidebar"><div className="blog-quote-card"><span className="eyebrow">{t.footer.quoteSupport}</span><h2>{t.blog.sidebarTitle}</h2><p>{t.blog.sidebarText}</p></div><div className="quote-form-shell blog-form-shell"><h3>{t.common.requestSelectionSupport}</h3><p>{t.productDetail.quoteText}</p><QuoteForm compact /></div></aside></section>
    </>
  );
}

function ContentBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="content-block"><h2>{title}</h2>{children}</div>;
}

function FeatureList({ items }: { items: string[] }) {
  return <ul className="feature-list">{items.map((item) => <li key={item}><CheckCircle2 size={18} aria-hidden />{item}</li>)}</ul>;
}

function TagList({ items }: { items: string[] }) {
  return <div className="tag-list">{items.map((item) => <span key={item}>{item}</span>)}</div>;
}

function SpecTable({ specs }: { specs: Product["specs"] }) {
  return <div className="spec-table">{specs.map((spec) => <div key={spec.label}><span>{spec.label}</span><strong>{spec.value}</strong></div>)}</div>;
}

function FaqList({ faqs }: { faqs: { question: string; answer: string }[] }) {
  return <div className="faq-list">{faqs.map((faq) => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</div>;
}
