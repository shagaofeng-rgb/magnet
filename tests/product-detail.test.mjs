import test from "node:test";import assert from "node:assert/strict";import fs from "node:fs";
const model=fs.readFileSync("lib/product-model.ts","utf8"),page=fs.readFileSync("components/ProductDetail.tsx","utf8"),catalog=JSON.parse(fs.readFileSync("data/products.generated.json","utf8"));
test("localized equipment route segments exist",()=>{for(const segment of ["equipment","equipos","equipamentos","المعدات","oborudovanie"])assert.ok(model.includes(segment))});
test("publication validation blocks unsafe data",()=>{for(const token of ["product-image-approval","unverified-","magnet-conflict"])assert.ok(model.includes(token))});
test("public page never exposes source ids",()=>{assert.doesNotMatch(page,/sourceId|approvedAt|verifiedName/)});
test("field visibility degrades safely",()=>{assert.match(model,/visibility !== "hidden"/);assert.match(model,/Available on request/)});
test("detail page has one h1 and supported schemas",()=>{assert.equal((page.match(/<h1/g)||[]).length,1);for(const type of ["Product","BreadcrumbList","FAQPage"])assert.ok(page.includes(type))});
test("generated catalog has unique ids and five reviewed locales",()=>{assert.equal(catalog.totalSource,88);assert.equal(new Set(catalog.products.map(p=>p.id)).size,catalog.products.length);for(const p of catalog.products)for(const locale of ["en","es","pt","ar","ru"]){assert.ok(p.locale[locale].reviewed);assert.ok(p.locale[locale].slug)}});
