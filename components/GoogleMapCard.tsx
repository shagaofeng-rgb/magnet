import Link from "next/link";
import Image from "next/image";
import { ExternalLink, MapPin } from "lucide-react";
import { site } from "@/data/site";

type GoogleMapCardProps = {
  address?: string;
  title?: string;
  note?: string;
};

export function GoogleMapCard({
  address = site.address,
  title = "Visit COWIN MAGNET",
  note = "Use Google Maps for route planning, nearby roads, and satellite view."
}: GoogleMapCardProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const encodedAddress = encodeURIComponent(address);
  const googleEmbedUrl = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodedAddress}&zoom=14`;
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
  const osmFallbackUrl = `https://www.openstreetmap.org/export/embed.html?bbox=118.87%2C28.86%2C118.98%2C28.96&layer=mapnik&marker=28.91%2C118.925`;

  return (
    <section className="map-card" aria-label="Company location map">
      <div className="map-card-header">
        <div>
          <span className="map-kicker">
            <MapPin size={16} aria-hidden />
            Company Location
          </span>
          <h2>{title}</h2>
          <p>{address}</p>
          <p className="map-note">{note}</p>
        </div>
        <Link href={googleMapsUrl} className="map-button" target="_blank" rel="noreferrer">
          View on Google Maps
          <ExternalLink size={16} aria-hidden />
        </Link>
      </div>
      <div className="map-frame-wrap">
        <div className="map-logo-marker" aria-hidden>
          <Image src="/images/logo.jpg" width={42} height={42} alt="" />
        </div>
        <iframe
          title={`${site.name} location map`}
          src={apiKey ? googleEmbedUrl : osmFallbackUrl}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
      {!apiKey && (
        <p className="map-fallback-note">
          Google Maps API key is not configured yet, so this preview uses an OpenStreetMap fallback.
        </p>
      )}
      <div className="map-card-glow" aria-hidden />
    </section>
  );
}
