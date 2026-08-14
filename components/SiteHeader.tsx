"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { type Locale, localeNames, localePath, locales } from "@/lib/i18n";

type MenuName = "products" | "industries" | "news" | null;
type MenuItem = { slug: string; name: string; description?: string };
type NavigationCopy = {
  home: string;
  products: string;
  industries: string;
  news: string;
  about: string;
  quote: string;
  menu: string;
  close: string;
  skip: string;
  chooseByProcess: string;
  allProducts: string;
  allIndustrySolutions: string;
  blog: string;
  productDescription: string;
  productsMenu: MenuItem[];
  industriesMenu: MenuItem[];
};

const navigation: Record<Locale, NavigationCopy> = {
  en: {
    home: "Home", products: "Products", industries: "Industry Solutions", news: "News", about: "About & Contact",
    quote: "Request a Quote", menu: "Menu", close: "Close menu", skip: "Skip to content",
    chooseByProcess: "Choose by process condition", allProducts: "View all products", allIndustrySolutions: "All Industry Solutions", blog: "Blog",
    productDescription: "Compare suitable equipment and selection inputs.",
    productsMenu: [
      { slug: "conveyor-magnetic-separation", name: "Conveyor Magnetic Separators" },
      { slug: "mineral-bulk-separation", name: "Mineral & Bulk Separation" },
      { slug: "recycling-metal-sorting", name: "Recycling & Metal Sorting" },
      { slug: "process-magnets-filters", name: "Process Magnets & Filters" },
    ],
    industriesMenu: [
      { slug: "mining-minerals", name: "Mining & Minerals" },
      { slug: "cement-aggregates", name: "Cement & Aggregates" },
      { slug: "recycling", name: "Recycling" },
      { slug: "coal-bulk-handling", name: "Coal & Bulk Handling" },
    ],
  },
  es: {
    home: "Inicio", products: "Productos", industries: "Soluciones industriales", news: "Noticias", about: "Nosotros y contacto",
    quote: "Solicitar cotización", menu: "Menú", close: "Cerrar menú", skip: "Ir al contenido",
    chooseByProcess: "Elija según las condiciones del proceso", allProducts: "Ver todos los productos", allIndustrySolutions: "Todas las soluciones industriales", blog: "Blog",
    productDescription: "Compare equipos adecuados y datos necesarios para la selección.",
    productsMenu: [
      { slug: "conveyor-magnetic-separation", name: "Separadores magnéticos para transportadores" },
      { slug: "mineral-bulk-separation", name: "Separación de minerales y materiales a granel" },
      { slug: "recycling-metal-sorting", name: "Reciclaje y clasificación de metales" },
      { slug: "process-magnets-filters", name: "Imanes y filtros de proceso" },
    ],
    industriesMenu: [
      { slug: "mining-minerals", name: "Minería y minerales" },
      { slug: "cement-aggregates", name: "Cemento y agregados" },
      { slug: "recycling", name: "Reciclaje" },
      { slug: "coal-bulk-handling", name: "Carbón y manejo a granel" },
    ],
  },
  pt: {
    home: "Início", products: "Produtos", industries: "Soluções industriais", news: "Notícias", about: "Sobre e contato",
    quote: "Solicitar cotação", menu: "Menu", close: "Fechar menu", skip: "Ir para o conteúdo",
    chooseByProcess: "Escolha pelas condições do processo", allProducts: "Ver todos os produtos", allIndustrySolutions: "Todas as soluções industriais", blog: "Blog",
    productDescription: "Compare equipamentos adequados e informações necessárias para a seleção.",
    productsMenu: [
      { slug: "conveyor-magnetic-separation", name: "Separadores magnéticos para correias" },
      { slug: "mineral-bulk-separation", name: "Separação mineral e de materiais a granel" },
      { slug: "recycling-metal-sorting", name: "Reciclagem e separação de metais" },
      { slug: "process-magnets-filters", name: "Ímãs e filtros de processo" },
    ],
    industriesMenu: [
      { slug: "mining-minerals", name: "Mineração e minerais" },
      { slug: "cement-aggregates", name: "Cimento e agregados" },
      { slug: "recycling", name: "Reciclagem" },
      { slug: "coal-bulk-handling", name: "Carvão e manuseio a granel" },
    ],
  },
  ar: {
    home: "الرئيسية", products: "المنتجات", industries: "حلول القطاعات", news: "الأخبار", about: "من نحن والتواصل",
    quote: "اطلب عرض سعر", menu: "القائمة", close: "إغلاق القائمة", skip: "الانتقال إلى المحتوى",
    chooseByProcess: "اختر وفق ظروف العملية", allProducts: "عرض كل المنتجات", allIndustrySolutions: "كل حلول القطاعات", blog: "المدونة",
    productDescription: "قارن المعدات المناسبة ومعلومات الاختيار المطلوبة.",
    productsMenu: [
      { slug: "conveyor-magnetic-separation", name: "فواصل مغناطيسية للسيور الناقلة" },
      { slug: "mineral-bulk-separation", name: "فصل المعادن والمواد السائبة" },
      { slug: "recycling-metal-sorting", name: "إعادة التدوير وفرز المعادن" },
      { slug: "process-magnets-filters", name: "مغناطيسات وفلاتر العمليات" },
    ],
    industriesMenu: [
      { slug: "mining-minerals", name: "التعدين والمعادن" },
      { slug: "cement-aggregates", name: "الأسمنت والركام" },
      { slug: "recycling", name: "إعادة التدوير" },
      { slug: "coal-bulk-handling", name: "الفحم ومناولة المواد السائبة" },
    ],
  },
  ru: {
    home: "Главная", products: "Продукция", industries: "Отраслевые решения", news: "Новости", about: "О компании и контакты",
    quote: "Запросить предложение", menu: "Меню", close: "Закрыть меню", skip: "Перейти к содержанию",
    chooseByProcess: "Выберите по условиям процесса", allProducts: "Все продукты", allIndustrySolutions: "Все отраслевые решения", blog: "Блог",
    productDescription: "Сравните подходящее оборудование и параметры для подбора.",
    productsMenu: [
      { slug: "conveyor-magnetic-separation", name: "Конвейерные магнитные сепараторы" },
      { slug: "mineral-bulk-separation", name: "Сепарация минералов и сыпучих материалов" },
      { slug: "recycling-metal-sorting", name: "Переработка и сортировка металлов" },
      { slug: "process-magnets-filters", name: "Технологические магниты и фильтры" },
    ],
    industriesMenu: [
      { slug: "mining-minerals", name: "Горная промышленность и минералы" },
      { slug: "cement-aggregates", name: "Цемент и заполнители" },
      { slug: "recycling", name: "Переработка" },
      { slug: "coal-bulk-handling", name: "Уголь и обработка сыпучих материалов" },
    ],
  },
};

