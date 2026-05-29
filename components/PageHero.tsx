import Image from "next/image";
import Link from "next/link";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export function PageHero({
  eyebrow,
  title,
  description,
  image,
  imageAlt = "",
  primaryHref = "/request-quote",
  primaryLabel = "Get a Quote",
  secondaryHref,
  secondaryLabel
}: PageHeroProps) {
  return (
    <section className="page-hero">
      <div className="page-hero-copy">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
        <div className="hero-actions">
          <Link href={primaryHref} className="btn btn-primary">{primaryLabel}</Link>
          {secondaryHref && secondaryLabel && (
            <Link href={secondaryHref} className="btn btn-secondary">{secondaryLabel}</Link>
          )}
        </div>
      </div>
      {image && (
        <div className="page-hero-media">
          <Image src={image} width={780} height={520} alt={imageAlt} priority />
        </div>
      )}
    </section>
  );
}
