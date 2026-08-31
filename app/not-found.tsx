import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { isLocale, type Locale } from "@/lib/i18n";

export const metadata: Metadata = { robots: { index: false, follow: true } };

const copy:Record<Locale,{title:string;text:string;back:string}>={en:{title:"Page not found",text:"The page may have moved or is not available.",back:"Return to BZMAGNET"},es:{title:"Página no encontrada",text:"Es posible que la página se haya movido o no esté disponible.",back:"Volver a BZMAGNET"},pt:{title:"Página não encontrada",text:"A página pode ter sido movida ou não estar disponível.",back:"Voltar à BZMAGNET"},ar:{title:"الصفحة غير موجودة",text:"ربما تم نقل الصفحة أو أنها غير متاحة.",back:"العودة إلى BZMAGNET"},ru:{title:"Страница не найдена",text:"Возможно, страница перемещена или недоступна.",back:"Вернуться на BZMAGNET"}};
export default async function NotFound() {
  const requested=(await headers()).get("x-bzmagnet-locale");const locale=requested&&isLocale(requested)?requested:"en";const text=copy[locale];
  return <main className="section"><div className="shell prose"><span className="eyebrow">404</span><h1>{text.title}</h1><p>{text.text}</p><Link className="btn btn-primary" href={`/${locale}`}>{text.back}</Link></div></main>;
}
