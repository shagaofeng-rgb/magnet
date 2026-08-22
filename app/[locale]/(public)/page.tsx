import Link from "next/link";

type Locale = "en" | "es" | "pt" | "ar" | "ru";

type CopyBlock = {
  locale: Locale;
  title: string;
  description: string;
  buttonPrimary: string;
  buttonSecondary: string;
  badge: string;
  trustLabel: string;
  sectionProducts: string;
  sectionSolutions: string;
  sectionInsights: string;
  sectionContact: string;
};

const COPY: Record<Locale, CopyBlock> = {
  en: {
    locale: "en",
    title: "Find the right magnetic separation solution for bulk-material workflows",
    description:
      "We help distributors and buyers quickly match equipment for conveyors, crushing lines, and sorting projects with practical, application-driven guidance.",
    buttonPrimary: "Browse Products",
    buttonSecondary: "Request a Quote",
    badge: "BZMAGNET Industrial Solutions",
    trustLabel: "Trusted by exporters and trading teams",
    sectionProducts: "Products",
    sectionSolutions: "Industry Solutions",
    sectionInsights: "Latest Insights",
    sectionContact: "Need a tailored recommendation?",
  },
  es: {
    locale: "es",
    title: "Encuentra la solución de separación magnética adecuada para sus procesos",
    description:
      "Ayudamos a distribuidores y compradores a emparejar equipos de forma práctica para cintas, trituración y clasificación de materiales.",
    buttonPrimary: "Ver productos",
    buttonSecondary: "Solicitar cotización",
    badge: "Soluciones industriales BZMAGNET",
    trustLabel: "Diseñado para equipos de exportación y compras B2B",
    sectionProducts: "Productos",
    sectionSolutions: "Soluciones por industria",
    sectionInsights: "Últimos contenidos",
    sectionContact: "¿Necesitas una recomendación personalizada?",
  },
  pt: {
    locale: "pt",
    title: "Encontre a solução ideal de separação magnética para o seu processo",
    description:
      "Apoiamos distribuidores e compradores a combinar rapidamente equipamentos para correias, britagem e linha de classificação com orientação prática por aplicação.",
    buttonPrimary: "Ver produtos",
    buttonSecondary: "Solicitar orçamento",
    badge: "Soluções industriais BZMAGNET",
    trustLabel: "Feito para operações globais de exportação",
    sectionProducts: "Produtos",
    sectionSolutions: "Soluções por setor",
    sectionInsights: "Últimas notícias",
    sectionContact: "Precisa de recomendação personalizada?",
  },
  ar: {
    locale: "ar",
    title: "اعثر على الحل المناسب لفصل المواد المغناطيسي لمسارات التشغيل",
    description:
      "نساعد الموزعين والمشترين على مطابقة المعدات المناسبة لعمليات السيور والنقل والفرز بسرعة مع إرشادات عملية موجّهة للتطبيق.",
    buttonPrimary: "تصفح المنتجات",
    buttonSecondary: "طلب عرض سعر",
    badge: "BZMAGNET للحلول الصناعية",
    trustLabel: "تصميم مخصص لمشاريع التوريد العالمي",
    sectionProducts: "المنتجات",
    sectionSolutions: "حلول الصناعات",
    sectionInsights: "أحدث الأخبار",
    sectionContact: "هل تحتاج توصية مخصصة؟",
  },
  ru: {
    locale: "ru",
    title: "Подберите решение магнитной сепарации для вашего технологического контура",
    description:
      "Помогаем дистрибьюторам и закупщикам быстро выбрать оборудование для конвейерных линий, дробления и сортировки с практической привязкой к применению.",
    buttonPrimary: "Посмотреть товары",
    buttonSecondary: "Запросить предложение",
    badge: "Промышленные решения BZMAGNET",
    trustLabel: "Подходит для экспортно-торговых сценариев",
    sectionProducts: "Товары",
    sectionSolutions: "Отраслевые решения",
    sectionInsights: "Новости и обзоры",
    sectionContact: "Нужна индивидуальная рекомендация?",
  },
};

const productCards = [
  {
    title: "Conveyor Magnetic Separators",
    label: "Conveyor protection · ferrous control",
    href: "/products",
    value: "High-precision selection for conveyor lines.",
  },
  {
    title: "Mineral & Bulk Separation",
    label: "Minerals · minerals and aggregates",
    href: "/products",
    value: "Processing-oriented separation for bulk materials.",
  },
  {
    title: "Recycling & Metal Sorting",
    label: "Recycling · process sorting",
    href: "/products",
    value: "Practical options for mixed-metal recovery.",
  },
  {
    title: "Process Magnets & Filters",
    label: "Process stream · filtration support",
    href: "/products",
    value: "Dry and controlled stream support.",
  },
];

const solutionCards = [
  {
    title: "Mining & Minerals",
    href: "/industry-solutions/mining-minerals",
  },
  {
    title: "Cement & Aggregates",
    href: "/industry-solutions/cement-aggregates",
  },
  {
    title: "Recycling",
    href: "/industry-solutions/recycling",
  },
  {
    title: "Coal & Bulk Handling",
    href: "/industry-solutions/coal-bulk-handling",
  },
];

