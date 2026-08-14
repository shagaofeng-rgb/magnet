import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "./JsonLd";
import { type Locale, localePath, origin } from "@/lib/i18n";
import { type ProductRecord, productPath, visibleRows } from "@/lib/product-model";
import { relatedArticleLinks } from "@/lib/product-content-relations";

type DetailCopy = {
  home: string;
  products: string;
  quote: string;
  processDetails: string;
  imageReference: string;
  imageAvailable: string;
  suitableProcess: string;
  equipmentType: string;
  installationPosition: string;
  operatingMode: string;
  availableOnRequest: string;
  overview: string;
  needHelp: string;
  finalMessage: string;
};

const copy: Record<Locale, DetailCopy> = {
  en: {
    home: "Home", products: "Products", quote: "Request a Quote", processDetails: "Send Process Details",
    imageReference: "Product image for reference; final configuration is confirmed according to project requirements.", imageAvailable: "Image available on request",
    suitableProcess: "Suitable process", equipmentType: "Equipment type", installationPosition: "Installation position", operatingMode: "Operating mode", availableOnRequest: "Available on request",
    overview: "Overview", needHelp: "Need Help Reviewing This Equipment?", finalMessage: "Send your material and process details. We will help you review suitable equipment options and prepare a quotation.",
  },
  es: {
    home: "Inicio", products: "Productos", quote: "Solicitar cotización", processDetails: "Enviar detalles del proceso",
    imageReference: "Imagen del producto como referencia; la configuración final se confirma según los requisitos del proyecto.", imageAvailable: "Imagen disponible bajo solicitud",
    suitableProcess: "Proceso adecuado", equipmentType: "Tipo de equipo", installationPosition: "Posición de instalación", operatingMode: "Modo de funcionamiento", availableOnRequest: "Disponible bajo solicitud",
    overview: "Resumen", needHelp: "¿Necesita ayuda para revisar este equipo?", finalMessage: "Envíe los detalles de su material y proceso. Le ayudaremos a revisar opciones adecuadas y preparar una cotización.",
  },
  pt: {
    home: "Início", products: "Produtos", quote: "Solicitar cotação", processDetails: "Enviar detalhes do processo",
    imageReference: "Imagem do produto para referência; a configuração final é confirmada conforme os requisitos do projeto.", imageAvailable: "Imagem disponível mediante solicitação",
    suitableProcess: "Processo adequado", equipmentType: "Tipo de equipamento", installationPosition: "Posição de instalação", operatingMode: "Modo de operação", availableOnRequest: "Disponível mediante solicitação",
    overview: "Visão geral", needHelp: "Precisa de ajuda para avaliar este equipamento?", finalMessage: "Envie os detalhes do material e do processo. Ajudaremos a avaliar opções adequadas e preparar uma cotação.",
  },
  ar: {
    home: "الرئيسية", products: "المنتجات", quote: "اطلب عرض سعر", processDetails: "أرسل تفاصيل العملية",
    imageReference: "صورة المنتج للمرجعية؛ يتم تأكيد التهيئة النهائية وفق متطلبات المشروع.", imageAvailable: "الصورة متاحة عند الطلب",
    suitableProcess: "العملية المناسبة", equipmentType: "نوع المعدات", installationPosition: "موضع التركيب", operatingMode: "وضع التشغيل", availableOnRequest: "متاح عند الطلب",
    overview: "نظرة عامة", needHelp: "هل تحتاج إلى مساعدة لمراجعة هذه المعدات؟", finalMessage: "أرسل تفاصيل المادة والعملية. سنساعدك في مراجعة الخيارات المناسبة وإعداد عرض سعر.",
  },
  ru: {
    home: "Главная", products: "Продукция", quote: "Запросить предложение", processDetails: "Отправить данные процесса",
    imageReference: "Изображение изделия приведено для справки; окончательная конфигурация подтверждается по требованиям проекта.", imageAvailable: "Изображение предоставляется по запросу",
    suitableProcess: "Подходящий процесс", equipmentType: "Тип оборудования", installationPosition: "Место установки", operatingMode: "Режим работы", availableOnRequest: "По запросу",
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
  const specs = visibleRows(product.specifications);
  const options = visibleRows(product.options);
  const canRenderSourceLanguageDetails = locale === "en";
  const relatedArticles = canRenderSourceLanguageDetails ? relatedArticleLinks(product.id, locale) : [];
  const quote = `${localePath(locale, "request-quote")}?product=${encodeURIComponent(product.id)}&product_name=${encodeURIComponent(localized.title)}&locale=${locale}&source=${encodeURIComponent(productPath(locale, localized.slug))}&context=product-detail`;
  const crumbs = [
    { name: t.home, url: `${origin}/${locale}/` },
    { name: t.products, url: `${origin}/${locale}/products` },
    { name: familyName, url: `${origin}/${locale}/products` },
    { name: localized.title, url: `${origin}${productPath(locale, localized.slug)}` },
  ];

  return <>
    <JsonLd data={{ "@context": "https://schema.org", "@type": "Product", name: localized.title, description: localized.summary, url: `${origin}${productPath(locale, localized.slug)}`, brand: { "@type": "Brand", name: "BZMAGNET" } }} />
    <JsonLd data={{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: crumbs.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: item.url })) }} />
    {canRenderSourceLanguageDetails && product.faq.length > 0 && <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: product.faq.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) }} />}
    <div className="shell product-breadcrumbs" aria-label="Breadcrumb">{crumbs.map((item, index) => <span key={item.url}>{index > 0 && " / "}<Link href={item.url}>{item.name}</Link></span>)}</div>
    <section className="product-hero"><div className="shell product-hero-grid">
      <div><span className="eyebrow">{familyName}</span><h1>{localized.title}</h1><p className="product-summary">{localized.summary}</p>
        {canRenderSourceLanguageDetails && <div className="application-tags">{product.applications.slice(0, 4).map((application) => <span key={application.title}>{application.title}</span>)}</div>}
        <div className="actions"><Link className="btn btn-orange" href={quote}>{t.quote}</Link><Link className="btn btn-outline" href={`${quote}&details=1`}>{t.processDetails}</Link></div>
      </div>
      <div>{images.length ? <div className="product-gallery"><div className="product-main-image"><Image src={images[0].src} alt={productImageAlt(locale, localized.title)} fill priority sizes="(max-width:900px) 100vw,55vw" /></div>{images.length > 1 && <div className="product-thumbs">{images.map((image) => <Image key={image.assetId} src={image.src} alt={productImageAlt(locale, localized.title)} width={96} height={72} />)}</div>}<p>{t.imageReference}</p></div> : <div className="product-placeholder" role="img" aria-label={t.imageAvailable}><span>{t.imageAvailable}</span></div>}</div>
    </div></section>
    <div className="shell quick-info">{canRenderSourceLanguageDetails ? [
      [t.suitableProcess, product.applications[0]?.context],
      [t.equipmentType, product.productType],
      [t.installationPosition, specs.find((item) => item.label === "Installation position")?.display],
      [t.operatingMode, specs.find((item) => item.label === "Cleaning mode")?.display],
    ].map(([label, value]) => <div key={label}><strong>{label}</strong><span>{value || t.availableOnRequest}</span></div>) : <div><strong>{t.equipmentType}</strong><span>{t.availableOnRequest}</span></div>}</div>
    <div className="shell product-body"><main>
      <Section id="overview" title={t.overview}><p>{localized.description}</p></Section>
      {canRenderSourceLanguageDetails && <EnglishProductDetails product={product} specs={specs} options={options} relatedArticles={relatedArticles} quote={quote} />}
    </main>{canRenderSourceLanguageDetails && <aside className="sticky-enquiry"><h2>Start Your Enquiry</h2><p>{localized.title}</p><p>Send material, process and installation details for product matching.</p><Link className="btn btn-orange" href={quote}>{t.quote}</Link></aside>}</div>
    <section className="product-final"><div className="shell"><div><h2>{t.needHelp}</h2><p>{t.finalMessage}</p></div><Link className="btn btn-orange" href={quote}>{t.quote}</Link></div></section>
  </>;
}

