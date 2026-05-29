import type { Metadata } from "next";
import Image from "next/image";
import { BadgeCheck, Globe2, Headphones, ShieldCheck, Truck, Wrench } from "lucide-react";
import { GoogleMapCard } from "@/components/GoogleMapCard";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { organizationSchema } from "@/lib/seo";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "About Us | COWIN MAGNET",
  description:
    "Learn about COWIN MAGNET, a service-first magnetic separation equipment supplier helping overseas buyers with product selection, sourcing coordination, OEM/ODM communication, and delivery follow-up.",
  alternates: { canonical: "/about" }
};

const values = [
  { icon: Headphones, title: "Service-first communication", text: "We respond around the buyer's real working conditions and keep the selection process clear, practical, and easy to follow." },
  { icon: Wrench, title: "Technical selection support", text: "We help confirm material, belt width, belt speed, installation height, cleaning method, and suitable magnetic separator type." },
  { icon: Truck, title: "Supply and delivery coordination", text: "We coordinate OEM/ODM requirements, product confirmation, inspection details, packaging, and shipment communication." },
  { icon: Globe2, title: "Global B2B buyer focus", text: "Our service process is built for importers, distributors, contractors, EPC buyers, and industrial end users." }
];

const services = [
  "Product selection based on conveyor and material conditions",
  "OEM/ODM requirement communication with suitable production partners",
  "Quote preparation with clear product scope and technical details",
  "Pre-shipment photo, video, packaging, and document follow-up",
  "After-sales communication for installation questions and spare parts",
  "Long-term sourcing support for magnetic separation equipment categories"
];

export default function AboutPage() {
  return (
    <>
      <JsonLd data={organizationSchema()} />
      <PageHero
        eyebrow="About COWIN MAGNET"
        title="A service-first magnetic separation equipment supplier"
        description="COWIN MAGNET is not positioned as a factory. We help overseas buyers choose suitable magnetic separation equipment, coordinate reliable supply, and make the purchasing process clearer from inquiry to delivery."
        image="/images/generated/contact-support-cowinmagnet.png"
        imageAlt="COWIN MAGNET service support for global buyers"
        secondaryHref="/products"
        secondaryLabel="View Products"
      />
      <section className="section section-split">
        <div>
          <span className="eyebrow">Who We Are</span>
          <h2>{site.legalName}</h2>
          <p>
            COWIN MAGNET focuses on magnetic separation equipment and industrial magnetic products for global B2B buyers. Our role is to understand the application, clarify the working conditions, and help buyers match suitable equipment and supply resources.
          </p>
          <p>
            Main products include overhead magnetic separators, suspended permanent magnetic separators, self-cleaning magnetic separators, magnetic drums, magnetic pulleys, plate magnets, grate magnets, magnetic bars, metal detectors, and customized magnetic separation equipment.
          </p>
          <p>
            Our core principle is service first: clear communication, practical selection advice, honest capability statements, and reliable follow-up before and after shipment.
          </p>
        </div>
        <div className="value-grid">
          {values.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="value-item">
                <Icon size={26} aria-hidden />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section section-muted">
        <div className="section-heading">
          <span className="eyebrow">What We Provide</span>
          <h2>More than products: selection, sourcing, and follow-up service</h2>
          <p>For overseas buyers, the right supplier should reduce communication cost and help avoid unsuitable equipment choices.</p>
        </div>
        <div className="service-grid">
          {services.map((service) => (
            <article className="service-card" key={service}>
              <ShieldCheck size={22} aria-hidden />
              <p>{service}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section expert-band">
        <div className="expert-photo">
          <Image src="/images/expert-david-sha.jpg" width={520} height={520} alt="David Sha from COWIN MAGNET" />
        </div>
        <div>
          <span className="eyebrow">Expert Consultant</span>
          <h2>David Sha</h2>
          <p>
            David helps buyers clarify requirements before choosing equipment: material type, belt width, belt speed, material layer, installation height, cleaning method, and target iron removal result. The goal is not to push a model quickly, but to make the buyer's decision safer and more practical.
          </p>
          <ul className="check-list">
            <li><BadgeCheck size={18} aria-hidden /> Product selection guidance for permanent and electromagnetic separators</li>
            <li><BadgeCheck size={18} aria-hidden /> OEM/ODM requirement coordination and quotation preparation</li>
            <li><BadgeCheck size={18} aria-hidden /> Service-first follow-up for global industrial inquiries</li>
          </ul>
        </div>
      </section>
      <section className="section map-section">
        <GoogleMapCard
          title="COWIN MAGNET Office Location"
          note="Route planning and nearby road context for visiting buyers and partners."
        />
      </section>
    </>
  );
}
