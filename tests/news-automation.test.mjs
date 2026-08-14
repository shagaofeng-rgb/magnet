import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");

test("only the durable News cron routes are scheduled", () => {
  const config = JSON.parse(read("vercel.json"));
  assert.deepEqual(config.crons.map((job) => job.path), ["/api/cron/news-review", "/api/cron/news-publish"]);
  assert.equal(config.crons[0].schedule, "0 */12 * * *");
  assert.equal(config.crons[1].schedule, "0 1 * * *");
});

test("News automation has a fail-closed durable store, lock and 48-hour gate", () => {
  const source = read("lib/news-automation.ts");
  for (const token of ["NEWS_DATABASE_URL", "NEWS_SOURCE_FEEDS", "NEWS_GENERATOR_WEBHOOK_URL", "acquireNewsLock", "isAtLeast48Hours", "needs_review", "duplicate-or-similar-content", "approved-product-relation-required"]) assert.match(source, new RegExp(token));
});

test("Blog cannot be written by the automatic News publisher", () => {
  const source = read("lib/news-automation.ts");
  assert.match(source, /article\.contentType !== "industry_news"/);
  assert.match(source, /news-must-not-write-blog/);
  assert.doesNotMatch(read("app/api/cron/news-publish/route.ts"), /blog/i);
});

test("old no-op editorial cron routes were removed", () => {
  assert.equal(fs.existsSync("app/api/cron/editorial-review/route.ts"), false);
  assert.equal(fs.existsSync("app/api/cron/editorial-publish/route.ts"), false);
});