export function SiteHeader({ locale }: { locale: Locale }) {
  const t = navigation[locale];
  const [open, setOpen] = useState<MenuName>(null);
  const [drawer, setDrawer] = useState(false);
  const [mobileSection, setMobileSection] = useState<MenuName>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!drawer) return;
    const previous = document.activeElement as HTMLElement | null;
    const trigger = menuButton.current;
    const panel = drawerRef.current;
    panel?.querySelector<HTMLElement>("button, a")?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawer(false);
      if (event.key !== "Tab" || !panel) return;
      const focusable = [...panel.querySelectorAll<HTMLElement>("button, a")].filter((element) => !element.hasAttribute("disabled"));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", keydown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", keydown);
      document.body.style.overflow = "";
      (previous || trigger)?.focus();
    };
  }, [drawer]);

  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(null);
    };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, []);

  const toggle = (name: Exclude<MenuName, null>) => setOpen((current) => current === name ? null : name);
  const closeAll = () => {
    setOpen(null);
    setDrawer(false);
    setMobileSection(null);
  };

  return <>
    <a className="skip" href="#content">{t.skip}</a>
    <div className="topline" />
    <header className="site-header" onMouseLeave={() => setOpen(null)}>
      <div className="shell header-row">
        <Link className="brand" href={localePath(locale)} onClick={closeAll}><span className="brand-mark">B</span>BZMAGNET</Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          <Link href={localePath(locale)}>{t.home}</Link>
          <div className="nav-group">
            <button aria-expanded={open === "products"} aria-controls="products-menu" onClick={() => toggle("products")} onMouseEnter={() => setOpen("products")}>{t.products}<span aria-hidden="true">▾</span></button>
            {open === "products" && <div id="products-menu" className="mega-menu">
              <div className="mega-intro"><span className="eyebrow">{t.products}</span><strong>{t.chooseByProcess}</strong><Link href={localePath(locale, "products")} onClick={closeAll}>{t.allProducts} →</Link></div>
              <div className="mega-links">{t.productsMenu.map((item, index) => <Link key={item.slug} href={localePath(locale, `products/${item.slug}`)} onClick={closeAll}><span>0{index + 1}</span><strong>{item.name}</strong><small>{t.productDescription}</small></Link>)}</div>
            </div>}
          </div>
          <div className="nav-group">
            <button aria-expanded={open === "industries"} aria-controls="industries-menu" onClick={() => toggle("industries")} onMouseEnter={() => setOpen("industries")}>{t.industries}<span aria-hidden="true">▾</span></button>
            {open === "industries" && <div id="industries-menu" className="compact-menu"><Link href={localePath(locale, "industry-solutions")} onClick={closeAll}>{t.allIndustrySolutions}</Link>{t.industriesMenu.map((item) => <Link key={item.slug} href={localePath(locale, `industry-solutions/${item.slug}`)} onClick={closeAll}>{item.name}</Link>)}</div>}
          </div>
          <div className="nav-group">
            <button aria-expanded={open === "news"} aria-controls="news-menu" onClick={() => toggle("news")} onMouseEnter={() => setOpen("news")}>{t.news}<span aria-hidden="true">▾</span></button>
            {open === "news" && <div id="news-menu" className="compact-menu"><Link href={localePath(locale, "news")} onClick={closeAll}>{t.news}</Link><Link href={localePath(locale, "blog")} onClick={closeAll}>{t.blog}</Link></div>}
          </div>
          <Link href={localePath(locale, "about-contact")}>{t.about}</Link>
        </nav>
        <Link className="header-quote" href={localePath(locale, "request-quote")}>{t.quote}</Link>
        <details className="locale"><summary>{localeNames[locale]}</summary><div className="locale-menu">{locales.map((item) => <Link key={item} href={localePath(item)}>{localeNames[item]}</Link>)}</div></details>
        <button ref={menuButton} className="mobile-toggle" aria-expanded={drawer} aria-controls="mobile-drawer" onClick={() => setDrawer(true)}>{t.menu}<span aria-hidden="true">☰</span></button>
      </div>
    </header>
    {drawer && <div className="drawer-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDrawer(false); }}>
      <div ref={drawerRef} id="mobile-drawer" className="mobile-drawer" role="dialog" aria-modal="true" aria-label={t.menu}>
        <div className="drawer-head"><span className="brand"><span className="brand-mark">B</span>BZMAGNET</span><button className="drawer-close" onClick={() => setDrawer(false)} aria-label={t.close}>×</button></div>
        <div className="drawer-scroll">
          <Link className="mobile-quote" href={localePath(locale, "request-quote")} onClick={closeAll}>{t.quote}</Link>
          <Link className="mobile-link" href={localePath(locale)} onClick={closeAll}>{t.home}</Link>
          <MobileAccordion label={t.products} open={mobileSection === "products"} onToggle={() => setMobileSection(mobileSection === "products" ? null : "products")}><Link href={localePath(locale, "products")} onClick={closeAll}>{t.allProducts}</Link>{t.productsMenu.map((item) => <Link key={item.slug} href={localePath(locale, `products/${item.slug}`)} onClick={closeAll}>{item.name}</Link>)}</MobileAccordion>
          <MobileAccordion label={t.industries} open={mobileSection === "industries"} onToggle={() => setMobileSection(mobileSection === "industries" ? null : "industries")}><Link href={localePath(locale, "industry-solutions")} onClick={closeAll}>{t.allIndustrySolutions}</Link>{t.industriesMenu.map((item) => <Link key={item.slug} href={localePath(locale, `industry-solutions/${item.slug}`)} onClick={closeAll}>{item.name}</Link>)}</MobileAccordion>
          <MobileAccordion label={t.news} open={mobileSection === "news"} onToggle={() => setMobileSection(mobileSection === "news" ? null : "news")}><Link href={localePath(locale, "news")} onClick={closeAll}>{t.news}</Link><Link href={localePath(locale, "blog")} onClick={closeAll}>{t.blog}</Link></MobileAccordion>
          <Link className="mobile-link" href={localePath(locale, "about-contact")} onClick={closeAll}>{t.about}</Link>
          <div className="mobile-languages" aria-label="Languages">{locales.map((item) => <Link key={item} href={localePath(item)} onClick={closeAll} aria-current={item === locale ? "page" : undefined}>{localeNames[item]}</Link>)}</div>
        </div>
      </div>
    </div>}
  </>;
}

function MobileAccordion({ label, open, onToggle, children }: { label: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return <div className="mobile-accordion"><button aria-expanded={open} onClick={onToggle}>{label}<span aria-hidden="true">{open ? "−" : "+"}</span></button>{open && <div className="mobile-submenu">{children}</div>}</div>;
}
