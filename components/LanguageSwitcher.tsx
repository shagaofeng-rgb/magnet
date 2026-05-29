"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe2 } from "lucide-react";
import { getLocaleFromPath, languageLabels, localePath, locales, stripLocale } from "@/lib/i18n";

export function LanguageSwitcher() {
  const pathname = usePathname();
  const currentLocale = getLocaleFromPath(pathname);
  const cleanPath = stripLocale(pathname || "/");

  return (
    <div className="language-switcher">
      <button className="language-trigger" type="button" aria-label="Choose language">
        <Globe2 size={16} aria-hidden />
        <span>{currentLocale.toUpperCase()}</span>
      </button>
      <div className="language-menu">
        {locales.map((locale) => (
          <Link
            key={locale}
            href={localePath(locale, cleanPath)}
            className={locale === currentLocale ? "active" : undefined}
            hrefLang={locale}
          >
            <span>{locale.toUpperCase()}</span>
            {languageLabels[locale]}
          </Link>
        ))}
      </div>
    </div>
  );
}
