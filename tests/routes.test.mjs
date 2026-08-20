import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const required = [
  "app/[locale]/page.tsx", "app/[locale]/products/page.tsx", "app/[locale]/products/[category]/page.tsx",
  "app/[locale]/products/[category]/[slug]/page.tsx", "app/[locale]/equipment/[slug]/route.ts", "app/[locale]/industry-solutions/page.tsx",
  "app/[locale]/industry-solutions/[slug]/page.tsx", "app/[locale]/news/page.tsx", "app/[locale]/blog/page.tsx",
  "app/[locale]/about-contact/page.tsx", "app/[locale]/request-quote/page.tsx", "app/admin/page.tsx", "app/robots.ts", "app/sitemap.ts",
];

test("required navigation routes exist", () => required.forEach((file) => assert.ok(fs.existsSync(file), file)));
