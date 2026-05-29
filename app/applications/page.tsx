import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { applications } from "@/data/applications";

export const metadata: Metadata = {
  title: "Applications | Magnetic Separation for Mining, Recycling and Cement",
  description:
    "COWIN MAGNET magnetic separators are used in mining, recycling, aggregate, cement, coal handling, power plants, metallurgy, and industrial bulk material processing.",
  alternates: { canonical: "/applications" }
};

export default function ApplicationsPage() {
  return (
    <>
      <PageHero
        eyebrow="Applications"
        title="Magnetic separation solutions by industrial application"
        description="Select your industry to review common pain points, suitable product types, and quote information needed for equipment selection."
        image="/images/catalog/page-6-image-3-1349x734.jpg"
      />
      <section className="section">
        <div className="application-grid">
          {applications.map((application) => (
            <article key={application.slug} className="application-card">
              <Image src={application.image} width={620} height={390} alt={`${application.name} magnetic separation`} />
              <div>
                <h2>{application.name}</h2>
                <p>{application.summary}</p>
                <Link href={`/applications/${application.slug}`} className="text-link">
                  View solution <ArrowRight size={16} aria-hidden />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
