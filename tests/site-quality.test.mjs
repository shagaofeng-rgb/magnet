import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");

test("shared public chrome uses the five-locale copy contract", () => {
  const contract = read("lib/ui-copy.ts");
  for (const locale of ["en", "es", "pt", "ar", "ru"]) assert.match(contract, new RegExp(`\\n  ${locale}: \\{`));
  for (const file of ["components/SiteFooter.tsx", "components/ListingPage.tsx", "components/ContextDetail.tsx", "components/ArticleRenderer.tsx"]) assert.match(read(file), /uiCopy/);
});

test("sitemap uses real content dates and covers maintained public hubs", () => {
  const sitemap = read("app/sitemap.ts");
  assert.doesNotMatch(sitemap, /Date\.now\(\)/);
  for (const path of ["news/company", "news/industry", "request-quote", "authors/editorial-team"]) assert.ok(sitemap.includes(`\"${path}\"`));
  assert.doesNotMatch(sitemap, /\"solutions\"/);
});

test("large editorial and homepage images use modern formats", () => {
  const files = ["app/[locale]/page.tsx", "lib/site-copy.ts", "lib/homepage.ts", "lib/editorial.ts", "data/media/generated-assets.json", "data/media/editorial-assets.json"];
  for (const file of files) assert.doesNotMatch(read(file), /media\/(?:generated|editorial)\/[^\"']+\.png/);
});

test("search data synchronization is durable and authenticated", () => {
  const route = read("app/api/cron/search-console-sync/route.ts");
  assert.match(route, /CRON_SECRET/);
  assert.match(route, /syncSearchConsoleMetrics\("bzmagnet"\)/);
  assert.match(route, /status: 401/);
});
