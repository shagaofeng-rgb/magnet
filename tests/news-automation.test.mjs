import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");

test("only the durable News cron routes are scheduled", () => {
  const config = JSON.parse(read("vercel.json"));
  assert.deepEqual(config.crons.map((job) => job.path), ["/api/cron/news-review", "/api/cron/news-publish"]);
  assert.equal(config.crons[0].schedule, "10 */6 * * *");
  assert.equal(config.crons[1].schedule, "45 1,3,6 * * *");
});

test("News automation has a fail-closed durable store, internal generator, lock and 48-hour gate", () => {
  const source = read("lib/news-automation.ts");
  for (const token of ["NEWS_DATABASE_URL", "NEWS_SOURCE_FEEDS", "createAutomaticNewsArticle", "verifyCandidateSourceEvidence", "newsAutomationMode", "acquireNewsLock", "isAtLeast48Hours", "needs_review", "duplicate-or-similar-content", "approved-product-relation-required"]) assert.match(source, new RegExp(token));
});

test("automatic News is the default and still has an emergency pause", () => {
  const workflow = read("lib/editorial-workflow.ts");
  assert.match(workflow, /automaticNewsPublishingEnabled/);
  assert.match(workflow, /"paused"/);
  assert.match(workflow, /NEWS_AUTO_PUBLISH !== "false"/);
});

test("public delivery verification covers detail, list, News sitemap and RSS", () => {
  const source = read("lib/news-automation.ts");
  for (const token of ["/en/news/industry", "/news-sitemap.xml", "/news/rss.xml", "post-publish-source-panel-missing", "post-publish-brand-boundary-failed"]) assert.ok(source.includes(token));
  for (const route of ["app/news-sitemap.xml/route.ts", "app/news/rss.xml/route.ts"]) {
    assert.match(read(route), /dynamic = "force-dynamic"/);
    assert.match(read(route), /"cache-control": "no-store, max-age=0"/);
  }
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
