import { Locale,locales,origin } from "./i18n";
export function alternates(locale:Locale,path=""){const languages=Object.fromEntries(locales.map(l=>[l,`${origin}/${l}/${path}`]));return {canonical:`${origin}/${locale}/${path}`,languages:{...languages,"x-default":`${origin}/en/${path}`}}}
