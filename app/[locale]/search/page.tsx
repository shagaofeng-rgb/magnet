import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { ProductPhoto } from "@/components/ProductPhoto";
import { isLocale, type Locale } from "@/lib/i18n";
import { productPathFor, publicProducts } from "@/lib/product-model";

export const metadata = { robots: { index: false, follow: true } };

const copy: Record<Locale, { title: string; intro: string; search: string; empty: string; prompt: string; view: string; previous: string; next: string }> = {
  en: { title: "Search", intro: "Find published equipment by model, name or process description.", search: "Search equipment", empty: "No published equipment matches this search.", prompt: "Enter a product name, model or process term.", view: "View product", previous: "Previous", next: "Next" },
  es: { title: "Buscar", intro: "Encuentre equipos publicados por modelo, nombre o proceso.", search: "Buscar equipos", empty: "No hay equipos publicados que coincidan.", prompt: "Introduzca un nombre, modelo o término de proceso.", view: "Ver producto", previous: "Anterior", next: "Siguiente" },
  pt: { title: "Pesquisar", intro: "Encontre equipamentos publicados por modelo, nome ou processo.", search: "Pesquisar equipamentos", empty: "Nenhum equipamento publicado corresponde à pesquisa.", prompt: "Digite um nome, modelo ou termo do processo.", view: "Ver produto", previous: "Anterior", next: "Próxima" },
  ar: { title: "البحث", intro: "ابحث عن المعدات المنشورة حسب الطراز أو الاسم أو العملية.", search: "ابحث عن المعدات", empty: "لا توجد معدات منشورة تطابق البحث.", prompt: "أدخل اسم المنتج أو الطراز أو مصطلح العملية.", view: "عرض المنتج", previous: "السابق", next: "التالي" },
  ru: { title: "Поиск", intro: "Найдите опубликованное оборудование по модели, названию или процессу.", search: "Найти оборудование", empty: "Опубликованное оборудование не найдено.", prompt: "Введите название, модель или термин процесса.", view: "Открыть продукт", previous: "Назад", next: "Далее" },
};

export default async function Search({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ q?: string | string[]; page?: string | string[] }> }) {
  const [{ locale }, { q, page }] = await Promise.all([params, searchParams]);
  if (!isLocale(locale)) notFound();
  const term = (Array.isArray(q) ? q[0] : q)?.trim().slice(0, 80) || "";
  const t = copy[locale];
  const results = term ? publicProducts.filter((product) => {
    const content = `${product.model || ""} ${product.locale[locale].title} ${product.locale[locale].summary}`.toLocaleLowerCase();
    return content.includes(term.toLocaleLowerCase());
  }) : [];
  const pageCount = Math.max(1, Math.ceil(results.length / 12));
  const parsedPage = Number.parseInt((Array.isArray(page) ? page[0] : page) || "1", 10);
  const currentPage = Number.isFinite(parsedPage) ? Math.min(Math.max(parsedPage, 1), pageCount) : 1;
  const items = results.slice((currentPage - 1) * 12, currentPage * 12);
  const query = encodeURIComponent(term);

  return <>
    <PageHero eyebrow={t.title} title={t.title} intro={t.intro} />
    <section className="section catalog-section"><div className="shell">
      <form className="site-search-form" action={`/${locale}/search`} method="get" role="search">
        <label className="sr-only" htmlFor="site-search-query">{t.search}</label>
        <input id="site-search-query" type="search" name="q" defaultValue={term} maxLength={80} placeholder={t.search} />
        <button className="btn btn-orange" type="submit">{t.search}</button>
      </form>
      {!term ? <div className="catalog-empty" role="status">{t.prompt}</div> : !items.length ? <div className="catalog-empty" role="status">{t.empty}</div> : <div className="catalog-grid">{items.map((product) => {
        const href = productPathFor(locale, product);
        return <article className="catalog-card" key={product.id}>
          <Link className="catalog-card-media" href={href}><ProductPhoto src={product.media[0].src} alt={product.media[0].alt[locale]} /></Link>
          <div className="catalog-card-body"><span className="eyebrow">{product.model}</span><h2><Link href={href}>{product.locale[locale].title}</Link></h2><p>{product.locale[locale].summary}</p><Link className="card-link" href={href}>{t.view} →</Link></div>
        </article>;
      })}</div>}
      {pageCount > 1 && <nav className="catalog-pagination" aria-label={t.title}>
        {currentPage > 1 && <Link href={`/${locale}/search?q=${query}&page=${currentPage - 1}`}>{t.previous}</Link>}
        <span>{currentPage} / {pageCount}</span>
        {currentPage < pageCount && <Link href={`/${locale}/search?q=${query}&page=${currentPage + 1}`}>{t.next}</Link>}
      </nav>}
    </div></section>
  </>;
}
