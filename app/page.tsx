import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Globe2, Headphones, Settings, ShieldCheck, Wrench } from "lucide-react";
import { HomeVideoShowcase } from "@/components/HomeVideoShowcase";
import { ProductCard } from "@/components/ProductCard";
import { QuoteForm } from "@/components/QuoteForm";
import { applications } from "@/data/applications";
import { productCategories, products } from "@/data/products";
import { site } from "@/data/site";

const advantages = [
  { icon: ShieldCheck, title: "Strong Magnetic Force", text: "Deep magnetic penetration for removing ferromagnetic impurities from conveyed bulk materials." },
  { icon: Settings, title: "OEM/ODM Customization", text: "Flexible designs for belt width, suspension height, installation method, and application scenario." },
  { icon: Headphones, title: "Service-First Support", text: "Clear communication, practical selection advice, sourcing coordination, and responsive follow-up." },
  { icon: Globe2, title: "Global B2B Support", text: "Serving mining, recycling, cement, aggregate, metallurgy, coal, and bulk material buyers worldwide." }
];

export default function Home() {
  const featured = products.slice(0, 6);

  return (
    <>
      <section className="home-hero">
        <Image
          src="/images/generated/home-hero-cowinmagnet.png"
          fill
          sizes="100vw"
          alt="COWIN MAGNET magnetic separator working above a conveyor line"
          className="hero-banner-image"
          priority
        />
        <div className="hero-copy">
          <span className="eyebrow">Magnetic Separation Equipment Supplier</span>
          <h1>COWIN MAGNET</h1>
          <p>
            Industrial magnetic separators, suspended magnets, magnetic pulleys, magnetic bars, and customized iron removal systems for global B2B buyers.
          </p>
          <div className="hero-actions">
            <Link href="/request-quote" className="btn btn-primary">Get a Quote</Link>
            <Link href="/products" className="btn btn-secondary">View Products</Link>
          </div>
          <div className="hero-proof">
            <span>OEM/ODM</span>
            <span>Mining</span>
            <span>Recycling</span>
            <span>Cement</span>
          </div>
        </div>
      </section>

      <HomeVideoShowcase
        eyebrow="Video Showcase"
        title="See COWIN MAGNET product and service details in motion"
        text="A short vertical video helps overseas buyers understand product appearance, communication style, and the practical support we provide before quote confirmation."
        quoteHref="/request-quote"
        quoteLabel="Send Your Requirements"
      />

      <section className="section">
        <div className="section-heading">
          <span className="eyebrow">Product Categories</span>
          <h2>Product categories for magnetic separation and industrial site support</h2>
          <p>Start with a product category, then send your material, conveyor, lighting, air supply, or jobsite requirements for selection support.</p>
        </div>
        <div className="category-grid">
          {productCategories.map((category) => (
            <Link href="/products" key={category} className="category-tile">
              <Wrench size={22} aria-hidden />
              <h3>{category}</h3>
              <p>{products.filter((product) => product.category === category).length} product options</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="section section-muted">
        <div className="section-heading">
          <span className="eyebrow">Featured Products</span>
          <h2>Core products for iron removal and equipment protection</h2>
        </div>
        <div className="product-grid">
          {featured.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <span className="eyebrow">Why COWIN MAGNET</span>
          <h2>Practical industrial design, not exaggerated claims</h2>
        </div>
        <div className="advantage-grid">
          {advantages.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="advantage-item">
                <Icon size={28} aria-hidden />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section section-split">
        <div>
          <span className="eyebrow">Application Scenarios</span>
          <h2>Built for harsh conveyor, crushing, recycling, and bulk handling environments</h2>
          <p>
            COWIN MAGNET helps buyers select suitable separators by material burden, belt speed, installation height, iron contamination level, and downstream equipment risk.
          </p>
          <Link href="/applications" className="text-link">Explore applications <ArrowRight size={16} aria-hidden /></Link>
        </div>
        <div className="application-mini-grid">
          {applications.map((application) => (
            <Link key={application.slug} href={`/applications/${application.slug}`} className="application-mini">
              <Image src={application.image} width={340} height={220} alt={`${application.name} magnetic separation application`} />
              <span>{application.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section expert-band">
        <div className="expert-photo">
          <Image src="/images/expert-david-sha.jpg" width={520} height={520} alt="David Sha, magnetic separation equipment consultant" />
        </div>
        <div>
          <span className="eyebrow">Selection Support</span>
          <h2>Talk with a magnetic separation equipment specialist</h2>
          <p>
            Share your conveyor width, material type, iron contamination level, and installation conditions. Our team will recommend a practical configuration without inventing certifications or unsupported claims.
          </p>
          <ul className="check-list">
            <li><BadgeCheck size={18} aria-hidden /> Conveyor and material condition review</li>
            <li><BadgeCheck size={18} aria-hidden /> Permanent or electromagnetic selection advice</li>
            <li><BadgeCheck size={18} aria-hidden /> OEM/ODM sizing for industrial layouts</li>
          </ul>
          <Link href="/request-quote" className="btn btn-primary">Tell Us Your Material & Belt Width</Link>
        </div>
      </section>

      <section className="section quote-section">
        <div>
          <span className="eyebrow">Fast Inquiry</span>
          <h2>Request a custom magnetic separation quote</h2>
          <p>Send basic project information and we will contact you soon through email or WhatsApp.</p>
        </div>
        <QuoteForm compact />
      </section>
    </>
  );
}
