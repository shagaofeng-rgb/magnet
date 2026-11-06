import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "./JsonLd";
import { ProductDetailTabs } from "./ProductDetailTabs";
import { ProductPhoto } from "./ProductPhoto";
import { type Locale, localePath, origin } from "@/lib/i18n";
import { type ProductRecord, productCategoryPath, productPathFor, visibleRows } from "@/lib/product-model";
import { relatedArticleLinks } from "@/lib/product-content-relations";
import { detailedProductLocalization } from "@/lib/product-localizations";

type DetailCopy = {
  home: string;
  products: string;
  breadcrumb: string;
  quote: string;
  model: string;
  viewDetails: string;
  viewSpecs: string;
  imageReference: string;
  imageAvailable: string;
  overview: string;
  needHelp: string;
  finalMessage: string;
};

const copy: Record<Locale, DetailCopy> = {
  en: {
    home: "Home", products: "Products", breadcrumb: "Breadcrumb", quote: "Request a Quote",
    model: "Model", viewDetails: "Product Details", viewSpecs: "View Specifications",
    imageReference: "Product image for reference; final configuration is confirmed according to project requirements.", imageAvailable: "Image available on request",
    overview: "Overview", needHelp: "Need Help Reviewing This Equipment?", finalMessage: "Send your material and process details. We will help you review suitable equipment options and prepare a quotation.",
  },
  es: {
    home: "Inicio", products: "Productos", breadcrumb: "Ruta de navegación", quote: "Solicitar cotización",
    model: "Modelo", viewDetails: "Detalles del producto", viewSpecs: "Ver especificaciones",
    imageReference: "Imagen del producto como referencia; la configuración final se confirma según los requisitos del proyecto.", imageAvailable: "Imagen disponible bajo solicitud",
    overview: "Resumen", needHelp: "¿Necesita ayuda para revisar este equipo?", finalMessage: "Envíe los detalles de su material y proceso. Le ayudaremos a revisar opciones adecuadas y preparar una cotización.",
  },
  pt: {
    home: "Início", products: "Produtos", breadcrumb: "Caminho de navegação", quote: "Solicitar cotação",
    model: "Modelo", viewDetails: "Detalhes do produto", viewSpecs: "Ver especificações",
    imageReference: "Imagem do produto para referência; a configuração final é confirmada conforme os requisitos do projeto.", imageAvailable: "Imagem disponível mediante solicitação",
    overview: "Visão geral", needHelp: "Precisa de ajuda para avaliar este equipamento?", finalMessage: "Envie os detalhes do material e do processo. Ajudaremos a avaliar opções adequadas e preparar uma cotação.",
  },
  ar: {
    home: "الرئيسية", products: "المنتجات", breadcrumb: "مسار التنقل", quote: "اطلب عرض سعر",
    model: "الطراز", viewDetails: "تفاصيل المنتج", viewSpecs: "عرض المواصفات",
    imageReference: "صورة المنتج للمرجعية؛ يتم تأكيد التهيئة النهائية وفق متطلبات المشروع.", imageAvailable: "الصورة متاحة عند الطلب",
    overview: "نظرة عامة", needHelp: "هل تحتاج إلى مساعدة لمراجعة هذه المعدات؟", finalMessage: "أرسل تفاصيل المادة والعملية. سنساعدك في مراجعة الخيارات المناسبة وإعداد عرض سعر.",
  },
  ru: {
    home: "Главная", products: "Продукция", breadcrumb: "Навигационная цепочка", quote: "Запросить предложение",
    model: "Модель", viewDetails: "Описание изделия", viewSpecs: "Смотреть характеристики",
    imageReference: "Изображение изделия приведено для справки; окончательная конфигурация подтверждается по требованиям проекта.", imageAvailable: "Изображение предоставляется по запросу",
    overview: "Обзор", needHelp: "Нужна помощь в оценке этого оборудования?", finalMessage: "Отправьте сведения о материале и процессе. Мы поможем рассмотреть подходящие варианты и подготовить предложение.",
  },
};

