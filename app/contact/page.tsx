import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { GoogleMapCard } from "@/components/GoogleMapCard";
import { PageHero } from "@/components/PageHero";
import { QuoteForm } from "@/components/QuoteForm";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Contact COWIN MAGNET",
  description:
    "Contact COWIN MAGNET for magnetic separator selection, product inquiries, OEM/ODM customization, and global B2B quotation support.",
  alternates: { canonical: "/contact" }
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Send your magnetic separation requirement"
        description="Share your product requirement, country, material, conveyor conditions, and contact details. Our sales team will contact you soon."
        image="/images/generated/contact-support-cowinmagnet.png"
      />
      <section className="section map-section">
        <GoogleMapCard title="Find COWIN MAGNET in Quzhou, China" />
      </section>
      <section className="section contact-layout">
        <div className="contact-info">
          <h2>Contact Information</h2>
          <a href={`mailto:${site.email}`}><Mail size={18} aria-hidden />{site.email}</a>
          <a href={`https://wa.me/${site.whatsapp}`}><MessageCircle size={18} aria-hidden />WhatsApp: {site.whatsapp}</a>
          <a href={`tel:${site.phone.replaceAll(" ", "")}`}><Phone size={18} aria-hidden />{site.phone}</a>
          <span><MapPin size={18} aria-hidden />{site.address}</span>
          <p>For faster selection, include belt width, material, belt speed, suspension height, and iron contamination level.</p>
        </div>
        <QuoteForm />
      </section>
    </>
  );
}
