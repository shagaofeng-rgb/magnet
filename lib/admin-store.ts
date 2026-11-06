import "server-only";

import { createCipheriv, createDecipheriv, createHash, randomBytes, randomUUID } from "node:crypto";
import postgres from "postgres";
import { resolveAdminDateRange, type AdminRangePreset } from "@/lib/admin-date-range";
import { isSubmissionId, type Inquiry, type InquiryAttribution } from "@/lib/inquiry-validation";

const cleanUrl = (value: string | undefined) => value?.trim().replace(/^(['"])(.*)\1$/, "$2") || undefined;
const databaseUrl = [process.env.ADMIN_DATABASE_URL, process.env.NEWS_DATABASE_URL, process.env.POSTGRES_URL, process.env.DATABASE_URL].map(cleanUrl).find(Boolean);
const sql = databaseUrl ? postgres(databaseUrl, { prepare: false, max: 5, idle_timeout: 10, connect_timeout: 10 }) : null;

export type AdminMetric = { label: string; value: string; href: string; detail?: string };
export type AdminTrendPoint = { label: string; value: number; secondary?: number };
export type AdminBreakdown = { title: string; items: Array<{ label: string; value: number }>; emptyText: string };
export type AdminTable = { title: string; columns: string[]; rows: string[][]; emptyText: string; recordIds?: string[] };
type GoogleStatus = { state?: string; attemptedAt?: string; lastSuccessAt?: string; submitted?: boolean; submittedAt?: string; code?: string | null };
type EmailResult = { attempt?: number; retryAt?: number | null; code?: string };
export type AdminQuery = { range?: AdminRangePreset; from?: string; to?: string; search?: string; page?: number; pageSize?: number };
export type AdminModuleData = {
  connected: boolean; google?: { sync?: GoogleStatus; sitemap?: GoogleStatus }; lastDataAt: string | null; metrics: AdminMetric[]; trend: AdminTrendPoint[];
  breakdowns: AdminBreakdown[]; table: AdminTable; rangeDays: number; from: string; to: string;
  page: number; pageSize: number; totalRows: number;
};

const pageHref = (area: string) => `/admin/bzmagnet/${area}`;
const count = async (query: () => Promise<Array<{ count: string }>>) => Number((await query())[0]?.count ?? 0);
const dateTime = (value: string | Date | null | undefined) => value ? new Date(value).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai", hour12: false }) : "—";
const asNumber = (value: number | string | null | undefined) => Number(value || 0);
const bars = <T extends { label: string; value: number | string | null }>(rows: T[]) => rows.map((row) => ({ label: row.label || "未标记", value: asNumber(row.value) }));
const emailStatus = (status: string | null, result: EmailResult | null) => {
  if (status === "succeeded") return "邮件服务器已接收";
  if (result?.code === "smtp_outcome_unknown") return "送达结果待核对";
  if (status === "failed") return result?.retryAt ? "等待重试" : "发送失败";
  if (status === "running") return "正在发送";
  return status === "queued" ? "待发送" : "无邮件记录";
};

function dates(input: AdminQuery) {
  const { from, to, days: rangeDays } = resolveAdminDateRange(input);
  const start = new Date(`${from}T00:00:00+08:00`);
  const end = new Date(`${to}T23:59:59.999+08:00`);
  return { start, end, startDate: from, endDate: to, rangeDays };
}

export function isAdminStoreConfigured() { return Boolean(sql); }

export async function getAdminModuleData(siteId: string, area: string, input: AdminQuery = {}): Promise<AdminModuleData> {
  const { start, end, startDate, endDate, rangeDays } = dates(input);
  const pageSize = [25, 50, 100].includes(Number(input.pageSize)) ? Number(input.pageSize) : 25;
  const page = typeof input.page === "number" && Number.isSafeInteger(input.page) ? Math.min(100_000, Math.max(1, input.page)) : 1;
  const offset = (page - 1) * pageSize;
  const search = input.search?.trim().slice(0, 120) || "";
  const unavailable: AdminModuleData = {
    connected: false, lastDataAt: null, rangeDays, from: startDate, to: endDate, page, pageSize, totalRows: 0,
    metrics: area === "seo" ? ["点击", "展示", "平均排名", "记录"].map((label) => ({ label, value: "—", href: pageHref("seo") })) : [{ label: "数据连接", value: "未连接", href: pageHref("settings") }],
    trend: [], breakdowns: [],
    table: area === "seo" ? { title: "Search Console 页面表现", columns: ["页面", "点击", "展示", "平均排名", "日期"], rows: [], emptyText: "数据库尚未连接，暂无可展示的 Search Console 数据。" } : { title: "当前数据", columns: ["状态"], rows: [], emptyText: "数据库尚未连接，暂无可展示的真实数据。" },
  };
  if (!sql) return unavailable;

  const seo = area === "seo";
  const forms = area === "forms";
  const settings = area === "settings";
  const news = area === "news" || area === "news-operations";
  const [googleRows, seoTotals, seoLatest, trendRows, leadCounts, mailJobs, catalogRows, contentCounts, linkIssues, pendingJobs] = await Promise.all([
    seo || settings ? sql<{ setting_key: string; value: GoogleStatus }[]>`
      select setting_key, value from site_settings
      where site_id = ${siteId} and setting_key in ('search_console_sync', 'search_console_sitemap_submission')` : [],
    seo ? sql<{ clicks: string; impressions: string; position: string | null; count: string }[]>`
      select sum(clicks)::text as clicks, sum(impressions)::text as impressions, count(*)::text as count,
        (sum(average_position * impressions) / nullif(sum(impressions), 0))::text as position
      from seo_metrics where site_id = ${siteId} and source = 'google_search_console'
        and metric_date between ${startDate} and ${endDate} and (${search} = '' or url ilike '%' || ${search} || '%')` : [],
    seo ? sql<{ latest: string | null }[]>`select max(metric_date)::text as latest from seo_metrics where site_id = ${siteId} and source = 'google_search_console'` : [],
    seo ? sql<{ label: string; value: number; secondary: number }[]>`
      select metric_date::text as label, coalesce(sum(clicks), 0)::int as value, coalesce(sum(impressions), 0)::int as secondary
      from seo_metrics where site_id = ${siteId} and source = 'google_search_console'
        and metric_date between ${startDate} and ${endDate} and (${search} = '' or url ilike '%' || ${search} || '%')
      group by metric_date order by metric_date` : [],
    forms || settings ? sql<{ real: string; test: string }[]>`
      select (count(*) filter (where attribution->>'test_submission' is distinct from 'true'))::text as real,
        (count(*) filter (where attribution->>'test_submission' = 'true'))::text as test
      from form_leads where site_id = ${siteId} and created_at between ${start} and ${end}` : [],
    forms ? count(() => sql<{ count: string }[]>`select count(*)::text as count from admin_jobs where site_id = ${siteId} and kind = 'inquiry_email_notification' and created_at between ${start} and ${end}`) : 0,
    area === "products" || settings ? sql<{ id: string; updated_at: string; title: string; slug: string | null }[]>`
      select id::text, updated_at, title, slug from catalog_records where site_id = ${siteId} and record_type = 'product' and status = 'published'
      order by updated_at desc` : [],
    news || settings ? sql<{ content: string; news: string }[]>`
      select (select count(*)::text from content_records where site_id = ${siteId} and status = 'published') as content,
        (select count(*)::text from news_articles where site_id = ${siteId} and status = 'published') as news` : [],
    area === "links" || settings ? count(() => sql<{ count: string }[]>`select count(*)::text as count from link_audits where site_id = ${siteId} and status in ('open', 'recheck')`) : 0,
    area === "news-operations" || settings ? count(() => sql<{ count: string }[]>`select count(*)::text as count from admin_jobs where site_id = ${siteId} and kind <> 'inquiry_rate_limit' and status in ('queued', 'running', 'failed')`) : 0,
  ]);
  const google = {
    sync: googleRows.find((row) => row.setting_key === "search_console_sync")?.value,
    sitemap: googleRows.find((row) => row.setting_key === "search_console_sitemap_submission")?.value,
  };
  const seoRows = Number(seoTotals[0]?.count ?? 0);
  const publicProducts = area === "products" ? (await import("@/lib/product-model")).publicProducts : [];
  const publicIds = new Set(publicProducts.map((product) => product.id));
  const knownProducts = catalogRows.filter((row) => publicIds.has(row.id));
  const catalogMatches = knownProducts.length === publicProducts.length && catalogRows.length === knownProducts.length;
  const content = Number(contentCounts[0]?.content ?? 0);
  const publishedNews = Number(contentCounts[0]?.news ?? 0);
  const metric = (label: string, value: number | string, detail?: string) => ({ label, value: String(value), detail, href: pageHref(area) });
  const metricSets: Record<string, AdminMetric[]> = {
    seo: [
      metric("点击", seoRows ? seoTotals[0]?.clicks ?? "—" : "—", "Google Search Console"),
      metric("展示", seoRows ? seoTotals[0]?.impressions ?? "—" : "—", "Google Search Console"),
      metric("平均排名", seoTotals[0]?.position == null ? "—" : Number(seoTotals[0].position).toFixed(1), "按展示量加权"),
      metric("记录", seoRows),
    ],
    products: [
      metric("前台产品", publicProducts.length, "当前部署的目录"),
      metric("后台已发布", catalogRows.length, `最近同步 ${dateTime(catalogRows[0]?.updated_at)}`),
      metric("目录编号核对", catalogMatches ? "一致" : "有差异", `匹配 ${knownProducts.length} / ${publicProducts.length}`),
    ],
    news: [metric("已发布内容", content), metric("已发布 News", publishedNews)],
    "news-operations": [metric("待处理任务", pendingJobs), metric("已发布 News", publishedNews)],
    forms: [metric("真实询盘", leadCounts[0]?.real ?? 0), metric("测试记录", leadCounts[0]?.test ?? 0), metric("邮件通知任务", mailJobs, "含测试")],
    links: [metric("待复查链接", linkIssues)],
    settings: [metric("搜索数据同步", google.sync?.state === "failed" ? "失败" : google.sync?.lastSuccessAt ? "已同步" : "待同步"), metric("待处理任务", pendingJobs)],
  };
  let table: AdminTable;
  let totalRows = 0;
  let breakdowns: AdminBreakdown[] = [];
  if (area === "products") {
    totalRows = await count(() => sql<{ count: string }[]>`select count(*)::text as count from catalog_records where site_id = ${siteId} and updated_at >= ${start} and updated_at <= ${end} and (${search} = '' or title ilike '%' || ${search} || '%' or coalesce(slug, '') ilike '%' || ${search} || '%')`);
    const rows = await sql<{ title: string; slug: string | null; status: string; locale: string; updated_at: string }[]>`select title, slug, status, locale, updated_at from catalog_records where site_id = ${siteId} and updated_at >= ${start} and updated_at <= ${end} and (${search} = '' or title ilike '%' || ${search} || '%' or coalesce(slug, '') ilike '%' || ${search} || '%') order by updated_at desc limit ${pageSize} offset ${offset}`;
    const statusRows = await sql<{ label: string; value: number }[]>`select status as label, count(*)::int as value from catalog_records where site_id = ${siteId} group by status order by value desc`;
    const typeRows = await sql<{ label: string; value: number }[]>`select record_type as label, count(*)::int as value from catalog_records where site_id = ${siteId} group by record_type order by value desc`;
    breakdowns = [{ title: "发布状态", items: bars(statusRows), emptyText: "尚无产品记录。" }, { title: "目录类型", items: bars(typeRows), emptyText: "尚无目录记录。" }];
    table = { title: "产品目录", columns: ["名称", "链接标识", "语言", "状态", "更新时间"], rows: rows.map((row) => [row.title, row.slug || "—", row.locale, row.status, dateTime(row.updated_at)]), emptyText: "尚未录入产品记录。" };
  } else if (area === "news") {
    totalRows = await count(() => sql<{ count: string }[]>`
      select count(*)::text as count from (
        select id from content_records where site_id = ${siteId} and updated_at >= ${start} and updated_at <= ${end} and (${search} = '' or title ilike '%' || ${search} || '%')
        union all
        select id from news_articles where site_id = ${siteId} and coalesce(modified_at, published_at, created_at) >= ${start} and coalesce(modified_at, published_at, created_at) <= ${end} and (${search} = '' or title ilike '%' || ${search} || '%')
      ) records`);
    const rows = await sql<{ title: string; source: string; content_type: string; status: string; locale: string; updated_at: string }[]>`
      select title, source, content_type, status, locale, updated_at from (
        select title, '内容记录' as source, content_type, status, locale, updated_at from content_records
          where site_id = ${siteId} and updated_at >= ${start} and updated_at <= ${end} and (${search} = '' or title ilike '%' || ${search} || '%')
        union all
        select title, 'News' as source, content_type, status, locale, coalesce(modified_at, published_at, created_at) as updated_at from news_articles
          where site_id = ${siteId} and coalesce(modified_at, published_at, created_at) >= ${start} and coalesce(modified_at, published_at, created_at) <= ${end} and (${search} = '' or title ilike '%' || ${search} || '%')
      ) records order by updated_at desc limit ${pageSize} offset ${offset}`;
    const statusRows = await sql<{ label: string; value: number }[]>`
      select status as label, count(*)::int as value from (
        select status from content_records where site_id = ${siteId} and updated_at >= ${start} and updated_at <= ${end}
        union all
        select status from news_articles where site_id = ${siteId} and coalesce(modified_at, published_at, created_at) >= ${start} and coalesce(modified_at, published_at, created_at) <= ${end}
      ) records group by status order by value desc`;
    const typeRows = await sql<{ label: string; value: number }[]>`
      select content_type as label, count(*)::int as value from (
        select content_type from content_records where site_id = ${siteId} and updated_at >= ${start} and updated_at <= ${end}
        union all
        select content_type from news_articles where site_id = ${siteId} and coalesce(modified_at, published_at, created_at) >= ${start} and coalesce(modified_at, published_at, created_at) <= ${end}
      ) records group by content_type order by value desc`;
    const jobRows = await sql<{ label: string; value: number }[]>`select status as label, count(*)::int as value from news_runs where site_id = ${siteId} and started_at >= ${start} and started_at <= ${end} group by status order by value desc`;
    breakdowns = [{ title: "内容状态", items: bars(statusRows), emptyText: "尚无内容记录。" }, { title: "内容类型", items: bars(typeRows), emptyText: "尚无内容记录。" }, { title: "News 运行记录", items: bars(jobRows), emptyText: "当前范围尚无 News 运行记录。" }];
    table = { title: "内容记录", columns: ["标题", "来源", "类型", "语言", "状态", "更新时间"], rows: rows.map((row) => [row.title, row.source, row.content_type, row.locale, row.status, dateTime(row.updated_at)]), emptyText: "当前范围尚无内容记录。" };
  } else if (area === "news-operations") {
    const installed = await sql<{ source_catalog: string | null }[]>`select to_regclass('public.news_sources')::text as source_catalog`;
    totalRows = installed[0]?.source_catalog ? await count(() => sql<{ count: string }[]>`select count(*)::text as count from news_sources source join news_source_catalog_versions version on version.id = source.catalog_version_id where source.site_id = ${siteId} and version.status = 'active' and (source.last_checked_at is null or (source.last_checked_at >= ${start} and source.last_checked_at <= ${end})) and (${search} = '' or source.name ilike '%' || ${search} || '%')`) : 0;
    const rows = installed[0]?.source_catalog ? await sql<{ name: string; source_ordinal: number; validation_status: string; active: boolean; robots_allowed: boolean | null; feed_url: string | null; last_checked_at: string | null; last_used_at: string | null }[]>`
      select source.name, source.source_ordinal, source.validation_status, source.active, source.robots_allowed, source.feed_url, source.last_checked_at, source.last_used_at
      from news_sources source join news_source_catalog_versions version on version.id = source.catalog_version_id
      where source.site_id = ${siteId} and version.status = 'active' and (source.last_checked_at is null or (source.last_checked_at >= ${start} and source.last_checked_at <= ${end})) and (${search} = '' or source.name ilike '%' || ${search} || '%') order by source.source_ordinal asc limit ${pageSize} offset ${offset}` : [];
    const statusRows = installed[0]?.source_catalog ? await sql<{ label: string; value: number }[]>`
      select validation_status as label, count(*)::int as value from news_sources source join news_source_catalog_versions version on version.id = source.catalog_version_id
      where source.site_id = ${siteId} and version.status = 'active' group by validation_status order by value desc` : [];
    const activeRows = installed[0]?.source_catalog ? await sql<{ label: string; value: number }[]>`
      select case when active and robots_allowed and feed_url is not null and validation_status = 'verified' then '可用于采集' else '未启用或待审核' end as label, count(*)::int as value
      from news_sources source join news_source_catalog_versions version on version.id = source.catalog_version_id
      where source.site_id = ${siteId} and version.status = 'active' group by 1 order by value desc` : [];
    const jobRows = installed[0]?.source_catalog ? await sql<{ label: string; value: number }[]>`select status as label, count(*)::int as value from news_runs where site_id = ${siteId} group by status order by value desc` : [];
    breakdowns = [{ title: "来源核验状态", items: bars(statusRows), emptyText: "尚未导入来源目录。" }, { title: "可用来源", items: bars(activeRows), emptyText: "尚未导入来源目录。" }, { title: "News 运行记录", items: bars(jobRows), emptyText: "尚无 News 运行记录。" }];
    table = { title: "活动来源目录", columns: ["编号", "来源", "核验状态", "采集资格", "Robots", "订阅入口", "最近检查", "最近使用"], rows: rows.map((row) => [String(row.source_ordinal), row.name, row.validation_status, row.active && row.feed_url ? "已启用" : "未启用", row.robots_allowed === true ? "允许" : row.robots_allowed === false ? "禁止" : "待检查", row.feed_url ? "已发现" : "待发现", dateTime(row.last_checked_at), dateTime(row.last_used_at)]), emptyText: "当前没有活动来源目录。先导入草稿、完成低频核验，再显式启用版本。" };
  } else if (area === "forms") {
    totalRows = await count(() => sql<{ count: string }[]>`select count(*)::text as count from form_leads where site_id = ${siteId} and created_at >= ${start} and created_at <= ${end} and (${search} = '' or id::text ilike '%' || ${search} || '%' or coalesce(attribution->>'product_name', '') ilike '%' || ${search} || '%' or coalesce(attribution->>'source', '') ilike '%' || ${search} || '%')`);
    const rows = await sql<{ id: string; lead_status: string; created_at: string; attribution: { locale?: string; source?: string; product_name?: string; test_submission?: boolean } | null; email_status: string | null; email_result: EmailResult | null }[]>`select lead.id::text as id, lead.lead_status, lead.created_at, lead.attribution, email.status as email_status, email.result as email_result from form_leads lead left join admin_jobs email on email.site_id = lead.site_id and email.kind = 'inquiry_email_notification' and email.idempotency_key = 'inquiry-email:' || lead.id::text where lead.site_id = ${siteId} and lead.created_at >= ${start} and lead.created_at <= ${end} and (${search} = '' or lead.id::text ilike '%' || ${search} || '%' or coalesce(lead.attribution->>'product_name', '') ilike '%' || ${search} || '%' or coalesce(lead.attribution->>'source', '') ilike '%' || ${search} || '%') order by lead.created_at desc limit ${pageSize} offset ${offset}`;
    const statusRows = await sql<{ label: string; value: number }[]>`select case when attribution->>'test_submission' = 'true' then '测试' else lead_status end as label, count(*)::int as value from form_leads where site_id = ${siteId} and created_at >= ${start} and created_at <= ${end} group by 1 order by value desc`;
    const leadLocaleRows = await sql<{ label: string; value: number }[]>`select coalesce(nullif(attribution->>'locale', ''), 'unknown') as label, count(*)::int as value from form_leads where site_id = ${siteId} and created_at >= ${start} and created_at <= ${end} group by 1 order by value desc`;
    const leadSourceRows = await sql<{ label: string; value: number }[]>`select coalesce(nullif(attribution->>'source', ''), '未记录') as label, count(*)::int as value from form_leads where site_id = ${siteId} and created_at >= ${start} and created_at <= ${end} group by 1 order by value desc limit 6`;
    breakdowns = [{ title: "表单状态（含测试）", items: bars(statusRows), emptyText: "当前范围内暂无表单记录。" }, { title: "表单语言（含测试）", items: bars(leadLocaleRows), emptyText: "当前范围内暂无表单记录。" }, { title: "表单来源（含测试）", items: bars(leadSourceRows), emptyText: "当前范围内暂无表单来源。" }];
    table = { title: "表单记录（含测试）", columns: ["编号", "状态", "邮件通知", "语言", "产品", "来源", "提交时间"], rows: rows.map((row) => [row.id.slice(0, 8), row.attribution?.test_submission ? "测试" : row.lead_status, emailStatus(row.email_status, row.email_result), row.attribution?.locale || "—", row.attribution?.product_name || "—", row.attribution?.source || "—", dateTime(row.created_at)]), emptyText: "当前范围内尚无表单记录。", recordIds: rows.map((row) => row.id) };
  } else if (area === "seo") {
    totalRows = seoRows;
    const rows = await sql<{ url: string; clicks: number | null; impressions: number | null; average_position: number | null; metric_date: string }[]>`select url, clicks, impressions, average_position, metric_date::text as metric_date from seo_metrics where site_id = ${siteId} and source = 'google_search_console' and metric_date >= ${startDate} and metric_date <= ${endDate} and (${search} = '' or url ilike '%' || ${search} || '%') order by metric_date desc, impressions desc nulls last limit ${pageSize} offset ${offset}`;
    const seoPages = await sql<{ label: string; value: number }[]>`select url as label, coalesce(sum(impressions), 0)::int as value from seo_metrics where site_id = ${siteId} and source = 'google_search_console' and metric_date >= ${startDate} and metric_date <= ${endDate} and (${search} = '' or url ilike '%' || ${search} || '%') group by url order by value desc limit 6`;
    breakdowns = [{ title: "搜索展示页面", items: bars(seoPages), emptyText: "尚未同步 Search Console 数据。" }];
    table = { title: "Search Console 页面表现", columns: ["页面", "点击", "展示", "平均排名", "日期"], rows: rows.map((row) => [row.url, String(row.clicks ?? 0), String(row.impressions ?? 0), row.average_position == null ? "—" : Number(row.average_position).toFixed(1), row.metric_date.slice(0, 10)]), emptyText: "尚未同步到 Search Console 数据。" };
  } else if (area === "links") {
    totalRows = await count(() => sql<{ count: string }[]>`select count(*)::text as count from link_audits where site_id = ${siteId} and last_checked_at >= ${start} and last_checked_at <= ${end} and (${search} = '' or source_url ilike '%' || ${search} || '%' or coalesce(target_url, '') ilike '%' || ${search} || '%')`);
    const rows = await sql<{ source_url: string; target_url: string | null; http_status: number | null; severity: string; status: string; last_checked_at: string }[]>`select source_url, target_url, http_status, severity, status, last_checked_at from link_audits where site_id = ${siteId} and last_checked_at >= ${start} and last_checked_at <= ${end} and (${search} = '' or source_url ilike '%' || ${search} || '%' or coalesce(target_url, '') ilike '%' || ${search} || '%') order by last_checked_at desc limit ${pageSize} offset ${offset}`;
    const severityRows = await sql<{ label: string; value: number }[]>`select severity as label, count(*)::int as value from link_audits where site_id = ${siteId} group by severity order by value desc`;
    const typeRows = await sql<{ label: string; value: number }[]>`select link_type as label, count(*)::int as value from link_audits where site_id = ${siteId} group by link_type order by value desc`;
    breakdowns = [{ title: "问题优先级", items: bars(severityRows), emptyText: "尚未运行链接审计。" }, { title: "链接类型", items: bars(typeRows), emptyText: "尚未运行链接审计。" }];
    table = { title: "链接审计结果", columns: ["来源页面", "目标", "HTTP", "优先级", "状态", "检查时间"], rows: rows.map((row) => [row.source_url, row.target_url || "—", String(row.http_status ?? "—"), row.severity, row.status, dateTime(row.last_checked_at)]), emptyText: "尚未运行链接审计。" };
  } else if (area === "settings") {
    totalRows = await count(() => sql<{ count: string }[]>`select count(*)::text as count from site_settings where site_id = ${siteId} and updated_at >= ${start} and updated_at <= ${end} and (${search} = '' or setting_key ilike '%' || ${search} || '%')`);
    const rows = await sql<{ setting_key: string; updated_at: string }[]>`select setting_key, updated_at from site_settings where site_id = ${siteId} and updated_at >= ${start} and updated_at <= ${end} and (${search} = '' or setting_key ilike '%' || ${search} || '%') order by updated_at desc limit ${pageSize} offset ${offset}`;
    breakdowns = [{ title: "连接状态", items: [{ label: "数据库", value: 1 }, { label: "Search Console", value: google.sync?.lastSuccessAt ? 1 : 0 }], emptyText: "暂无已保存设置。" }, { title: "站点数据", items: [{ label: "产品", value: catalogRows.length }, { label: "内容", value: content + publishedNews }, { label: "询盘", value: Number(leadCounts[0]?.real ?? 0) }], emptyText: "暂无站点数据。" }, { title: "待处理项目", items: [{ label: "任务", value: pendingJobs }, { label: "链接", value: linkIssues }], emptyText: "暂无待处理项目。" }];
    table = { title: "已保存的站点设置", columns: ["设置项", "更新时间"], rows: rows.map((row) => [row.setting_key, dateTime(row.updated_at)]), emptyText: "当前没有可展示的站点设置记录。" };
  } else {
    return unavailable;
  }

  return { connected: true, google, lastDataAt: seoLatest[0]?.latest ?? null, rangeDays, from: startDate, to: endDate, page, pageSize, totalRows, metrics: metricSets[area], trend: trendRows, breakdowns, table };
}

export async function writeAdminAudit(siteId: string, actorId: string, action: string, targetType: string, targetId: string | null, reason: string) {
  if (!sql) throw new Error("admin_store_not_configured");
  await sql`insert into audit_logs (id, site_id, actor_id, action, target_type, target_id, reason) values (${crypto.randomUUID()}, ${siteId}, ${actorId === "bootstrap-admin" ? null : actorId}, ${action}, ${targetType}, ${targetId}, ${reason})`;
}

export async function writeAdminJob(siteId: string, kind: string, idempotencyKey: string, payload: Record<string, unknown>) {
  if (!sql) throw new Error("admin_store_not_configured");
  await sql`insert into admin_jobs (id, site_id, kind, idempotency_key, status, payload, result) values (${crypto.randomUUID()}, ${siteId}, ${kind}, ${idempotencyKey}, 'queued', ${sql.json(payload as never)}, '{}'::jsonb) on conflict (site_id, idempotency_key) do update set status = 'queued', payload = excluded.payload`;
}

export async function completeAdminJob(siteId: string, idempotencyKey: string, status: "succeeded" | "failed", result: Record<string, unknown>) {
  if (!sql) throw new Error("admin_store_not_configured");
  await sql`update admin_jobs set status = ${status}, result = ${sql.json(result as never)} where site_id = ${siteId} and idempotency_key = ${idempotencyKey}`;
}

function inquiryEncryptionKey() {
  const secret = process.env.INQUIRY_ENCRYPTION_KEY || process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("inquiry_encryption_not_configured");
  return createHash("sha256").update(secret).digest();
}

const inquirySiteId = "bzmagnet";
const inquiryJobKey = (id: string) => `inquiry-email:${id}`;
const maxEmailAttempts = 3;

export async function storeInternalLead(id: string, rateKey: string, input: Inquiry, attribution: InquiryAttribution & { test_submission?: boolean }) {
  if (!sql) throw new Error("admin_store_not_configured");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", inquiryEncryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(input), "utf8"), cipher.final()]);
  const payload = Buffer.concat([iv, cipher.getAuthTag(), ciphertext]);
  const jobKey = inquiryJobKey(id);
  return sql.begin(async (transaction) => {
    await transaction`select pg_advisory_xact_lock(hashtextextended(${jobKey}, 0))`;
    const [existing] = await transaction<{ status: string | null; encrypted_payload: Buffer }[]>`
      select job.status, lead.encrypted_payload from form_leads lead left join admin_jobs job
        on job.site_id = lead.site_id and job.idempotency_key = ${jobKey}
      where lead.id = ${id} and lead.site_id = ${inquirySiteId}`;
    if (existing) {
      if (JSON.stringify(decryptInquiry(existing.encrypted_payload)) !== JSON.stringify(input)) return { conflict: true } as const;
      return { created: false, notificationSent: existing.status === "succeeded" };
    }
    const reserved = await transaction`
      insert into admin_jobs (id, site_id, kind, idempotency_key, status)
      values (${randomUUID()}, ${inquirySiteId}, 'inquiry_rate_limit', ${rateKey}, 'succeeded')
      on conflict (site_id, idempotency_key) do nothing returning id`;
    if (!reserved.length) return null;
    await transaction`insert into form_leads (id, site_id, status, encrypted_payload, attribution)
      values (${id}, ${inquirySiteId}, 'new', ${payload}, ${transaction.json(attribution as never)})`;
    await transaction`insert into admin_jobs (id, site_id, kind, idempotency_key, status, payload)
      values (${randomUUID()}, ${inquirySiteId}, 'inquiry_email_notification', ${jobKey}, 'queued',
        ${transaction.json({ leadId: id, deliveryVersion: 1 })})`;
    return { created: true, notificationSent: false };
  });
}

export type InquiryDelivery = { lead_id: string; encrypted_payload: Buffer; attempt: number; lease: string };

export async function claimInquiryEmails(leadId?: string) {
  if (!sql) throw new Error("admin_store_not_configured");
  const lease = randomUUID();
  const now = Date.now();
  return sql<InquiryDelivery[]>`
    with expired as (
      update admin_jobs set status = 'failed',
        result = jsonb_build_object('attempt', ${maxEmailAttempts}::int, 'code', 'smtp_outcome_unknown')
      where site_id = ${inquirySiteId} and kind = 'inquiry_email_notification' and payload->>'deliveryVersion' = '1'
        and status = 'running' and (result->>'leaseUntil')::bigint <= ${now} and (result->>'attempt')::int >= ${maxEmailAttempts}
        and ${!leadId}
    ), due as (
      select id, coalesce((result->>'attempt')::int, 0) + 1 as attempt
      from admin_jobs
      where site_id = ${inquirySiteId} and kind = 'inquiry_email_notification' and payload->>'deliveryVersion' = '1'
        and (${leadId || ""} = '' or idempotency_key = ${inquiryJobKey(leadId || "")})
        and (
          status = 'queued'
          or (status = 'failed' and (result->>'retryAt')::bigint <= ${now} and (result->>'attempt')::int < ${maxEmailAttempts})
          or (status = 'running' and (result->>'leaseUntil')::bigint <= ${now} and (result->>'attempt')::int < ${maxEmailAttempts})
        )
      order by created_at limit ${leadId ? 1 : 8} for update skip locked
    ), claimed as (
      update admin_jobs job set status = 'running',
        result = jsonb_build_object('attempt', due.attempt, 'lease', ${lease}::text, 'leaseUntil', ${now + 5 * 60_000}::bigint)
      from due where job.id = due.id
      returning job.payload->>'leadId' as lead_id, due.attempt
    )
    select claimed.lead_id, lead.encrypted_payload, claimed.attempt, ${lease}::text as lease
    from claimed join form_leads lead on lead.id = claimed.lead_id::uuid and lead.site_id = ${inquirySiteId}`;
}

export function decryptInquiry(payload: Buffer): Inquiry {
  const decipher = createDecipheriv("aes-256-gcm", inquiryEncryptionKey(), payload.subarray(0, 12));
  decipher.setAuthTag(payload.subarray(12, 28));
  return JSON.parse(Buffer.concat([decipher.update(payload.subarray(28)), decipher.final()]).toString("utf8")) as Inquiry;
}

export async function getInquiryDetail(siteId: string, id: string) {
  if (!sql || !isSubmissionId(id)) return null;
  const [row] = await sql<{
    id: string; encrypted_payload: Buffer; created_at: string; attribution: InquiryAttribution & { test_submission?: boolean };
    email_status: string | null; email_result: EmailResult | null;
  }[]>`
    select lead.id::text, lead.encrypted_payload, lead.created_at, lead.attribution, job.status as email_status, job.result as email_result
    from form_leads lead left join admin_jobs job on job.site_id = lead.site_id
      and job.idempotency_key = 'inquiry-email:' || lead.id::text and job.kind = 'inquiry_email_notification'
    where lead.site_id = ${siteId} and lead.id = ${id}`;
  if (!row) return null;
  let inquiry: Inquiry | null = null;
  try { inquiry = decryptInquiry(row.encrypted_payload); } catch { /* Older encryption keys can be unavailable. */ }
  return { id: row.id, inquiry, createdAt: dateTime(row.created_at), attribution: row.attribution, emailStatus: emailStatus(row.email_status, row.email_result), emailResult: row.email_result };
}

export async function finishInquiryEmail(job: InquiryDelivery, outcome: { sent: true; messageId: string } | { sent: false; code: string }) {
  if (!sql) throw new Error("admin_store_not_configured");
  const retryAt = job.attempt < maxEmailAttempts ? Date.now() + 15 * 60_000 * job.attempt : null;
  const result = outcome.sent
    ? { attempt: job.attempt, messageId: outcome.messageId, acceptedAt: new Date().toISOString() }
    : { attempt: job.attempt, code: outcome.code, retryAt };
  await sql`update admin_jobs set status = ${outcome.sent ? "succeeded" : "failed"}, result = ${sql.json(result)}
    where site_id = ${inquirySiteId} and idempotency_key = ${inquiryJobKey(job.lead_id)} and status = 'running' and result->>'lease' = ${job.lease}`;
}