const insightCards = [
  {
    title: "Featured product selection checklist",
    href: "/news",
  },
  {
    title: "How to compare conveyor magnetic routes",
    href: "/news",
  },
  {
    title: "Practical QA for bulk-material projects",
    href: "/news",
  },
];

export default async function Home({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const copy = COPY[locale];
  const isRtl = locale === "ar";

  return (
    <div
      className="min-h-screen bg-[#f7f8fb] text-[#13223a]"
      style={isRtl ? { direction: "rtl" } : undefined}
    >
      <section className="relative overflow-hidden border-b border-[#d6deed] bg-white">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-12 px-4 py-12 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-6 lg:py-16">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#e4ebf7] px-3 py-1 text-xs font-semibold tracking-wide text-[#0f5ac8]">
              {copy.badge}
            </p>
            <h1 className="text-3xl leading-tight font-bold tracking-tight text-[#0f2f5f] sm:text-4xl lg:text-5xl">
              {copy.title}
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-[#314566] sm:text-lg">
              {copy.description}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                className="rounded-full bg-[#f59e0b] px-6 py-3 text-sm font-semibold text-[#2b2b2b] transition hover:brightness-95"
                href={`/${locale}/products`}
              >
                {copy.buttonPrimary}
              </Link>
              <Link
                className="rounded-full border border-[#1d4ed8] px-6 py-3 text-sm font-semibold text-[#1d4ed8] transition hover:bg-[#eef4ff]"
                href={`/${locale}/quote`}
              >
                {copy.buttonSecondary}
              </Link>
            </div>
            <p className="text-sm text-[#51617a]">{copy.trustLabel}</p>
          </div>
          <div className="rounded-3xl border border-[#dae3f2] bg-gradient-to-br from-[#f8fbff] via-[#ecf3ff] to-[#f4f4f4] p-8">
            <div className="rounded-2xl border border-[#dbe5f6] bg-white p-6">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.08em] text-[#7d8ca5]">
                {locale === "ar" ? "مقارنة سريعة" : "Quick Snapshot"}
              </p>
              <ul className="space-y-3 text-sm text-[#243a5f]">
                <li>• {copy.sectionContact}</li>
                <li>• {copy.sectionProducts} / {copy.sectionSolutions}</li>
                <li>• {copy.sectionInsights} / {copy.sectionContact}</li>
              </ul>
              <div className="mt-5 rounded-full bg-[#1d4ed8]/10 p-3 text-xs font-medium text-[#1d4ed8]">
                {copy.trustLabel}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-4 py-12 lg:px-6">
        <h2 className="text-2xl font-bold text-[#0f2f5f]">{copy.sectionProducts}</h2>
        <p className="mt-2 text-sm text-[#546684]">
          Filter by type and check specification guidance on each product page.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {productCards.map((item) => (
            <Link
              key={item.title}
              href={`/${locale}${item.href}`}
              className="group rounded-2xl border border-[#d8e2f2] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#aac0eb]"
            >
              <p className="mb-2 text-sm font-semibold text-[#f59e0b]">{item.label}</p>
              <h3 className="text-lg font-bold text-[#10264d]">{item.title}</h3>
              <p className="mt-2 text-sm text-[#435878]">{item.value}</p>
              <span className="mt-4 inline-flex text-sm font-semibold text-[#1d4ed8]">
                View Category →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-4 py-12 lg:px-6">
        <h2 className="text-2xl font-bold text-[#0f2f5f]">{copy.sectionSolutions}</h2>
        <p className="mt-2 text-sm text-[#546684]">
          Select the scenario closest to your current workflow first.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {solutionCards.map((item) => (
            <Link
              key={item.title}
              href={`/${locale}${item.href}`}
              className="rounded-2xl border border-[#d8e2f2] bg-white p-5"
            >
              <h3 className="text-lg font-semibold text-[#10264d]">{item.title}</h3>
              <p className="mt-2 text-sm text-[#435878]">
                Explore practical use cases and recommendation checkpoints.
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-4 py-12 lg:px-6">
        <h2 className="text-2xl font-bold text-[#0f2f5f]">{copy.sectionInsights}</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {insightCards.map((item) => (
            <Link
              key={item.title}
              href={`/${locale}${item.href}`}
              className="rounded-2xl border border-[#d8e2f2] bg-[#ffffff] p-5 hover:border-[#f59e0b]/70"
            >
              <p className="text-sm font-semibold text-[#1d4ed8]">News</p>
              <h3 className="mt-1 text-base font-semibold text-[#10264d]">
                {item.title}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto mb-10 max-w-[1200px] px-4 py-2 lg:px-6">
        <div className="rounded-3xl border border-[#dbe7fb] bg-[#0f2f5f] p-8 text-white">
          <h2 className="text-2xl font-bold">{copy.sectionContact}</h2>
          <p className="mt-2 text-sm text-[#d0deff]">
            Send process and site constraints, and we will help with a practical material-match plan.
          </p>
          <div className="mt-4">
            <Link
              href={`/${locale}/quote`}
              className="inline-flex rounded-full bg-[#f59e0b] px-6 py-3 text-sm font-semibold text-[#182339]"
            >
              {copy.buttonSecondary}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