const familyNames: Record<Locale, Record<string, string>> = {
  en: { conveyor: "Conveyor Magnetic Separators", minerals: "Mineral & Bulk Separation", recycling: "Recycling & Metal Sorting", process: "Process Magnets & Filters" },
  es: { conveyor: "Separadores magnéticos para transportadores", minerals: "Separación de minerales y materiales a granel", recycling: "Reciclaje y clasificación de metales", process: "Imanes y filtros de proceso" },
  pt: { conveyor: "Separadores magnéticos para correias", minerals: "Separação mineral e de materiais a granel", recycling: "Reciclagem e separação de metais", process: "Ímãs e filtros de processo" },
  ar: { conveyor: "فواصل مغناطيسية للسيور الناقلة", minerals: "فصل المعادن والمواد السائبة", recycling: "إعادة التدوير وفرز المعادن", process: "مغناطيسات وفلاتر العمليات" },
  ru: { conveyor: "Конвейерные магнитные сепараторы", minerals: "Сепарация минералов и сыпучих материалов", recycling: "Переработка и сортировка металлов", process: "Технологические магниты и фильтры" },
};

function productImageAlt(locale: Locale, title: string) {
  const prefix: Record<Locale, string> = {
    en: "Approved product image",
    es: "Imagen aprobada del producto",
    pt: "Imagem aprovada do produto",
    ar: "صورة معتمدة للمنتج",
    ru: "Одобренное изображение изделия",
  };
  return `${prefix[locale]}: ${title}`;
}

export function ProductDetail({ product, locale }: { product: ProductRecord; locale: Locale }) {
  const t = copy[locale];
  const localized = product.locale[locale];
  const familyName = familyNames[locale][product.familyId] || product.familyLabel;
  const images = product.media.filter((media) => media.type === "product" && media.approved && !media.aiGenerated);
  const mainImage = images.find((image) => image.isPrimary) ?? images[0];
  const portugueseDetail = detailedProductLocalization(product.id, locale);
  const technicalLocale = portugueseDetail ? "pt" : "en";
  const technical = portugueseDetail ?? (locale === "en" ? englishDetails(product) : null);
  const relatedArticles = locale === "en" ? relatedArticleLinks(product.id, locale) : [];
  const publicPath = productPathFor(locale, product);
  const quote = `${localePath(locale, "request-quote")}?product=${encodeURIComponent(product.id)}`;
  const crumbs = [
    { name: t.home, path: localePath(locale) },
    { name: t.products, path: localePath(locale, "products") },
    { name: familyName, path: localePath(locale, `products/${productCategoryPath(product.familyId)}`) },
    { name: localized.title, path: publicPath },
  ];

  return <>
    <JsonLd data={{ "@context": "https://schema.org", "@type": "WebPage", name: localized.title, description: localized.summary, url: `${origin}${publicPath}`, inLanguage: locale }} />
    <JsonLd data={{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: crumbs.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: `${origin}${item.path}` })) }} />
    {technical && <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: technical.faq.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) }} />}

    <nav className="shell product-breadcrumbs" aria-label={t.breadcrumb}>
      {crumbs.map(({ name, path }, index) => <span key={path}>
        {index > 0 && <span aria-hidden="true"> / </span>}
        {path === publicPath ? <span aria-current="page">{name}</span> : <Link href={path}>{name}</Link>}
      </span>)}
    </nav>

    <section className="product-hero" data-analytics-product-detail>
      <div className="shell product-hero-grid">
        <div className="product-hero-title">
          <span className="eyebrow">{familyName}</span>
          <h1>{localized.title}</h1>
          {product.model && <p className="product-model">{t.model} <bdi>{product.model}</bdi></p>}
          {locale === "en" && product.model === "RCYD" && <p className="product-intro">A self-cleaning permanent magnetic separator for removing tramp iron from conveyor-fed material. Share your belt width, feed depth and mounting height to confirm the fit.</p>}
        </div>
        <figure className="product-gallery">
          {mainImage ? <>
            <div className="product-main-image">
              <ProductPhoto src={mainImage.src} alt={productImageAlt(locale, localized.title)} detail />
            </div>
            {images.length > 1 && <div className="product-thumbs">
              {images.filter((image) => image !== mainImage).map((image) => <Image key={image.assetId} src={image.src} alt={image.alt[locale]} width={96} height={72} />)}
            </div>}
            <figcaption>{t.imageReference}</figcaption>
          </> : <div className="product-placeholder" role="img" aria-label={t.imageAvailable}>{t.imageAvailable}</div>}
        </figure>
        <div className="product-hero-info">
          <div className="actions">
            <Link className="btn btn-orange" href={quote}>{t.quote}</Link>
            <a className="btn btn-outline" href={technical ? "#specifications" : "#overview"}>
              {technical ? t.viewSpecs : t.viewDetails}
            </a>
          </div>
          {technical && technical.quickFacts.length > 0 && <dl className="product-facts">
            {technical.quickFacts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
          </dl>}
        </div>
      </div>
    </section>

    <div className={technical ? "shell product-body product-body-technical" : "shell product-body"}>
      <div className="product-content">
        {technical ? <TechnicalProductDetails detail={technical} locale={technicalLocale} overview={localized.description} /> :
          <Section id="overview" title={t.overview}><p>{localized.description}</p></Section>}
        {relatedArticles.length > 0 && <Section id="related-guides" title="Related Guides and News">
          <ul className="product-guide-links">{relatedArticles.map((item) => <li key={item.id}><Link href={item.href}>{item.label}</Link></li>)}</ul>
        </Section>}
      </div>
      {technical && <aside className="sticky-enquiry">
        <h2>{technicalCopy[technicalLocale].enquiry}</h2>
        <p>{t.finalMessage}</p>
        <Link className="btn btn-orange" href={quote}>{t.quote}</Link>
      </aside>}
    </div>

    <section className="product-final">
      <div className="shell">
        <div><h2>{t.needHelp}</h2><p>{t.finalMessage}</p></div>
        <Link className="btn btn-orange" href={quote}>{t.quote}</Link>
      </div>
    </section>
  </>;
}

