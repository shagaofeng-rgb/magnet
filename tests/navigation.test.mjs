import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync("components/SiteHeader.tsx", "utf8");

test("public navigation contains the exact maintainable sections", () => {
  for (const label of ["Home", "Products", "Industry Solutions", "News", "About & Contact", "Request a Quote"]) assert.match(source, new RegExp(label));
  for (const denied of ["Resources", "Case Studies", "Downloads", "Technical Documents", "Support Centre", "Factory Tour", "Certifications"]) assert.doesNotMatch(source, new RegExp(denied, "i"));
});

test("mobile quote is rendered before mobile navigation items", () => assert.ok(source.indexOf('className="mobile-quote"') < source.indexOf('className="mobile-link"')));

test("drawer handles Escape and focus return", () => {
  assert.match(source, /event\.key\s*===\s*"Escape"/);
  assert.match(source, /\.focus\(\)/);
});

test("desktop navigation click keeps the hovered or focused menu open", () => {
  assert.doesNotMatch(source, /onClick=\{\(\) => toggle\(/);
  for (const section of ["products", "industries", "news"]) {
    assert.match(source, new RegExp(`onClick=\\{\\(\\) => openMenu\\("${section}"\\)\\}`));
  }
});

test("hidden spam field cannot expand right-to-left page width", () => {
  const css = fs.readFileSync("app/navigation.css", "utf8");
  assert.match(css, /\.honeypot\{left:auto!important;right:auto!important;width:1px!important/);
  assert.match(css, /clip-path:inset\(50%\)!important/);
});
