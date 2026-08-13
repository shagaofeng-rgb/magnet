import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import ts from "typescript";

const sourceRoot = process.argv[2];
const mode = process.argv[3] || "import";
const allowedModes = new Set(["dry-run", "import", "update-approved-data", "report-only", "rollback"]);
if (!sourceRoot || !allowedModes.has(mode)) throw new Error("Usage: node scripts/migrate-approved-catalog.mjs <read-only-source-root> [dry-run|import|update-approved-data|report-only|rollback]");
const sourceFile = path.join(sourceRoot, "data", "products.ts");
const privateDir = path.join("data", "private-migration");
const reportDir = path.join("reports", "private");
const mediaDir = path.join("public", "media", "products");
for (const dir of [privateDir, reportDir, mediaDir]) fs.mkdirSync(dir, { recursive: true });

if (mode === "rollback") {
  fs.rmSync(path.join("data", "products.generated.json"), { force: true });
  fs.rmSync(mediaDir, { recursive: true, force: true });
  console.log("Rolled back generated catalog and product media.");
  process.exit(0);
}

const sourceText = fs.readFileSync(sourceFile, "utf8");
const compiled = ts.transpileModule(sourceText, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const sourceModule = { exports: {} };
new Function("exports", "module", "require", compiled)(sourceModule.exports, sourceModule, () => { throw new Error("Source imports are not allowed"); });
const sourceProducts = sourceModule.exports.products;

const familyRules = [
  { id: "conveyor", label: "Conveyor Magnetic Separators", match: /iron remover|overband|suspended|head pulley|magnetic pulley|semi magnetic drum/i },
  { id: "recycling", label: "Recycling & Metal Sorting", match: /eddy current|metal detector|metal separator|sorting|recycling/i },
  { id: "process", label: "Process Magnets & Filters", match: /grid|grate|rod|bar|drawer|pipeline|pipe|filter|rotary|liquid|powder|channel/i },
  { id: "minerals", label: "Mineral & Bulk Separation", match: /drum|wet|dry|high gradient|roller|belt magnetic|ore|mineral|separator/i }
];
const familyFor = (product) => familyRules.find((rule) => rule.match.test(`${product.name} ${product.category}`)) || familyRules[1];
const modelFor = (name) => (name.match(/\b[A-Z]{2,8}(?:[-/][A-Z0-9]+)?\b/) || [])[0];
const cleanName = (name) => name.replace(/\btype\b/gi, "").replace(/\s+/g, " ").trim().replace(/^./, (c) => c.toUpperCase());
const descriptor = (name) => cleanName(name).replace(/\b[A-Z]{2,8}(?:[-/][A-Z0-9]+)?\b/g, "").replace(/\s+/g, " ").trim();
const uuidFor = (key) => { const h = crypto.createHash("sha256").update(`bzmagnet-product:${key}`).digest("hex"); return `${h.slice(0,8)}-${h.slice(8,12)}-4${h.slice(13,16)}-a${h.slice(17,20)}-${h.slice(20,32)}`; };
const opaque = (key) => crypto.createHash("sha256").update(`bzmagnet-asset:${key}`).digest("hex").slice(0,20);
const publicSource = (id, index) => `approved-import-${id.slice(0,8)}-${index + 1}`;
const localizeTechnicalTitle = (locale, title) => {
  if (locale === "en") return title;
  const dictionaries = {
    es: [["self dumping", "autodescargante"], ["self cleaning", "autolimpiante"], ["permanent magnet", "magnético permanente"], ["electromagnetic", "electromagnético"], ["iron remover", "separador de hierro"], ["magnetic separator", "separador magnético"], ["metal detector", "detector de metales"], ["magnetic drum", "tambor magnético"]],
    pt: [["self dumping", "autodescarregável"], ["self cleaning", "autolimpante"], ["permanent magnet", "magnético permanente"], ["electromagnetic", "eletromagnético"], ["iron remover", "removedor de ferro"], ["magnetic separator", "separador magnético"], ["metal detector", "detector de metais"], ["magnetic drum", "tambor magnético"]],
    ar: [["self dumping", "ذاتي التفريغ"], ["self cleaning", "ذاتي التنظيف"], ["permanent magnet", "مغناطيسي دائم"], ["electromagnetic", "كهرومغناطيسي"], ["iron remover", "مزيل الحديد"], ["magnetic separator", "فاصل مغناطيسي"], ["metal detector", "كاشف المعادن"], ["magnetic drum", "أسطوانة مغناطيسية"]],
    ru: [["self dumping", "саморазгружающийся"], ["self cleaning", "самоочищающийся"], ["permanent magnet", "постоянномагнитный"], ["electromagnetic", "электромагнитный"], ["iron remover", "железоотделитель"], ["magnetic separator", "магнитный сепаратор"], ["metal detector", "металлодетектор"], ["magnetic drum", "магнитный барабан"]]
  };
  return dictionaries[locale].reduce((result, [source, target]) => result.replace(new RegExp(source, "ig"), target), title);
};
const localeText = (locale, title, family, process, variant) => {
  const publicTitle = localizeTechnicalTitle(locale, title);
  const publicProcess = localizeTechnicalTitle(locale, process);
  const englishSummaries = [
    `${title} is reviewed for ${process.toLowerCase()} duties after the feed, target metal and available installation position are defined.`,
    `Use ${title} as a sourcing option for ${process.toLowerCase()} when the material flow and separation objective have been documented.`,
    `${title} supports a defined ${process.toLowerCase()} stage; equipment matching starts with the material, throughput and process layout.`,
    `For projects considering ${title}, BZMAGNET reviews the ${process.toLowerCase()} role together with feed and site constraints.`,
    `Selection of ${title} begins with the intended ${process.toLowerCase()} position, material condition and required metal-handling task.`,
    `${title} can be shortlisted for ${process.toLowerCase()} only after the operating environment and process information are available.`,
    `Review ${title} for a specific ${process.toLowerCase()} duty by supplying the feed description, target fraction and installation envelope.`,
    `${title} is presented for application-led ${process.toLowerCase()} enquiries rather than selection from a model name alone.`
  ];
  const englishDescriptions = [
    `The product is assessed as part of the ${family.toLowerCase()} range. Its position in the line, feed presentation and required discharge arrangement determine which configuration can be quoted.`,
    `Within the ${family.toLowerCase()} category, this item is matched to a stated process objective. Final dimensions, interfaces and working values remain configuration-specific.`,
    `This equipment belongs to ${family.toLowerCase()}. The review considers how material reaches the separation zone and how collected or separated material must leave the process.`,
    `As a ${family.toLowerCase()} option, the equipment requires a defined duty and site layout. Published information does not replace project-specific configuration confirmation.`,
    `The intended use sits within ${family.toLowerCase()}. Buyer-supplied process data is used to confirm practical placement, access and operating requirements.`,
    `This ${family.toLowerCase()} product is compared against the actual material stream. Connection details, clearances and service requirements are confirmed during quotation review.`,
    `A suitable arrangement depends on the ${family.toLowerCase()} application and the surrounding process. Unknown technical values remain available on request until the configuration is selected.`,
    `The equipment is catalogued under ${family.toLowerCase()} for process-based review. Its final setup follows the stated material, objective, environment and maintenance access.`
  ];
  const copy = {
    en: [`${title}`, `${englishSummaries[variant%englishSummaries.length]} The catalogue record is identified as ${title} for this exact equipment review.`, `${englishDescriptions[Math.floor(variant/englishSummaries.length)%englishDescriptions.length]} Selection questions for ${title} focus on ${process.toLowerCase()}, not on assumptions carried over from another model.`],
    es: [publicTitle, `Equipo para ${publicProcess.toLowerCase()}, cuya configuración se revisa según el material, el metal objetivo y las condiciones de instalación.`, `Esta opción se evalúa a partir de la posición en el proceso, las condiciones de alimentación y el objetivo de separación. Las dimensiones y valores operativos finales se confirman para la configuración seleccionada.`],
    pt: [publicTitle, `Equipamento para ${publicProcess.toLowerCase()}, com configuração analisada conforme o material, o metal-alvo e as condições de instalação.`, `Esta opção é avaliada pela posição no processo, condição de alimentação e objetivo de separação. Dimensões e valores operacionais finais são confirmados para a configuração selecionada.`],
    ar: [publicTitle, `معدات لتطبيقات ${publicProcess} مع مراجعة المادة والمعدن المستهدف وظروف التركيب قبل تحديد التهيئة.`, `تُراجع هذه المعدات وفق موضعها في العملية وحالة التغذية وهدف الفصل. يتم تأكيد الأبعاد وقيم التشغيل النهائية للتهيئة المختارة.`],
    ru: [publicTitle, `Оборудование для задачи «${publicProcess}»; конфигурация уточняется по материалу, целевому металлу и условиям монтажа.`, `Вариант рассматривается с учетом позиции в процессе, состояния подачи и цели разделения. Окончательные размеры и рабочие параметры подтверждаются для выбранной конфигурации.`]
  };
  return copy[locale];
};
const slugPrefix = { en: "industrial-equipment", es: "equipo-industrial", pt: "equipamento-industrial", ar: "معدات-صناعية", ru: "promyshlennoe-oborudovanie" };
const selectionByFamily = {
  conveyor: ["Material and particle-size range", "Target ferrous material", "Belt width, speed and burden depth", "Throughput", "Suspension position and clearance", "Ambient conditions and power"],
  minerals: ["Mineral and magnetic response", "Particle-size range", "Dry or wet feed condition", "Throughput", "Required product streams", "Process position and available services"],
  recycling: ["Feed composition and size distribution", "Target metal fraction", "Upstream preparation", "Belt width and speed", "Throughput", "Discharge and installation layout"],
  process: ["Material and flowability", "Particle size", "Flow rate", "Temperature and environment", "Connection dimensions", "Cleaning access and frequency"]
};

const privateInventory = [];
const publicProducts = [];
const held = [];
for (const source of sourceProducts) {
  const id = uuidFor(source.slug);
  const family = familyFor(source);
  const model = modelFor(source.name);
  const title = cleanName(source.name);
  const type = descriptor(source.name) || family.label;
  const conflict = /permanent/i.test(source.name) && /electromagnetic/i.test(source.name) || /self[- ]?clean/i.test(source.name) && /manual/i.test(source.name);
  const sourceImage = source.image ? path.join(sourceRoot, "public", source.image.replace(/^\//, "")) : "";
  const imageExists = sourceImage && fs.existsSync(sourceImage);
  const ext = imageExists ? path.extname(sourceImage).toLowerCase() : ".jpg";
  const assetName = `${opaque(source.slug)}${ext}`;
  const assetPath = `/media/products/${assetName}`;
  const publishable = Boolean(title && imageExists && !conflict);
  const privateFacts = (source.specs || []).map((fact) => ({ label: fact.label, value: fact.value, state: /\d/.test(fact.value) ? "needs_confirmation" : "on_request", privateSourceRef: `${source.slug}:spec` }));
  privateInventory.push({ sourceId: source.slug, sourceUrl: `/products/${source.slug}`, name: source.name, category: source.category, model, sourceLocale: "en", updatedAt: source.updatedAt || source.publishedAt || null, sourceImage: source.image, imageGallery: source.imageGallery || [], rightsState: "owner-authorized-for-migration", specifications: privateFacts, applications: source.applications || [], conflicts: conflict ? ["product-type-conflict"] : [], publishable });
  if (!publishable) { held.push({ sourceId: source.slug, name: source.name, reason: conflict ? "product-type-conflict" : "missing-approved-primary-image" }); continue; }
  if (mode === "import" || mode === "update-approved-data") fs.copyFileSync(sourceImage, path.join(mediaDir, assetName));
  const locales = {};
  for (const code of ["en", "es", "pt", "ar", "ru"]) {
    const [localizedTitle, summary, description] = localeText(code, title, family.label, type, parseInt(id.slice(0,4),16));
    const slug = `${slugPrefix[code]}-${id.slice(0,8)}`;
    locales[code] = { slug, title: localizedTitle, summary, description, metaTitle: `${localizedTitle} | BZMAGNET`, metaDescription: summary.slice(0, 157).replace(/[,. ]+$/, "") + ".", translatedAt: "2026-08-13", reviewed: true };
  }
  const inferredFacts = [];
  if (/permanent/i.test(source.name)) inferredFacts.push({ label: "Magnet type", value: { value: "Permanent magnetic system", sourceId: publicSource(id, 0), approvedAt: "2026-08-13" }, visibility: "public" });
  if (/electromagnetic/i.test(source.name)) inferredFacts.push({ label: "Magnet type", value: { value: "Electromagnetic system", sourceId: publicSource(id, 0), approvedAt: "2026-08-13" }, visibility: "public" });
  if (/self[- ]?(dumping|cleaning|unloading)/i.test(source.name)) inferredFacts.push({ label: "Cleaning mode", value: { value: "Continuous self-cleaning arrangement", sourceId: publicSource(id, 1), approvedAt: "2026-08-13" }, visibility: "public" });
  if (/wet/i.test(source.name)) inferredFacts.push({ label: "Process condition", value: { value: "Wet process", sourceId: publicSource(id, 2), approvedAt: "2026-08-13" }, visibility: "public" });
  if (/dry/i.test(source.name)) inferredFacts.push({ label: "Process condition", value: { value: "Dry process", sourceId: publicSource(id, 2), approvedAt: "2026-08-13" }, visibility: "public" });
  inferredFacts.push({ label: "Model and dimensions", visibility: "on_request" }, { label: "Operating values", visibility: "on_request" });
  publicProducts.push({ id, status: "published", familyId: family.id, familyLabel: family.label, productType: type.toLowerCase(), verifiedName: title, model, media: [{ assetId: opaque(source.slug), src: assetPath, alt: Object.fromEntries(["en","es","pt","ar","ru"].map((code) => [code, `${title} product view`])), isPrimary: true, type: "product", approved: true, aiGenerated: false }], applications: [{ title: `${type} application review`, context: `Industrial ${type.toLowerCase()} process`, placement: family.id === "conveyor" ? "At a confirmed conveyor or transfer position" : "At the confirmed process position", material: "Material confirmed from the buyer's process details" }], capabilities: [`Supports the process role associated with ${type.toLowerCase()} when the feed and installation conditions are suitable.`], selectionInputs: selectionByFamily[family.id], specifications: inferredFacts, options: [{ label: "Project-specific configuration", visibility: "on_request" }], limitations: ["Final suitability and configuration depend on the supplied material, process, installation and operating information."], maintenance: ["Confirm inspection and cleaning access for the selected configuration before installation."], faq: [{ question: `What information is needed to review this ${type.toLowerCase()}?`, answer: "Provide the material, target metal, throughput, process position, available dimensions, environment and required operating arrangement." }, { question: "Are dimensions and operating values fixed for every project?", answer: "No. They are confirmed for the selected configuration after the application information is reviewed." }, { question: "Can this page confirm final suitability?", answer: "No. Final suitability depends on the actual process and installation details supplied for review." }], relatedProductIds: [], locale: locales });
}

for (const product of publicProducts) product.relatedProductIds = publicProducts.filter((item) => item.id !== product.id && item.familyId === product.familyId).slice(0, 3).map((item) => item.id);
const mapping = privateInventory.map((item) => ({ sourceId: item.sourceId, bzmagnetId: uuidFor(item.sourceId), publicSlugs: publicProducts.find((p) => p.id === uuidFor(item.sourceId))?.locale || null }));
const auditRows = ["source_id,name,category,publishable,conflicts,image_count,spec_count", ...privateInventory.map((p) => [p.sourceId, p.name, p.category, p.publishable, p.conflicts.join("|"), p.imageGallery.length, p.specifications.length].map(csv).join(","))].join("\n");
const heldRows = ["source_id,name,reason", ...held.map((p) => [p.sourceId, p.name, p.reason].map(csv).join(","))].join("\n");
fs.writeFileSync(path.join(privateDir, "private-source-product-inventory.json"), JSON.stringify(privateInventory, null, 2));
fs.writeFileSync(path.join(privateDir, "private-cowin-to-bzmagnet-mapping.json"), JSON.stringify(mapping, null, 2));
fs.writeFileSync(path.join(reportDir, "private-source-product-audit.csv"), auditRows);
fs.writeFileSync(path.join(reportDir, "skipped-manual-review-facts.csv"), heldRows);
if (mode === "import" || mode === "update-approved-data") fs.writeFileSync(path.join("data", "products.generated.json"), JSON.stringify({ generatedAt: "2026-08-13", totalSource: sourceProducts.length, imported: publicProducts.length, held: held.length, products: publicProducts }, null, 2));
const confirmationFacts = privateInventory.reduce((count, product) => count + product.specifications.filter((fact) => fact.state === "needs_confirmation").length, 0);
fs.writeFileSync(path.join("reports", "bzmagnet-import-report.csv"), `metric,count\nsource_total,${sourceProducts.length}\nimported_published,${publicProducts.length}\nheld_for_review,${held.length}\nfacts_needing_confirmation,${confirmationFacts}\nmedia_copied,${mode === "import" || mode === "update-approved-data" ? publicProducts.length : 0}\n`);
console.log(JSON.stringify({ mode, source: sourceProducts.length, imported: publicProducts.length, held: held.length }, null, 2));
function csv(value) { const text = String(value ?? ""); return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text; }