function englishDetails(product: ProductRecord) {
  const { applications, selectionInputs, limitations, maintenance, faq } = product;
  const specs = visibleRows(product.specifications);
  const keyFacts = ["Magnet type", "Cleaning mode", "Installation position"];
  return {
    principle: product.capabilities.join(" "),
    applications,
    selectionInputs,
    specifications: specs,
    options: visibleRows(product.options),
    quickFacts: specs
      .filter((row) => row.visibility === "public" && row.value && keyFacts.includes(row.label))
      .map((row) => [row.label, row.display] as const),
    limitations,
    maintenance,
    faq,
  };
}

const technicalCopy = {
  en: {
    label: "Product details", principle: "How It Works", applications: "Applications",
    placement: "Placement", material: "Material", specs: "Specifications", item: "Item",
    information: "Available Information", options: "Options and Customisation",
    optionsEmpty: "Please send project requirements for confirmation.", selection: "Selection",
    selectionTitle: "Information Needed for Product Matching",
    selectionNote: "The suitable configuration is confirmed after reviewing the process information provided.",
    installation: "Installation", installationTitle: "Installation and Use", considerations: "Important Considerations",
    maintenance: "Maintenance", maintenanceEmpty: "Request maintenance guidance for the configuration under review.",
    faq: "FAQ", faqTitle: "Frequently Asked Questions", enquiry: "Discuss Your Application",
    steps: [
      ["Confirm position", "Review the intended process position."],
      ["Confirm clearance and support", "Provide installation space and mounting constraints."],
      ["Confirm power and control requirements", "Share available services and control preferences."],
    ],
  },
  pt: {
    label: "Detalhes do produto", principle: "Como funciona", applications: "Aplicação",
    placement: "Instalação", material: "Material", specs: "Especificações", item: "Item",
    information: "Informação disponível", options: "Opções e configuração",
    optionsEmpty: "Envie os requisitos do projeto para confirmação.", selection: "Seleção",
    selectionTitle: "Dados necessários para seleção",
    selectionNote: "A configuração adequada é confirmada após a análise dos dados do processo fornecidos.",
    installation: "Instalação", installationTitle: "Instalação e uso", considerations: "Considerações importantes",
    maintenance: "Manutenção", maintenanceEmpty: "Solicite orientações para a configuração em análise.",
    faq: "Perguntas", faqTitle: "Perguntas frequentes", enquiry: "Converse sobre sua aplicação",
    steps: [
      ["Confirme a posição", "Revise o ponto previsto no processo."],
      ["Confirme o espaço e o suporte", "Informe o espaço disponível e as restrições de montagem."],
      ["Confirme os requisitos de operação", "Compartilhe as condições de operação do local."],
    ],
  },
} as const;