function EnglishProductDetails({ product, specs, options, relatedArticles, quote }: { product: ProductRecord; specs: ReturnType<typeof visibleRows>; options: ReturnType<typeof visibleRows>; relatedArticles: ReturnType<typeof relatedArticleLinks>; quote: string }) {
  return <>
    <nav className="detail-nav" aria-label="Product details"><div className="shell">{[["working-principle", "How It Works"], ["applications", "Applications"], ["selection", "Selection Information"], ["specifications", "Specifications"], ["installation", "Installation"], ["faq", "FAQ"]].map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}</div></nav>
    <Section id="working-principle" title="How It Works"><p>{product.capabilities.join(" ")}</p></Section>
    <Section id="applications" title="Applications"><div className="application-grid">{product.applications.map((application) => <article key={application.title}><h3>{application.title}</h3><p>{application.context}</p><dl><dt>Placement</dt><dd>{application.placement}</dd><dt>Material</dt><dd>{application.material}</dd></dl></article>)}</div></Section>
    <Section id="selection" title="Information Needed for Product Matching"><ul className="selection-list">{product.selectionInputs.map((input) => <li key={input}>{input}</li>)}</ul><p className="notice">The suitable configuration is confirmed after reviewing the process information provided.</p></Section>
    <Section id="specifications" title="Specifications"><InfoTable rows={specs} /><div className="option-card"><h3>Options and Customisation</h3>{options.length ? <InfoTable rows={options} /> : <p>Please send project requirements for confirmation.</p>}</div></Section>
    <Section id="installation" title="Installation and Use"><ol className="install-steps"><li><strong>Confirm position</strong><span>Review the intended process position.</span></li><li><strong>Confirm clearance and support</strong><span>Provide installation space and mounting constraints.</span></li><li><strong>Confirm power/control requirements</strong><span>Share available services and control preferences.</span></li></ol><div className="considerations"><h3>Important considerations</h3><ul>{product.limitations.map((item) => <li key={item}>{item}</li>)}</ul></div><h3>Maintenance</h3>{product.maintenance?.length ? <ul>{product.maintenance.map((item) => <li key={item}>{item}</li>)}</ul> : <p>Request maintenance guidance for the configuration under review.</p>}</Section>
    <Section id="faq" title="Frequently Asked Questions"><div className="faq-list">{product.faq.map((item) => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div></Section>
    {relatedArticles.length > 0 && <Section id="related-guides" title="Related Guides and News"><ul>{relatedArticles.map((item) => <li key={item.id}><Link href={item.href}>{item.label}</Link></li>)}</ul></Section>}
    <aside className="mobile-product-enquiry"><Link className="btn btn-orange" href={quote}>Request a Quote</Link></aside>
  </>;
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return <section id={id} className="product-section"><h2>{title}</h2>{children}</section>;
}

function InfoTable({ rows }: { rows: ReturnType<typeof visibleRows> }) {
  return <div className="table-wrap"><table><thead><tr><th>Item</th><th>Available Information</th></tr></thead><tbody>{rows.map((item) => <tr key={item.label}><th>{item.label}</th><td>{item.display}</td></tr>)}</tbody></table></div>;
}
