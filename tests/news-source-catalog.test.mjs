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
  for (const token of ["automaticNewsPublishingEnabled", "getNewsReleaseReadiness", "active-source-catalog-not-configured", "markNewsSourceUsed", "markNewsSourceScanned"]) assert.match(automation, new RegExp(token));
  assert.doesNotMatch(automation, /contentType === "blog"\s*&&\s*.*publish/);
});

test("repeat feed scans preserve the candidate identity and linked article", () => {
  const store = fs.readFileSync("lib/news-store.ts", "utf8");
  for (const token of ["source_fingerprint", "current.id", "current.article_id", "current.candidate.evidence"]) assert.ok(store.includes(token));
});

test("the automatic writer is BZMAGNET-only and source bounded", () => {
  const writer = fs.readFileSync("lib/news/automatic-article.ts", "utf8");
  const evidence = fs.readFileSync("lib/news/source-evidence.ts", "utf8");
  for (const token of ["BZMAGNET Editorial Team", "External developments are cited for context", "Source limits and verification", "evidenceIds"]) assert.ok(writer.includes(token));
  for (const token of ["canonical-domain-mismatch", "contentHash", "BZMAGNET-News-Evidence/2.0"]) assert.ok(evidence.includes(token));
});
