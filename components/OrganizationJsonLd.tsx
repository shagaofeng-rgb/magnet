import { siteConfig } from "@/lib/site";
import { JsonLd } from "./JsonLd";

export function OrganizationJsonLd() {
  const contactPoint = siteConfig.contact.email || siteConfig.contact.whatsapp
    ? {
        "@type": "ContactPoint",
        ...(siteConfig.contact.email ? { email: siteConfig.contact.email } : {}),
        ...(siteConfig.contact.whatsapp ? { telephone: siteConfig.contact.whatsapp } : {}),
        contactType: "sales",
      }
    : undefined;
  return <JsonLd data={{ "@context": "https://schema.org", "@type": "Organization", name: siteConfig.name, url: siteConfig.url, ...(contactPoint ? { contactPoint } : {}) }} />;
}
