"use client";

import Link from "next/link";
import { localePath, type Locale } from "@/lib/i18n";

export function MobileConversionBar({ locale, whatsappUrl }: { locale: Locale; whatsappUrl?: string }) {
  return <aside className="mobile-conversion-bar" aria-label="Quick contact actions">
    {whatsappUrl ? <a href={whatsappUrl} target="_blank" rel="noreferrer">WhatsApp</a> : <Link href={localePath(locale, "contact")}>WhatsApp</Link>}
    <Link href={localePath(locale, "request-quote")}>Get a Quote</Link>
  </aside>;
}
