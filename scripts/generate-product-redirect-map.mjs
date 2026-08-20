import fs from "node:fs";
import path from "node:path";

const catalog = JSON.parse(fs.readFileSync("data/products.generated.json", "utf8"));
const segments = { en: "equipment", es: "equipos", pt: "equipamentos", ar: "المعدات", ru: "oborudovanie" };
const categories = { conveyor: "conveyor-magnetic-separation", minerals: "mineral-bulk-separation", recycling: "recycling-metal-sorting", process: "process-magnets-filters" };
const rows = ["status,from,to,product_id,locale"];
for (const product of catalog.products) for (const locale of Object.keys(segments)) {
  const slug = product.locale[locale]?.slug;
  if (!slug) continue;
  rows.push(["301", `/${locale}/${segments[locale]}/${slug}`, `/${locale}/products/${categories[product.familyId]}/${slug}`, product.id, locale].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","));
}
fs.mkdirSync(path.join("docs", "audits"), { recursive: true });
fs.writeFileSync(path.join("docs", "audits", "bzmagnet-product-redirect-map.csv"), `${rows.join("\n")}\n`);
console.log(`Generated ${rows.length - 1} single-hop product redirects.`);
