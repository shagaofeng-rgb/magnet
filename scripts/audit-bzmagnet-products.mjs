import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const catalog = JSON.parse(fs.readFileSync(path.join(root, "data/products.generated.json"), "utf8"));
const locales = ["en", "es", "pt", "ar", "ru"];
const outOfScope = /solar\s*(tower|lighting)|air\s*compressor|portable\s*compressor/i;
const records = catalog.products.map((product) => {
  const issues = [];
  if (!product.media?.some((asset) => asset.type === "product" && asset.approved && !asset.aiGenerated)) issues.push("no-approved-real-product-image");
  if (!locales.every((locale) => product.locale?.[locale]?.title && product.locale?.[locale]?.slug && product.locale?.[locale]?.reviewed)) issues.push("missing-or-unreviewed-locale");
  if (product.specifications?.some((row) => row.visibility === "public" && (!row.value?.sourceId || !row.value?.approvedAt))) issues.push("unverified-public-specification");
  if (outOfScope.test(JSON.stringify(product))) issues.push("out_of_scope_pending_owner_decision");
  return { id: product.id, name: product.verifiedName, family: product.familyLabel, status: product.status, currentUrl: `/en/products/${({ conveyor: "conveyor-magnetic-separation", minerals: "mineral-bulk-separation", recycling: "recycling-metal-sorting", process: "process-magnets-filters" })[product.familyId]}/${product.locale.en.slug}`, missingFields: issues, dataConfidence: issues.length ? "partial" : "verified" };
});
const truthCards = catalog.products.map((product) => ({
  productId: product.id,
  productName: product.locale.en.title,
  category: product.familyLabel,
  series: product.familyId,
  model: product.model || null,
  publicUrl: `/en/products/${({ conveyor: "conveyor-magnetic-separation", minerals: "mineral-bulk-separation", recycling: "recycling-metal-sorting", process: "process-magnets-filters" })[product.familyId]}/${product.locale.en.slug}`,
  verifiedSummary: product.locale.en.summary,
  verifiedFeatures: product.capabilities,
  verifiedSpecifications: product.specifications.filter((row) => row.visibility === "public" && row.value).map((row) => ({ label: row.label, value: row.value.value, conditions: row.value.conditions || null, sourceId: row.value.sourceId, approvedAt: row.value.approvedAt })),
  approvedApplications: product.applications,
  approvedIndustries: [],
  ownedImages: product.media.filter((asset) => asset.type === "product" && asset.approved && !asset.aiGenerated).map((asset) => ({ src: asset.src, alt: asset.alt.en })),
  evidenceRefs: product.specifications.flatMap((row) => row.value?.sourceId ? [row.value.sourceId] : []),
  missingFields: records.find((record) => record.id === product.id)?.missingFields || [],
  prohibitedClaims: ["factory ownership", "guaranteed performance", "stock", "unverified certification", "named customer results"],
  dataConfidence: records.find((record) => record.id === product.id)?.dataConfidence || "partial",
}));
const report = { generatedAt: new Date().toISOString(), sourceTotal: catalog.totalSource, imported: catalog.imported, held: catalog.held, records, summary: { total: records.length, verified: records.filter((record) => record.dataConfidence === "verified").length, partial: records.filter((record) => record.dataConfidence !== "verified").length, outOfScope: records.filter((record) => record.missingFields.includes("out_of_scope_pending_owner_decision")).length } };
fs.mkdirSync(path.join(root, "data/audits"), { recursive: true });
fs.mkdirSync(path.join(root, "data/private-audits"), { recursive: true });
fs.mkdirSync(path.join(root, "docs/audits"), { recursive: true });
fs.writeFileSync(path.join(root, "data/audits/bzmagnet-product-audit.json"), `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(path.join(root, "data/private-audits/bzmagnet-product-truth-cards.json"), `${JSON.stringify({ generatedAt: report.generatedAt, truthCards }, null, 2)}\n`);
fs.writeFileSync(path.join(root, "docs/audits/bzmagnet-product-audit.md"), `# BZMAGNET product audit\n\nGenerated: ${report.generatedAt}\n\n- Imported products: ${report.summary.total}\n- Verified records: ${report.summary.verified}\n- Partial records: ${report.summary.partial}\n- Out-of-scope public-content candidates: ${report.summary.outOfScope}\n\nDetailed, non-public source references remain outside this report. See the JSON audit for BZMAGNET record IDs and release blockers.\n`);
console.log(JSON.stringify(report.summary, null, 2));
