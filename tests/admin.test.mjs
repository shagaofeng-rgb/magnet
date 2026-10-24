import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (file) => fs.readFileSync(file, "utf8");

test("admin preserves the twelve required top-level Chinese modules in order", () => {
  const source = read("lib/admin-console.ts");
  const labels = ["数据总览", "流量分析", "SEO 数据", "产品管理", "新闻管理", "News 运营", "客户表单", "内外链审计", "访客记录", "页面表现", "访问路径", "系统设置"];
  let offset = 0;
  for (const label of labels) { const next = source.indexOf(`"${label}"`, offset); assert.ok(next >= offset, label); offset = next + label.length; }
});

test("admin authentication and site isolation fail closed", () => {
  const source = read("lib/admin-console.ts");
  assert.match(source, /ADMIN_SESSION_SECRET/);
  assert.match(source, /session\.siteIds\.includes\(siteId\)/);
  assert.match(source, /redirect\("\/admin\/login"\)/);
  assert.match(source, /actionRoles\[action\]/);
});

test("admin schema scopes operational records to a site and records audits", () => {
  const schema = read("database/admin-schema.sql");
  for (const table of ["sites", "site_roles", "audit_logs", "admin_jobs", "media_assets", "form_leads", "analytics_events"]) assert.match(schema, new RegExp(`create table ${table}`));
  assert.match(schema, /site_id text not null/);
});

test("admin operating layer persists real site-scoped records without external stores", () => {
  const migration = read("database/migrations/20260814_admin_operating_layer.sql");
  for (const table of ["site_settings", "catalog_records", "content_records", "seo_metrics", "link_audits", "visitor_sessions", "page_metrics", "privacy_requests"]) assert.match(migration, new RegExp(`create table if not exists ${table}`));
  const inquiries = read("app/api/inquiries/route.ts");
  assert.match(inquiries, /storeInternalLead/);
  assert.doesNotMatch(inquiries, /INQUIRY_STORE_URL/);
  const seed = read("scripts/seed-admin-catalog.mjs");
  assert.match(seed, /catalog_records/);
  assert.match(seed, /product\.status === "published"/);
  assert.match(seed, /on conflict \(id\) do update/);
  const store = read("lib/admin-store.ts");
  assert.match(store, /select 'recorded' as status/);
  assert.doesNotMatch(store, /coalesce\(status, 'recorded'\)/);
});

test("news and inquiry summaries use their own persisted records", () => {
  const store = read("lib/admin-store.ts");
  const news = store.split('} else if (area === "news") {')[1].split('} else if (area === "news-operations") {')[0];
  const forms = store.split('} else if (area === "forms") {')[1].split('} else if (area === "seo") {')[0];
  assert.match(news, /union all[\s\S]*news_articles/);
  assert.match(news, /from news_runs where site_id/);
  assert.match(forms, /leadSourceRows[\s\S]*from form_leads/);
  assert.match(forms, /test_submission/);
  assert.doesNotMatch(forms, /items: bars\(channelRows\)/);
  assert.match(store, /label: "真实询盘"/);
  assert.match(store, /label: "测试记录"/);
  assert.match(read("lib/admin-analytics.ts"), /form_leads[^`]*test_submission/);
});

test("Search Console integration is server-only and scopes imported metrics to BZMAGNET", () => {
  const source = read("lib/search-console.ts");
  assert.match(source, /server-only/);
  assert.match(source, /GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT_JSON/);
  assert.match(source, /SEARCH_CONSOLE_SITE_URL/);
  assert.match(source, /site_id/);
  assert.match(source, /google_search_console/);
  assert.doesNotMatch(source, /NEXT_PUBLIC_GOOGLE/);
  const route = read("app/api/admin/search-console/sync/route.ts");
  assert.match(route, /CRON_SECRET/);
  assert.match(route, /SEARCH_CONSOLE_SYNC_SECRET/);
  assert.match(route, /syncSearchConsoleMetrics/);
});
