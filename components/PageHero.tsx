import Image from "next/image";
import Link from "next/link";

type PageHeroProps = { eyebrow: string; title: string; intro: string; image?: string; ctaHref?: string; ctaLabel?: string };

export function PageHero({ eyebrow, title, intro, image, ctaHref, ctaLabel }: PageHeroProps) {
  return <section className={`page-hero${image ? " page-hero-photo" : ""}`}>
    {image && <Image className="page-hero-image" src={image} alt="" fill priority sizes="100vw" />}
    <div className="shell page-hero-content">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p className="lead">{intro}</p>
      {ctaHref && ctaLabel && <Link className="btn btn-orange" href={ctaHref}>{ctaLabel} <span aria-hidden="true">↗</span></Link>}
    </div>
  </section>;
}
