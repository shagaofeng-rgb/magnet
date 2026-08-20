import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const parser = fs.readFileSync("lib/news/source-catalog.ts", "utf8");
const migration = fs.readFileSync("database/migrations/20260820_news_source_catalog.sql", "utf8");
const automation = fs.readFileSync("lib/news-automation.ts", "utf8");

test("source catalog retains raw entries and uses a versioned activation model", () => {
  for (const token of ["rawEntry", "sourceOrdinal", "needs_review", "sourceCatalogChecksum", "eligibleForCrawler"]) assert.match(parser, new RegExp(token));
  for (const token of ["news_source_catalog_versions", "news_sources", "news_source_health_checks", "archived"]) assert.match(migration, new RegExp(token));
});

test("News publication requires an explicit release gate and verified catalog sources", () => {
  for (const token of ["NEWS_AUTO_PUBLISH", "getNewsReleaseReadiness", "active-source-catalog-not-configured", "markNewsSourceUsed"]) assert.match(automation, new RegExp(token));
  assert.doesNotMatch(automation, /contentType === "blog"\s*&&\s*.*publish/);
});
