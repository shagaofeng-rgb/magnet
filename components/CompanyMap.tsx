import type { Locale } from "@/lib/i18n";

const labels: Record<Locale, { title: string; open: string }> = {
  en: { title: "Company location", open: "Open in Google Maps" },
  es: { title: "Ubicación de la empresa", open: "Abrir en Google Maps" },
  pt: { title: "Localização da empresa", open: "Abrir no Google Maps" },
  ar: { title: "موقع الشركة", open: "فتح في خرائط Google" },
  ru: { title: "Местоположение компании", open: "Открыть в Google Картах" },
};

export function CompanyMap({ locale }: { locale: Locale }) {
  const copy = labels[locale];
  return <section className="section section-white" aria-labelledby="company-map-title">
    <div className="shell">
      <div className="section-head">
        <h2 id="company-map-title">{copy.title}</h2>
        <a href="https://maps.app.goo.gl/P1YyVHoCdGBd9ef37" target="_blank" rel="noopener noreferrer">{copy.open} ↗</a>
      </div>
      <iframe
        title={`BZMAGNET — ${copy.title}`}
        src={`https://www.google.com/maps?q=28.965204,118.839750&z=16&hl=${locale}&output=embed`}
        width="100%"
        height="420"
        style={{ display: "block", border: 0, borderRadius: 16, maxWidth: "100%" }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  </section>;
}
