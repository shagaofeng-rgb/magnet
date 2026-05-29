import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { QuoteForm } from "@/components/QuoteForm";

export const metadata: Metadata = {
  title: "Request a Quote | COWIN MAGNET",
  description:
    "Request a custom quotation for magnetic separators, suspended magnets, self-cleaning separators, magnetic pulleys, magnetic bars, and industrial metal detection equipment.",
  alternates: { canonical: "/request-quote" }
};

export default function RequestQuotePage() {
  return (
    <>
      <PageHero
        eyebrow="Request Quote"
        title="Get a custom magnetic separation recommendation"
        description="Send your material, belt width, installation method, product requirement, and contact details. We will review the conditions and respond soon."
        image="/images/catalog/page-4-image-9-1537x1023.jpg"
        secondaryHref="/products"
        secondaryLabel="View Products"
      />
      <section className="section quote-page">
        <div className="section-heading align-left">
          <span className="eyebrow">Inquiry Form</span>
          <h2>Tell us your working conditions</h2>
          <p>Detailed conveyor and material information helps us avoid generic recommendations.</p>
        </div>
        <QuoteForm />
      </section>
    </>
  );
}
