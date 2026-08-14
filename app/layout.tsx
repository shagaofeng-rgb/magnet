import "./globals.css";
import "./hero.css";
import "./navigation.css";
import "./homepage.css";
import "./brand-overrides.css";
import "./product-detail.css";
import "./editorial.css";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { isLocale } from "@/lib/i18n";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_ORIGIN || "https://bzmagnet.com"),
  title: { default: "BZMAGNET | Magnetic Separation Equipment", template: "%s | BZMAGNET" },
  description: "Practical magnetic separation equipment selection for industrial buyers.",
  applicationName: "BZMAGNET",
  icons: { icon: "/icon.png", apple: "/apple-icon.png" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const requestedLocale = (await headers()).get("x-bzmagnet-locale");
  const locale = requestedLocale && isLocale(requestedLocale) ? requestedLocale : "en";

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <body>{children}</body>
    </html>
  );
}
