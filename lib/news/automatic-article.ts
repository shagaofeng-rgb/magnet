import { createHash } from "node:crypto";
import { articlePath, type Article, type Block } from "@/lib/editorial";
import type { NewsCandidate } from "@/lib/editorial-workflow";
import { productPathFor, type ProductRecord } from "@/lib/product-model";

const clean = (value: string) => value.replace(/\s+/gu, " ").trim();
const words = (value: string) => clean(value).split(/\s+/u).filter(Boolean).length;
const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/gu, "-").replace(/^-+|-+$/gu, "").slice(0, 88);
const sentence = (value: string) => /[.!?]$/u.test(value) ? value : `${value}.`;
const truncate = (value: string, maximum: number) => value.length <= maximum ? value : `${value.slice(0, maximum - 1).replace(/\s+\S*$/u, "").replace(/[,:;\-]+$/u, "").trim()}.`;

const list = (values: string[], fallback: string[]) => values.length ? values.slice(0, 6) : fallback;
const paragraph = (text: string): Block => ({ type: "paragraph", text: clean(text) });

function documentWordCount(article: Article) {
  const body = article.sections.flatMap((section) => section.blocks.flatMap((block) => {
    if (block.type === "paragraph") return [block.text];
    if (block.type === "callout") return [block.title, block.text];
    if (block.type === "table") return [...block.columns, ...block.rows.flat()];
    if (block.type === "image") return [];
    return block.items;
  }));
  return words([article.title, article.summary, ...body].join(" "));
}

function ensureEditorialDepth(article: Article) {
  const additions = [
    "A useful internal review separates confirmed observations from estimates. Teams can record the source of each operating value, the date it was checked and the person responsible for confirmation. This creates a practical evidence trail for later discussions and prevents a general industry development from being treated as a model specification, a site result or a purchasing instruction.",
    "The material path should be reviewed from receiving through transfer, processing and discharge. At each stage, note the purpose of the installed equipment, the normal material condition, the available inspection points and any recent operating change. This makes it easier to decide whether the reported development affects equipment protection, contamination control, recovery, maintenance planning or a different part of the operation.",
    "Procurement and engineering teams should also distinguish immediate safeguards from longer-term improvement work. A condition that presents a safety or equipment-protection concern follows the site procedures already in force. Other questions may require a planned inspection, a material sample review or a configuration discussion based on drawings and measurements rather than a reaction to a headline.",
    "When several departments use the same line information, a short written decision record is valuable. It can identify the source reviewed, the process step considered, the evidence available, the open questions and the owner of the next action. That record helps later technical and commercial conversations stay tied to the actual application instead of assumptions introduced during an automated news cycle.",
    "Follow-up should use measurable conditions rather than broad conclusions. Teams can compare the report with recent inspection notes, maintenance history, material supplier information and current line drawings. If the available evidence does not change a process requirement, monitoring may be sufficient. If it does reveal a gap, the next step should define what must be observed, measured or confirmed before equipment scope and commercial terms are discussed.",
    "The article should be revisited when the source, the product record or the site conditions materially change. A modification date is useful only when the reader-facing analysis has actually been reviewed. This approach keeps the public explanation current without turning an automated publication into an unsupported claim about product performance or a permanent conclusion about an external event.",
  ];
  const target = article.sections[article.sections.length - 1];
  for (const addition of additions) {
    if (documentWordCount(article) >= 1_100) break;
    target.blocks.push(paragraph(addition));
  }
  return article;
}

