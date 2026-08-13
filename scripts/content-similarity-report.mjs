import fs from "node:fs";
import ts from "typescript";
const sourcePath=process.env.PRIVATE_REFERENCE_TEXT;
const publicCatalog=JSON.parse(fs.readFileSync("data/products.generated.json","utf8"));
const normalize=(value)=>String(value||"").toLowerCase().replace(/[^a-z0-9\p{L}]+/gu," ").trim();
const shingles=(value,size=5)=>{const words=normalize(value).split(" ").filter(Boolean),set=new Set();for(let i=0;i<=words.length-size;i++)set.add(words.slice(i,i+size).join(" "));return set};
const overlap=(a,b)=>{const left=shingles(a),right=shingles(b);if(!left.size||!right.size)return 0;let shared=0;for(const item of left)if(right.has(item))shared++;return shared/Math.min(left.size,right.size)};
const report={generatedAt:new Date().toISOString(),threshold:.32,sourceComparison:"not-configured",maximumSourceOverlap:0,maximumInternalOverlap:0,blocked:false,publicProducts:publicCatalog.products.length};
if(sourcePath&&fs.existsSync(sourcePath)){const source=fs.readFileSync(sourcePath,"utf8"),compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,sourceModule={exports:{}};new Function("exports","module","require",compiled)(sourceModule.exports,sourceModule,()=>{throw new Error("Source imports disabled")});const sourceProducts=sourceModule.exports.products;for(const product of publicCatalog.products){const publicText=Object.values(product.locale).map(item=>`${item.summary} ${item.description}`).join(" ");for(const sourceProduct of sourceProducts)report.maximumSourceOverlap=Math.max(report.maximumSourceOverlap,overlap(publicText,`${sourceProduct.summary} ${sourceProduct.principle}`))}report.sourceComparison="completed"}
for(let i=0;i<publicCatalog.products.length;i++)for(let j=i+1;j<publicCatalog.products.length;j++){const a=publicCatalog.products[i].locale.en,b=publicCatalog.products[j].locale.en;report.maximumInternalOverlap=Math.max(report.maximumInternalOverlap,overlap(`${a.title} ${a.summary} ${a.description}`,`${b.title} ${b.summary} ${b.description}`))}
report.blocked=report.maximumSourceOverlap>=report.threshold||report.maximumInternalOverlap>=.78;
fs.writeFileSync("reports/content-similarity.json",JSON.stringify(report,null,2));
console.log(`Similarity report: source=${report.maximumSourceOverlap.toFixed(3)}, internal=${report.maximumInternalOverlap.toFixed(3)}, blocked=${report.blocked}`);
if(report.blocked)process.exit(1);
