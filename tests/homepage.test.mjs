import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const page = fs.readFileSync("app/[locale]/page.tsx", "utf8");

test("homepage has the current required sections in order", () => {
  const labels = ["reference-hero", "reference-families", "reference-selection", "reference-industries", "reference-final"];
  let cursor = -1;
  for (const label of labels) {
    const next = page.indexOf(label);
    assert.ok(next > cursor, `${label} must follow the previous section`);
    cursor = next;
  }
});

test("homepage uses one h1, includes the full quote checklist, and only preloads the hero", () => {
  assert.equal((page.match(/<h1/g) || []).length, 1);
  assert.equal((page.match(/\bpreload\b/g) || []).length, 1);
  assert.match(page, /copy\.checklist\.map\(/);
});

test("generated media records are approved and owned", () => {
  const assets = JSON.parse(fs.readFileSync("data/media/generated-assets.json", "utf8"));
  assert.equal(assets.length, 5);
  for (const asset of assets) {
    assert.equal(asset.aiGenerated, true);
    assert.equal(asset.owner, "BZMAGNET");
    assert.equal(asset.usageStatus, "approved");
    assert.ok(asset.prompt && asset.alt);
    assert.ok(fs.existsSync(`public${asset.path}`));
  }
});

test("homepage image sources remain BZMAGNET-controlled", () => {
  assert.match(page, /src="\/media\/generated\/home-hero-v2\.webp"/);
  assert.match(page, /src={\`\/media\/generated\/\$\{categoryImages\[index\]\}\`\}/);
  assert.match(page, /src={\`\/media\/generated\/\$\{industryImages\[index\]\}\`\}/);
});

test("inquiry attribution is allow-listed", () => {
  const api = fs.readFileSync("app/api/inquiries/route.ts", "utf8");
  const validator = fs.readFileSync("lib/inquiry-validation.ts", "utf8");
  for (const key of ["context", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) assert.match(validator, new RegExp(key));
  assert.match(validator, /attributionKeys/);
  assert.match(api, /isValidInquiry\(input\)/);
});
