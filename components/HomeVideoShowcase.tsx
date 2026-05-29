import Link from "next/link";
import { PlayCircle } from "lucide-react";

type HomeVideoShowcaseProps = {
  eyebrow: string;
  title: string;
  text: string;
  quoteHref: string;
  quoteLabel: string;
};

export function HomeVideoShowcase({ eyebrow, title, text, quoteHref, quoteLabel }: HomeVideoShowcaseProps) {
  return (
    <section className="section video-showcase" aria-labelledby="home-video-title">
      <div className="video-showcase-copy">
        <span className="eyebrow">{eyebrow}</span>
        <h2 id="home-video-title">{title}</h2>
        <p>{text}</p>
        <div className="video-feature-list">
          <span>Product details</span>
          <span>Service communication</span>
          <span>Global buyer support</span>
        </div>
        <Link href={quoteHref} className="btn btn-primary">
          {quoteLabel}
        </Link>
      </div>
      <div className="video-tech-card">
        <div className="video-card-header">
          <span><PlayCircle size={16} aria-hidden /> COWIN MAGNET Video</span>
          <strong>9:16</strong>
        </div>
        <div className="vertical-video-frame">
          <video
            src="/videos/cowinmagnet-vertical-showcase.mp4"
            controls
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="COWIN MAGNET vertical product and service showcase video"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </section>
  );
}