type TechnicalDetails = ReturnType<typeof englishDetails> | NonNullable<ReturnType<typeof detailedProductLocalization>>;

function TechnicalProductDetails({ detail, locale, overview }: { detail: TechnicalDetails; locale: "en" | "pt"; overview: string }) {
  const t = technicalCopy[locale];
  const overviewLabel = copy[locale].overview;
  return <ProductDetailTabs label={t.label} tabs={[
    { id: "overview", label: overviewLabel, aliases: ["working-principle"], content: <>
      <Section id="overview" title={overviewLabel}><p>{overview}</p></Section>
      <Section id="working-principle" title={t.principle}><p>{detail.principle}</p></Section>
    </> },
    { id: "applications", label: t.applications, content: <Section id="applications" title={t.applications}>
      <div className="application-grid">
        {detail.applications.map((application) => <article key={application.title}>
          <h3>{application.title}</h3>
          <p>{application.context}</p>
          <dl><dt>{t.placement}</dt><dd>{application.placement}</dd><dt>{t.material}</dt><dd>{application.material}</dd></dl>
        </article>)}
      </div>
    </Section> },
    { id: "specifications", label: t.specs, content: <Section id="specifications" title={t.specs}>
      <InfoTable rows={detail.specifications} item={t.item} information={t.information} />
      <div className="option-card">
        <h3>{t.options}</h3>
        {detail.options.length ? <InfoTable rows={detail.options} item={t.item} information={t.information} /> : <p>{t.optionsEmpty}</p>}
      </div>
    </Section> },
    { id: "selection", label: t.selection, content: <Section id="selection" title={t.selectionTitle}>
      <ul className="selection-list">{detail.selectionInputs.map((input) => <li key={input}>{input}</li>)}</ul>
      <p className="notice">{t.selectionNote}</p>
    </Section> },
    { id: "installation", label: t.installation, content: <Section id="installation" title={t.installationTitle}>
      <ol className="install-steps">{t.steps.map(([title, text]) => <li key={title}><strong>{title}</strong><span>{text}</span></li>)}</ol>
      <div className="considerations">
        <h3>{t.considerations}</h3>
        <ul>{detail.limitations.map((item) => <li key={item}>{item}</li>)}</ul>
      </div>
      <h3>{t.maintenance}</h3>
      {detail.maintenance?.length ? <ul>{detail.maintenance.map((item) => <li key={item}>{item}</li>)}</ul> : <p>{t.maintenanceEmpty}</p>}
    </Section> },
    { id: "faq", label: t.faq, content: <Section id="faq" title={t.faqTitle}>
      <div className="faq-list">
        {detail.faq.map((item) => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}
      </div>
    </Section> },
  ]} />;
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return <section id={id} className="product-section"><h2>{title}</h2>{children}</section>;
}

function InfoTable({ rows, item, information }: { rows: ReadonlyArray<{ label: string; display: string }>; item: string; information: string }) {
  return <div className="table-wrap">
    <table>
      <thead><tr><th scope="col">{item}</th><th scope="col">{information}</th></tr></thead>
      <tbody>{rows.map((row) => <tr key={row.label}><th scope="row">{row.label}</th><td>{row.display}</td></tr>)}</tbody>
    </table>
  </div>;
}
