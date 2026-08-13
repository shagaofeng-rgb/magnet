import fs from "node:fs";
import path from "node:path";
const root=process.cwd();
const deny=[/cowinmagnet/gi,/cowin-logo/gi,/qr-whatsapp/gi,/home-hero-cowin/gi,/contact-support-cowin/gi,/about-factory-team/gi,/TODO_TECHNICAL_VALUE/gi,/PLACEHOLDER_HEADING/gi];
const publicRoots=["app","components","lib","public","content","data"].filter((item)=>fs.existsSync(path.join(root,item)));
const allowFiles=new Set([path.normalize("scripts/public-boundary-guard.mjs"),path.normalize("scripts/content-similarity-report.mjs")]);
const allowedExt=/\.(?:ts|tsx|js|jsx|mjs|json|md|css|html|xml|svg|txt)$/i;
const failures=[];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,entry.name),rel=path.relative(root,full);if(entry.isDirectory()){if(["migrations","private-migration","node_modules",".next"].includes(entry.name))continue;walk(full)}else if(allowedExt.test(entry.name)&&!allowFiles.has(path.normalize(rel))){const text=fs.readFileSync(full,"utf8");for(const rule of deny){rule.lastIndex=0;if(rule.test(text))failures.push(`${rel}: ${rule}`)}}}}
for(const dir of publicRoots)walk(path.join(root,dir));
const catalog=JSON.parse(fs.readFileSync(path.join(root,"data/products.generated.json"),"utf8"));
for(const product of catalog.products)for(const locale of ["en","es","pt","ar","ru"])if(!product.locale[locale]?.title||!product.locale[locale]?.slug)failures.push(`missing locale ${locale} for ${product.id}`);
if(failures.length){console.error("Public boundary guard failed\n"+failures.join("\n"));process.exit(1)}
console.log("Public boundary guard passed: no denied brand references or placeholders.");
