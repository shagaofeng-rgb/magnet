import { Locale,locales,origin } from "./i18n";
const localizedUrl=(locale:Locale,path="")=>`${origin}/${locale}${path?`/${path.replace(/^\//,"")}`:""}`;
export function alternates(locale:Locale,path=""){const languages=Object.fromEntries(locales.map(l=>[l,localizedUrl(l,path)]));return {canonical:localizedUrl(locale,path),languages:{...languages,"x-default":localizedUrl("en",path)}}}