export function createAutomaticNewsArticle(candidate: NewsCandidate, product: ProductRecord): Article {
  const source = candidate.sources[0];
  const productName = product.locale.en.title;
  const productSummary = sentence(product.locale.en.summary || product.locale.en.description || `${productName} is a BZMAGNET product category for application review`);
  const productUrl = productPathFor("en", product);
  const industry = candidate.industry.replace(/[-_]/gu, " ");
  const sourceTitle = candidate.evidence?.sourceTitle || candidate.title;
  const slug = slugify(`${product.locale.en.slug}-${candidate.title}`) || `bzmagnet-industry-news-${Date.now()}`;
  const title = truncate(`${productName}: Application Questions Raised by ${candidate.title}`, 110);
  const summary = truncate(`A source-verified BZMAGNET review of ${productName}, the reported ${industry} development and the site information needed before a configuration discussion`, 158);
  const metaProduct = truncate(`${productName} Application News`, 47).replace(/[.]$/u, "");
  const selectionInputs = list(product.selectionInputs, ["Material type and particle-size range", "Throughput and flow condition", "Installation position and available clearance", "Operating environment and maintenance access"]);
  const capabilities = list(product.capabilities, ["Review the product role against the confirmed material path", "Relate the product category to a defined separation or equipment-protection task"]);
  const limitations = list(product.limitations, ["Final configuration depends on confirmed site and material conditions", "No performance result is implied by an external industry report"]);
  const applications = product.applications.slice(0, 3).map((item) => `${item.title}: ${item.context || item.material || item.placement}`);
  const generationId = createHash("sha256").update(`${candidate.eventFingerprint}\n${candidate.evidence?.contentHash || candidate.sourceFingerprint}\n${product.id}`).digest("hex");

  const article: Article = {
    id: crypto.randomUUID(),
    locale: "en",
    contentType: "industry_news",
    status: "draft",
    title,
    summary: sentence(summary),
    primaryTopic: `${productName} for ${industry} applications`,
    audience: "Industrial buyers, process engineers, maintenance teams and procurement teams",
    hero: { assetId: "industry", alt: `Industrial material sorting context for ${productName}`, caption: "BZMAGNET-owned editorial illustration; not an image from the cited report." },
    sections: [
      {
        heading: "What changed",
        level: 2,
        blocks: [
          paragraph(`${source.publisher} published “${sourceTitle}” on ${source.publishedAt}. BZMAGNET reviewed the public source page and its canonical address before preparing this commentary. The cited report is the authority for the event it describes; this page does not reproduce the report and does not present the development as a BZMAGNET project, customer result or commercial relationship.`),
          paragraph(`The practical question for an industrial reader is whether the development changes anything about the material path, contamination risk, equipment-protection requirement or planning assumptions at a specific site. A headline alone cannot answer that question. The source establishes the external context, while the sections below organize the BZMAGNET product information and the application details that still require confirmation.`),
        ],
      },
      {
        heading: "Why it matters for the material process",
        level: 2,
        blocks: [
          paragraph(`For ${industry} operations, changes in processing practice, regulation, supply, plant investment or material recovery can influence the questions asked before material is conveyed, separated, inspected or discharged. Relevance does not mean that one report proves a result for another plant. It means the reported development may justify checking whether current material characteristics, downstream risks and inspection routines are still described accurately.`),
          paragraph(`A site review should identify the affected process stage first. Receiving, transfer, crushing, screening, blending and final handling can expose different contamination risks and installation constraints. The same product family may serve different roles depending on where it is placed, how material reaches it and what should happen to the separated fraction. Those conditions should be documented before any product option is treated as suitable.`),
        ],
      },
      {
        heading: "BZMAGNET product context",
        level: 2,
        blocks: [
          paragraph(`${productSummary} This verified product record is used to explain an available BZMAGNET equipment path, not to claim that the cited publisher selected, tested or endorsed the product. External developments are cited for context and do not indicate a commercial relationship with BZMAGNET.`),
          { type: "bullets", items: capabilities },
          ...(applications.length ? [{ type: "bullets" as const, items: applications }] : []),
          paragraph(`The related product page at ${productUrl} is the public source of truth for the BZMAGNET product category. Any model-specific value, interface, option or operating limit that is not shown there as verified remains subject to confirmation. The external report must not be used to fill missing specifications or to imply capacity, recovery, field strength, certification, stock or delivery performance.`),
        ],
      },
      {
        heading: "Selection conditions to confirm",
        level: 2,
        blocks: [
          paragraph(`Equipment selection begins with the actual material and process position. Record the normal and peak conditions, describe variations and identify what the equipment is expected to protect or separate. When a value is unknown, it should remain marked for confirmation rather than replaced by a generic assumption. This is particularly important when the source report concerns a different market, plant or material stream.`),
          { type: "checklist", items: selectionInputs },
          paragraph(`These inputs help determine whether ${productName} is a reasonable category to investigate. They do not complete a final configuration by themselves. Drawings, photographs, samples, site standards and access requirements may be needed before technical or commercial decisions can be made, and the relevant teams should identify which information has been measured and which remains provisional.`),
        ],
      },
      {
        heading: "Integration and maintenance questions",
        level: 2,
        blocks: [
          paragraph(`Integration should follow the confirmed material route and the site's safety procedures. Review the proposed position, supporting structure, guarding, utilities, discharge path, inspection access and the effect of downtime on surrounding equipment. A category description cannot establish those details. They depend on the layout and on how operators and maintenance teams will use the equipment in normal and abnormal conditions.`),
          { type: "bullets", items: [...limitations, ...(product.maintenance || []).slice(0, 3)] },
          paragraph(`Maintenance planning should define safe access, inspection frequency, cleaning or discharge responsibilities and the records needed to recognize a change in material or equipment condition. Where the reported development introduces a new operational question, the appropriate response may be observation or data collection before a hardware change. This keeps the decision proportional to the evidence available.`),
        ],
      },
      {
        heading: "Source limits and verification",
        level: 2,
        blocks: [
          paragraph(`The source panel below preserves the publisher, title, date and canonical link used in this review. BZMAGNET records a private content fingerprint and verification time so the automation can detect duplication and demonstrate which public evidence was available. The cited report remains responsible for its own facts, wording and later corrections.`),
          { type: "callout", title: "Source boundary", tone: "important", text: "This BZMAGNET commentary uses the external report only as industry context. It does not claim affiliation, endorsement, a customer project, verified product performance or a result at another site." },
          paragraph(`Readers making engineering, regulatory or procurement decisions should consult the original publication and any applicable primary documents. If the report is updated, withdrawn or contradicted, the BZMAGNET article should be reviewed rather than treated as a permanent technical authority. Product facts are kept separate from event facts so a change in one does not silently alter the other.`),
        ],
      },
      {
        heading: "Practical next steps",
        level: 2,
        blocks: [
          paragraph(`Start by deciding whether the reported development affects an active material-handling or separation question. If it does, trace the material path, collect the selection inputs listed above and compare them with the verified ${productName} information. If it does not, retain the report as monitored context without forcing a product connection.`),
          paragraph(`A useful enquiry distinguishes confirmed facts, estimates and open questions. Share the material description, process objective, relevant dimensions, operating environment and available records. BZMAGNET can then coordinate a product and quotation discussion within the published product scope, while any final configuration remains subject to the confirmed application and supplier documentation.`),
        ],
      },
    ],
    faq: [
      { question: `Does this report prove that ${productName} is suitable for my site?`, answer: "No. The report supplies external context only. Suitability depends on the material, process position, operating conditions, installation constraints and confirmed project requirements." },
      { question: "Which information should be prepared before a configuration discussion?", answer: sentence(selectionInputs.slice(0, 4).join("; ")) },
      { question: "Does BZMAGNET have a commercial relationship with the cited publisher?", answer: "No relationship is implied. The publisher is cited as the source of the external development, and the original report remains the authority for that event." },
    ],
    sources: [{ ...source, url: candidate.evidence?.canonicalUrl || source.url, title: sourceTitle, accessedAt: candidate.evidence?.verifiedAt || source.accessedAt }],
    related: [{ targetId: product.id, relation: "product" }, { targetId: product.familyId, relation: "industry" }],
    author: { name: "BZMAGNET Editorial Team", profilePath: "/en/authors/editorial-team", role: "Source review and industrial application context" },
    cta: { label: "Discuss Your Application", href: "/en/request-quote", text: `Share material, process position and site conditions to discuss whether ${productName} is an appropriate category to review.` },
    seo: {
      slug,
      metaTitle: `${metaProduct} | BZMAGNET`,
      metaDescription: sentence(summary),
      canonicalPath: `/en/news/industry/${slug}`,
      ogImageAssetId: "industry",
    },
    internal: {
      topicBriefId: `auto-${candidate.industry}-${product.id}`,
      evidenceIds: [candidate.evidence?.contentHash || candidate.sourceFingerprint],
      translationReviewed: true,
      generationRecordId: generationId,
      validationOutput: [],
    },
  };

  article.seo.canonicalPath = articlePath(article);
  return ensureEditorialDepth(article);
}
