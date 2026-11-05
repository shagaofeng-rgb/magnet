"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { ProductPhoto } from "./ProductPhoto";

export type CatalogItem = {
  id: string;
  title: string;
  summary: string;
  model?: string;
  productType: string;
  image: string;
  alt: string;
  href: string;
};

const copy: Record<Locale, { search: string; all: string; permanent: string; electromagnetic: string; empty: string; previous: string; next: string; view: string; page: string }> = {
  en: { search: "Search models", all: "All equipment", permanent: "Permanent", electromagnetic: "Electromagnetic", empty: "No published products match this search.", previous: "Previous", next: "Next", view: "View product", page: "Page" },
  es: { search: "Buscar modelos", all: "Todos los equipos", permanent: "Permanente", electromagnetic: "Electromagnético", empty: "No hay productos publicados que coincidan.", previous: "Anterior", next: "Siguiente", view: "Ver producto", page: "Página" },
  pt: { search: "Pesquisar modelos", all: "Todos os equipamentos", permanent: "Permanente", electromagnetic: "Eletromagnético", empty: "Nenhum produto publicado corresponde à pesquisa.", previous: "Anterior", next: "Próxima", view: "Ver produto", page: "Página" },
  ar: { search: "ابحث عن الطراز", all: "جميع المعدات", permanent: "دائم", electromagnetic: "كهرومغناطيسي", empty: "لا توجد منتجات منشورة تطابق البحث.", previous: "السابق", next: "التالي", view: "عرض المنتج", page: "صفحة" },
  ru: { search: "Поиск моделей", all: "Все оборудование", permanent: "Постоянный", electromagnetic: "Электромагнитный", empty: "Опубликованные продукты по запросу не найдены.", previous: "Назад", next: "Далее", view: "Открыть продукт", page: "Страница" },
};

const PAGE_SIZE = 9;

export function ProductCategoryCatalog({ locale, items, showMagnetFilters = false }: { locale: Locale; items: CatalogItem[]; showMagnetFilters?: boolean }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "permanent" | "electromagnetic">("all");
  const [page, setPage] = useState(1);
  const t = copy[locale];
  const filtered = useMemo(() => items.filter((item) => {
    const matchesQuery = `${item.title} ${item.model || ""} ${item.summary}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
    const matchesFilter = filter === "all" || item.productType.toLowerCase().includes(filter);
    return matchesQuery && matchesFilter;
  }), [items, query, filter]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selectFilter = (value: typeof filter) => { setFilter(value); setPage(1); };

  return <>
    <div className="catalog-controls">
      {showMagnetFilters && <div className="catalog-chips" role="group" aria-label={t.all}>
        {(["all", "permanent", "electromagnetic"] as const).map((value) => <button key={value} type="button" aria-pressed={filter === value} onClick={() => selectFilter(value)}>{t[value]}</button>)}
      </div>}
      <label className="catalog-search"><span className="sr-only">{t.search}</span><input type="search" value={query} placeholder={t.search} onChange={(event) => { setQuery(event.target.value); setPage(1); }} /></label>
    </div>
    {visible.length ? <div className="catalog-grid">{visible.map((item) => <article className="catalog-card" key={item.id}>
      <Link className="catalog-card-media" href={item.href}><ProductPhoto src={item.image} alt={item.alt} /></Link>
      <div className="catalog-card-body">{item.model && <span className="eyebrow">{item.model}</span>}<h2><Link href={item.href}>{item.title}</Link></h2><p>{item.summary}</p><Link className="card-link" href={item.href}>{t.view} <span aria-hidden="true">→</span></Link></div>
    </article>)}</div> : <div className="catalog-empty" role="status">{t.empty}</div>}
    {pageCount > 1 && <nav className="catalog-pagination" aria-label={t.page}>
      <button type="button" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>{t.previous}</button>
      <span>{t.page} {page} / {pageCount}</span>
      <button type="button" onClick={() => setPage(Math.min(pageCount, page + 1))} disabled={page === pageCount}>{t.next}</button>
    </nav>}
  </>;
}
