import { origin } from "./i18n";

const optional = (value?: string) => value?.trim() || undefined;

/** Public, verified company fields belong here. Empty fields are omitted from markup. */
export const siteConfig = {
  name: "BZMAGNET",
  url: origin,
  defaultTitle: "Magnetic Separation Equipment for Industrial Applications",
  defaultDescription: "Practical magnetic separation equipment selection, product sourcing and export coordination for industrial buyers.",
  defaultOgImage: "/media/generated/home-hero-v2.png",
  contact: {
    email: optional(process.env.BZMAGNET_PUBLIC_EMAIL),
    whatsapp: optional(process.env.BZMAGNET_PUBLIC_PHONE),
    address: optional(process.env.BZMAGNET_PUBLIC_ADDRESS),
  },
} as const;

export function absoluteUrl(path = "") {
  return new URL(path || "/", siteConfig.url).toString();
}

export function whatsappHref() {
  const number = siteConfig.contact.whatsapp?.replace(/[^\d]/g, "");
  return number ? `https://wa.me/${number}` : undefined;
}
