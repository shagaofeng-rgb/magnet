import en from "@/messages/en.json";
import es from "@/messages/es.json";
import ru from "@/messages/ru.json";
import ar from "@/messages/ar.json";
import fr from "@/messages/fr.json";
import pt from "@/messages/pt.json";

export const locales = ["en", "es", "ru", "ar", "fr", "pt"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";
export const rtlLocales: Locale[] = ["ar"];

export const dictionaries = { en, es, ru, ar, fr, pt } as const;

export const languageLabels: Record<Locale, string> = {
  en: "English",
  es: "Español",
  ru: "Русский",
  ar: "العربية",
  fr: "Français",
  pt: "Português"
};

export function isLocale(value: string | undefined): value is Locale {
  return Boolean(value && locales.includes(value as Locale));
}

export function getDictionary(locale: string | undefined) {
  return isLocale(locale) ? dictionaries[locale] : dictionaries[defaultLocale];
}

export function getDirection(locale: string | undefined) {
  return isLocale(locale) && rtlLocales.includes(locale) ? "rtl" : "ltr";
}

export function getLocaleFromPath(pathname: string | null | undefined): Locale {
  const first = pathname?.split("/").filter(Boolean)[0];
  return isLocale(first) ? first : defaultLocale;
}

export function stripLocale(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  if (isLocale(parts[0])) {
    parts.shift();
  }

  return `/${parts.join("/")}`.replace(/\/$/, "") || "/";
}

export function localePath(locale: Locale, path = "/") {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return cleanPath === "/" ? `/${locale}` : `/${locale}${cleanPath}`;
}

export function localizeHref(path: string, locale: Locale) {
  if (path.startsWith("http") || path.startsWith("mailto:") || path.startsWith("tel:") || path.startsWith("#")) {
    return path;
  }

  return localePath(locale, stripLocale(path));
}

export function localizedAlternates(path: string) {
  return {
    canonical: localePath(defaultLocale, path),
    languages: {
      ...Object.fromEntries(locales.map((locale) => [locale, localePath(locale, path)])),
      "x-default": localePath(defaultLocale, path)
    }
  };
}

export function localizedPageAlternates(locale: Locale, path: string) {
  return {
    canonical: localePath(locale, path),
    languages: {
      ...Object.fromEntries(locales.map((item) => [item, localePath(item, path)])),
      "x-default": localePath(defaultLocale, path)
    }
  };
}
