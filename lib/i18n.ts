export const locales=["en","es","pt","ar","ru"] as const;
export type Locale=(typeof locales)[number];
export const isLocale=(value:string):value is Locale=>locales.includes(value as Locale);
export const localeNames:Record<Locale,string>={en:"English",es:"Español",pt:"Português",ar:"العربية",ru:"Русский"};
// Keep locale home links in their canonical, slashless form. This avoids
// emitting a second URL variant for every home and language-switcher link.
export const localePath=(locale:Locale,path="")=>`/${locale}${path ? `/${path.replace(/^\//,"")}`:""}`;
export const origin=process.env.NEXT_PUBLIC_SITE_ORIGIN || "https://bzmagnet.com";
