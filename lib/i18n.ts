export const locales=["en","es","pt","ar","ru"] as const;
export type Locale=(typeof locales)[number];
export const isLocale=(value:string):value is Locale=>locales.includes(value as Locale);
export const localeNames:Record<Locale,string>={en:"English",es:"Español",pt:"Português",ar:"العربية",ru:"Русский"};
export const localePath=(locale:Locale,path="")=>`/${locale}${path ? `/${path.replace(/^\//,"")}`:"/"}`;
export const origin=process.env.NEXT_PUBLIC_SITE_ORIGIN || "https://bzmagnet.com";
