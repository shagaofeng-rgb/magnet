import "server-only";

import postgres from "postgres";

const cleanUrl = (value: string | undefined) => value?.trim().replace(/^(['"])(.*)\1$/, "$2") || undefined;
const databaseUrl = [process.env.ADMIN_DATABASE_URL, process.env.NEWS_DATABASE_URL, process.env.POSTGRES_URL, process.env.DATABASE_URL]
  .map(cleanUrl)
  .find(Boolean);
const sql = databaseUrl ? postgres(databaseUrl, { prepare: false, max: 4, idle_timeout: 10, connect_timeout: 10 }) : null;

export type AdminMetric = { label: string; value: string; href: string };
export type AdminTrendPoint = { label: string; value: number };
export type AdminTable = { title: string; columns: string[]; rows: string[][]; emptyText: string };
export type AdminModuleData = {
  connected: boolean;
  lastSynced: string | null;
  metrics: AdminMetric[];
  trend: AdminTrendPoint[];
  table: AdminTable;
};

const pageHref = (area: string) => `/admin/bzmagnet/${area}`;
const count = async (query: () => Promise<Array<{ count: string }>>) => Number((await query())[0]?.count ?? 0);
const dateTime = (value: string | Date | null | undefined) => value ? new Date(value).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai", hour12: false }) : "—";
const dateOnly = (value: string | Date | null | undefined) => value ? new Date(value).toLocaleDateString("zh-CN", { timeZone: "Asia/Shanghai" }) : "—";

export function isAdminStoreConfigured() { return Boolean(sql); }

export async function getAdminModuleData(siteId: string, area: string): Promise<AdminModuleData> {
  const unavailable: AdminModuleData = {
    connected: false,
    lastSynced: null,
    metrics: [{ label: "数据连接", value: "未连接", href: pageHref("settings") }],
    trend: [],
    table: { title: "当前数据", columns: ["状态"], rows: [], emptyText: "数据库尚未连接，暂无可展示的真实数据。" },
  };
  if (!sql) return unavailable;

  const [products, content, leads, publishedNews, sessions, pageViews, seoRows, linkIssues, pendingJobs, lastSync] = await Promise.all([
    count(() => sql<{ count: string }[]>`select count(*)::text as count from catalog_records where site_id = ${siteId} and status = 'published'`),
    count(() => sql<{ count: string }[]>`select count(*)::text as count from content_records where site_id = ${siteId} and status = 'published'`),
    count(() => sql<{ count: string }[]>`select count(*)::text as count from form_leads where site_id = ${siteId}`),
    count(() => sql<{ count: string }[]>`select count(*)::text as count from news_articles where site_id = ${siteId} and status = 'published'`),
    count(() => sql<{ count: string }[]>`select count(distinct anonymous_session_id)::text as count from visitor_sessions where site_id = ${siteId}`),
    count(() => sql<{ count: string }[]>`select coalesce(sum(page_views), 0)::text as count from page_metrics where site_id = ${siteId}`),
    count(() => sql<{ count: string }[]>`select count(*)::text as count from seo_metrics where site_id = ${siteId}`),
    count(() => sql<{ count: string }[]>`select count(*)::text as count from link_audits where site_id = ${siteId} and status in ('open', 'recheck')`),
    count(() => sql<{ count: string }[]>`select count(*)::text as count from admin_jobs where site_id = ${siteId} and status in ('queued', 'running', 'failed')`),
    sql<{ updated_at: string | null }[]>`select updated_at from site_settings where site_id = ${siteId} and setting_key = 'search_console_sync' limit 1`,
  ]);

  const overview = [
    { label: "产品", value: String(products), href: pageHref("products") },
    { label: "已发布内容", value: String(content + publishedNews), href: pageHref("news") },
    { label: "询盘", value: String(leads), href: pageHref("forms") },
    { label: "待处理项目", value: String(linkIssues + pendingJobs), href: pageHref("links") },
  ];
  const metricSets: Record<string, AdminMetric[]> = {
    overview,
    traffic: [{ label: "匿名会话", value: String(sessions), href: pageHref("visitors") }, { label: "页面浏览", value: String(pageViews), href: pageHref("page-performance") }],
    seo: [{ label: "搜索记录", value: String(seoRows), href: pageHref("seo") }, { label: "链接问题", value: String(linkIssues), href: pageHref("links") }],
    products: [{ label: "已发布产品", value: String(products), href: pageHref("products") }, { label: "总目录记录", value: String(products), href: pageHref("products") }],
    news: [{ label: "已发布内容", value: String(content), href: pageHref("news") }, { label: "已发布 News", value: String(publishedNews), href: pageHref("news") }],
    "news-operations": [{ label: "待运行任务", value: String(pendingJobs), href: pageHref("news-operations") }, { label: "已发布 News", value: String(publishedNews), href: pageHref("news") }],
    forms: [{ label: "全部询盘", value: String(leads), href: pageHref("forms") }, { label: "匿名会话", value: String(sessions), href: pageHref("visitors") }],
    links: [{ label: "待复查链接", value: String(linkIssues), href: pageHref("links") }, { label: "页面浏览", value: String(pageViews), href: pageHref("page-performance") }],
    visitors: [{ label: "匿名会话", value: String(sessions), href: pageHref("visitors") }, { label: "页面浏览", value: String(pageViews), href: pageHref("page-performance") }],
    "page-performance": [{ label: "页面浏览", value: String(pageViews), href: pageHref("page-performance") }, { label: "搜索记录", value: String(seoRows), href: pageHref("seo") }],
    paths: [{ label: "匿名会话", value: String(sessions), href: pageHref("paths") }, { label: "询盘", value: String(leads), href: pageHref("forms") }],
    settings: [{ label: "搜索同步记录", value: String(seoRows), href: pageHref("seo") }, { label: "待处理任务", value: String(pendingJobs), href: pageHref("news-operations") }],
  };

  const trendRows = await sql<{ label: string; value: number }[]>`
    select to_char(metric_date, 'MM-DD') as label, coalesce(sum(page_views), 0)::int as value
    from page_metrics
    where site_id = ${siteId} and metric_date >= current_date - interval '13 days'
    group by metric_date
    order by metric_date asc`;

  let table: AdminTable;
  if (area === "products") {
    const rows = await sql<{ title: string; slug: string | null; status: string; updated_at: string }[]>`select title, slug, status, updated_at from catalog_records where site_id = ${siteId} order by updated_at desc limit 30`;
    table = { title: "产品目录", columns: ["名称", "链接标识", "状态", "更新时间"], rows: rows.map((row) => [row.title, row.slug || "—", row.status, dateTime(row.updated_at)]), emptyText: "尚未录入产品记录。" };
  } else if (area === "news" || area === "news-operations") {
    const rows = await sql<{ title: string; content_type: string; status: string; updated_at: string }[]>`select title, content_type, status, updated_at from content_records where site_id = ${siteId} order by updated_at desc limit 30`;
    table = { title: "内容记录", columns: ["标题", "类型", "状态", "更新时间"], rows: rows.map((row) => [row.title, row.content_type, row.status, dateTime(row.updated_at)]), emptyText: "尚无已保存的内容记录。" };
  } else if (area === "forms") {
    const rows = await sql<{ id: string; lead_status: string; created_at: string; attribution: { locale?: string; sourceUrl?: string } | null }[]>`select id::text, lead_status, created_at, attribution from form_leads where site_id = ${siteId} order by created_at desc limit 30`;
    table = { title: "询盘收件箱", columns: ["编号", "状态", "语言", "提交时间"], rows: rows.map((row) => [row.id.slice(0, 8), row.lead_status, row.attribution?.locale || "—", dateTime(row.created_at)]), emptyText: "尚未收到询盘。" };
  } else if (area === "seo") {
    const rows = await sql<{ url: string; clicks: number | null; impressions: number | null; average_position: number | null; metric_date: string }[]>`select url, clicks, impressions, average_position, metric_date from seo_metrics where site_id = ${siteId} order by metric_date desc, impressions desc nulls last limit 30`;
    table = { title: "搜索表现", columns: ["页面", "点击", "展示", "平均排名", "日期"], rows: rows.map((row) => [row.url, String(row.clicks ?? 0), String(row.impressions ?? 0), row.average_position == null ? "—" : Number(row.average_position).toFixed(1), dateOnly(row.metric_date)]), emptyText: "尚未同步到 Search Console 数据。" };
  } else if (area === "links") {
    const rows = await sql<{ source_url: string; target_url: string | null; http_status: number | null; severity: string; status: string }[]>`select source_url, target_url, http_status, severity, status from link_audits where site_id = ${siteId} order by last_checked_at desc limit 30`;
    table = { title: "链接审计", columns: ["来源页面", "目标", "HTTP", "优先级", "状态"], rows: rows.map((row) => [row.source_url, row.target_url || "—", String(row.http_status ?? "—"), row.severity, row.status]), emptyText: "尚未运行链接审计。" };
  } else if (area === "visitors" || area === "traffic") {
    const rows = await sql<{ landing_path: string | null; channel: string | null; device_class: string | null; locale: string | null; started_at: string }[]>`select landing_path, channel, device_class, locale, started_at from visitor_sessions where site_id = ${siteId} order by started_at desc limit 30`;
    table = { title: "匿名访问会话", columns: ["入口页面", "来源", "设备", "语言", "开始时间"], rows: rows.map((row) => [row.landing_path || "—", row.channel || "direct", row.device_class || "—", row.locale || "—", dateTime(row.started_at)]), emptyText: "尚无访问记录；上线后将自动开始记录匿名访问数据。" };
  } else if (area === "page-performance" || area === "paths") {
    const rows = await sql<{ path: string; page_views: number | null; conversions: number | null; metric_date: string }[]>`select path, sum(page_views)::int as page_views, sum(conversions)::int as conversions, max(metric_date)::text as metric_date from page_metrics where site_id = ${siteId} group by path order by sum(page_views) desc nulls last limit 30`;
    table = { title: area === "paths" ? "页面路径" : "页面表现", columns: ["页面", "浏览", "转化", "最近记录"], rows: rows.map((row) => [row.path, String(row.page_views ?? 0), String(row.conversions ?? 0), dateOnly(row.metric_date)]), emptyText: "尚无页面访问数据。" };
  } else if (area === "settings") {
    const rows = await sql<{ setting_key: string; updated_at: string }[]>`select setting_key, updated_at from site_settings where site_id = ${siteId} order by updated_at desc limit 30`;
    table = { title: "已保存的站点设置", columns: ["设置项", "更新时间"], rows: rows.map((row) => [row.setting_key, dateTime(row.updated_at)]), emptyText: "当前没有可展示的站点设置记录。" };
  } else {
    const rows = await sql<{ status: string; target_type: string; action: string; created_at: string }[]>`select 'recorded' as status, target_type, action, created_at from audit_logs where site_id = ${siteId} order by created_at desc limit 30`;
    table = { title: "最近操作", columns: ["状态", "对象", "操作", "时间"], rows: rows.map((row) => [row.status, row.target_type, row.action, dateTime(row.created_at)]), emptyText: "尚无后台操作记录。" };
  }

  return { connected: true, lastSynced: lastSync[0]?.updated_at ?? null, metrics: metricSets[area] ?? overview, trend: trendRows, table };
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

export async function storeInternalLead(input: Record<string, unknown>, attribution: Record<string, unknown>) {
  if (!sql) throw new Error("admin_store_not_configured");
  const secret = process.env.INQUIRY_ENCRYPTION_KEY || process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("inquiry_encryption_not_configured");
  const crypto = await import("node:crypto");
  const key = crypto.createHash("sha256").update(secret).digest();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(input), "utf8"), cipher.final()]);
  const payload = Buffer.concat([iv, cipher.getAuthTag(), ciphertext]);
  const id = crypto.randomUUID();
  await sql`insert into form_leads (id, site_id, status, encrypted_payload, attribution) values (${id}, 'bzmagnet', 'new', ${payload}, ${sql.json(attribution as never)})`;
  return id;
}
