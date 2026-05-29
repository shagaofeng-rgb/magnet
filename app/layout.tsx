import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { WhatsAppFloatingButton } from "@/components/WhatsAppFloatingButton";
import { organizationSchema } from "@/lib/seo";
import { site } from "@/data/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "COWIN MAGNET | Magnetic Separator Supplier",
    template: "%s | COWIN MAGNET"
  },
  description: site.description,
  keywords: [
    "magnetic separator supplier",
    "overhead magnetic separator",
    "suspended magnetic separator",
    "self-cleaning magnetic separator",
    "magnetic pulley",
    "magnetic drum separator",
    "grate magnet",
    "magnetic bar"
  ],
  alternates: {
    canonical: "/",
    languages: {
      en: "/en",
      es: "/es",
      ru: "/ru",
      ar: "/ar",
      fr: "/fr",
      pt: "/pt",
      "x-default": "/en"
    }
  },
  openGraph: {
    type: "website",
    url: site.url,
    title: "COWIN MAGNET | Magnetic Separator Supplier",
    description: site.description,
    images: ["/images/catalog/page-1-image-9-2546x1532.jpg"]
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <JsonLd data={organizationSchema()} />
        <Header />
        <main>{children}</main>
        <Footer />
        <WhatsAppFloatingButton />
      </body>
    </html>
  );
}
