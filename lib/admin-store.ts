import "server-only";

import postgres from "postgres";

const cleanUrl = (value: string | undefined) => value?.trim().replace(/^(['"])(.*)\1$/, "$2") || undefined;
const databaseUrl = [process.env.ADMIN_DATABASE_URL, process.env.NEWS_DATABASE_URL, process.env.POSTGRES_URL, process.env.DATABASE_URL].map(cleanUrl).find(Boolean);
const sql = databaseUrl ? postgres(databaseUrl, { prepare: false, max: 5, idle_timeout: 10, connect_timeout: 10 }) : null;

export type AdminMetric = { label: string; value: string; href: string; detail?: string };
export type AdminTrendPoint = { label: string; value: number; secondary?: number };
export type AdminBreakdown = { title: string; items: Array<{ label: string; value: number }>; emptyText: string };
export type AdminTable = { title: string; columns: string[]; rows: string[][]; emptyText: string };
export type AdminModuleData = { connected: boolean; lastSynced: string | null; metrics: AdminMetric[]; trend: AdminTrendPoint[]; breakdowns: AdminBreakdown[]; table: AdminTable; rangeDays: number };

const pageHref = (area: string) => `/admin/bzmagnet/${area}`;
const count = async (query: () => Promise<Array<{ count: string }>>) => Number((await query())[0]?.count ?? 0);
const dateTime = (value: string | Date | null | undefined) => value ? new Date(value).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai", hour12: false }) : "—";
const dateOnly = (value: string | Date | null | undefined) => value ? new Date(value).toLocaleDateString("zh-CN", { timeZone: "Asia/Shanghai" }) : "—";
const asNumber = (value: number | string | null | undefined) => Number(value || 0);
const bars = <T extends { label: string; value: number | string | null }>(rows: T[]) => rows.map((row) => ({ label: row.label || "未标记", value: asNumber(row.value) }));

function dates(rangeDays: number) {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() - rangeDays + 1);
  return { start, startDate: start.toISOString().slice(0, 10) };
}

export function isAdminStoreConfigured() { return Boolean(sql); }

export async function getAdminModuleData(siteId: string, area: string, rangeDays = 7): Promise<AdminModuleData> {
  const unavailable: AdminModuleData = { connected: false, lastSynced: null, rangeDays, metrics: [{ label: "数据连接", value: "未连接", href: pageHref("settings") }], trend: [], breakdowns: [], table: { title: "当前数据", columns: ["状态"], rows: [], emptyText: "数据库尚未连接，暂无可展示的真实数据。" } };
  if (!sql) return unavailable;
  const { start, startDate } = dates(rangeDays);

  const [views, sessions, leads, products, content, publishedNews, seoRows, linkIssues, pendingJobs, lastSync] = await Promise.all([
    count(() => sql<{ count: string }[]>`select coalesce(sum(page_views), 0)::text as count from page_metrics where site_id = ${siteId} and metric_date >= ${startDate}`),
    count(() => sql<{ count: string }[]>`select count(distinct anonymous_session_id)::text as count from visitor_sessions where site_id = ${siteId} and started_at >= ${start}`),
    count(() => sql<{ count: string }[]>`select count(*)::text as count from form_leads where site_id = ${siteId} and created_at >= ${start}`),
    count(() => sql<{ count: string }[]>`select count(*)::text as count from catalog_records where site_id = ${siteId} and status = 'published'`),
    count(() => sql<{ count: string }[]>`select count(*)::text as count from content_records where site_id = ${siteId} and status = 'published'`),
    count(() => sql<{ count: string }[]>`select count(*)::text as count from news_articles where site_id = ${siteId} and status = 'published'`),
    count(() => sql<{ count: string }[]>`select count(*)::text as count from seo_metrics where site_id = ${siteId} and metric_date >= ${startDate}`),
    count(() => sql<{ count: string }[]>`select count(*)::text as count from link_audits where site_id = ${siteId} and status in ('open', 'recheck')`),
    count(() => sql<{ count: string }[]>`select count(*)::text as count from admin_jobs where site_id = ${siteId} and status in ('queued', 'running', 'failed')`),
    sql<{ updated_at: string | null }[]>`select updated_at from site_settings where site_id = ${siteId} and setting_key = 'search_console_sync' limit 1`,
  ]);

  const trendRows = await sql<{ label: string; value: number; secondary: number }[]>`
    select to_char(metric_date, 'MM-DD') as label, coalesce(sum(page_views), 0)::int as value, coalesce(sum(conversions), 0)::int as secondary
    from page_metrics where site_id = ${siteId} and metric_date >= ${startDate}
    group by metric_date order by metric_date asc`;
  const channelRows = await sql<{ label: string; value: number }[]>`
    select coalesce(nullif(channel, ''), 'direct') as label, count(*)::int as value
    from visitor_sessions where site_id = ${siteId} and started_at >= ${start}
    group by 1 order by 2 desc limit 6`;
  const deviceRows = await sql<{ label: string; value: number }[]>`
    select coalesce(nullif(device_class, ''), 'unknown') as label, count(*)::int as value
    from visitor_sessions where site_id = ${siteId} and started_at >= ${start}
    group by 1 order by 2 desc limit 6`;
  const localeRows = await sql<{ label: string; value: number }[]>`
    select coalesce(nullif(locale, ''), 'unknown') as label, count(*)::int as value
    from visitor_sessions where site_id = ${siteId} and started_at >= ${start}
    group by 1 order by 2 desc limit 6`;
  const pageRows = await sql<{ label: string; value: number }[]>`
    select path as label, coalesce(sum(page_views), 0)::int as value
    from page_metrics where site_id = ${siteId} and metric_date >= ${startDate}
    group by path order by value desc limit 6`;

  const commonMetrics = [
    { label: "页面浏览", value: String(views), href: pageHref("page-performance"), detail: `近 ${rangeDays} 天` },
    { label: "匿名会话", value: String(sessions), href: pageHref("visitors"), detail: `近 ${rangeDays} 天` },
    { label: "询盘提交", value: String(leads), href: pageHref("forms"), detail: `近 ${rangeDays} 天` },
    { label: "已发布产品", value: String(products), href: pageHref("products") },
  ];
  const metricSets: Record<string, AdminMetric[]> = {
    overview: [...commonMetrics, { label: "已发布内容", value: String(content + publishedNews), href: pageHref("news") }, { label: "待处理项目", value: String(linkIssues + pendingJobs), href: pageHref("links") }],
    traffic: [{ label: "匿名会话", value: String(sessions), href: pageHref("visitors"), detail: `近 ${rangeDays} 天` }, { label: "页面浏览", value: String(views), href: pageHref("page-performance") }, { label: "来源渠道", value: String(channelRows.length), href: pageHref("traffic") }, { label: "设备类型", value: String(deviceRows.length), href: pageHref("traffic") }],
    seo: [{ label: "搜索记录", value: String(seoRows), href: pageHref("seo"), detail: `近 ${rangeDays} 天` }, { label: "链接问题", value: String(linkIssues), href: pageHref("links") }, { label: "同步状态", value: lastSync[0]?.updated_at ? "已同步" : "待同步", href: pageHref("seo") }, { label: "页面浏览", value: String(views), href: pageHref("page-performance") }],
    products: [{ label: "已发布产品", value: String(products), href: pageHref("products") }, { label: "站点页面浏览", value: String(views), href: pageHref("page-performance"), detail: `近 ${rangeDays} 天` }],
    news: [{ label: "已发布内容", value: String(content), href: pageHref("news") }, { label: "已发布 News", value: String(publishedNews), href: pageHref("news") }, { label: "站点页面浏览", value: String(views), href: pageHref("page-performance") }],
    "news-operations": [{ label: "待处理任务", value: String(pendingJobs), href: pageHref("news-operations") }, { label: "已发布 News", value: String(publishedNews), href: pageHref("news") }],
    forms: [{ label: "询盘提交", value: String(leads), href: pageHref("forms"), detail: `近 ${rangeDays} 天` }, { label: "邮件任务", value: String(pendingJobs), href: pageHref("news-operations") }],
    links: [{ label: "待复查链接", value: String(linkIssues), href: pageHref("links") }, { label: "追踪页面", value: String(pageRows.length), href: pageHref("page-performance") }],
    visitors: [{ label: "匿名会话", value: String(sessions), href: pageHref("visitors"), detail: `近 ${rangeDays} 天` }, { label: "页面浏览", value: String(views), href: pageHref("page-performance") }],
    "page-performance": [{ label: "页面浏览", value: String(views), href: pageHref("page-performance"), detail: `近 ${rangeDays} 天` }, { label: "有访问页面", value: String(pageRows.length), href: pageHref("page-performance") }, { label: "询盘提交", value: String(leads), href: pageHref("forms") }],
    paths: [{ label: "匿名会话", value: String(sessions), href: pageHref("paths") }, { label: "页面浏览", value: String(views), href: pageHref("page-performance") }, { label: "询盘提交", value: String(leads), href: pageHref("forms") }],
    settings: [{ label: "Search Console", value: lastSync[0]?.updated_at ? "已同步" : "待同步", href: pageHref("seo") }, { label: "待处理任务", value: String(pendingJobs), href: pageHref("news-operations") }],
  };

  let table: AdminTable;
  let breakdowns: AdminBreakdown[] = [
    { title: "来源渠道", items: bars(channelRows), emptyText: "当前范围内暂无来源数据。" },
    { title: "访问设备", items: bars(deviceRows), emptyText: "当前范围内暂无设备数据。" },
    { title: "访问语言", items: bars(localeRows), emptyText: "当前范围内暂无语言数据。" },
  ];
  if (area === "products") {
    const rows = await sql<{ title: string; slug: string | null; status: string; locale: string; updated_at: string }[]>`select title, slug, status, locale, updated_at from catalog_records where site_id = ${siteId} order by updated_at desc limit 50`;
    const statusRows = await sql<{ label: string; value: number }[]>`select status as label, count(*)::int as value from catalog_records where site_id = ${siteId} group by status order by value desc`;
    const typeRows = await sql<{ label: string; value: number }[]>`select record_type as label, count(*)::int as value from catalog_records where site_id = ${siteId} group by record_type order by value desc`;
    breakdowns = [{ title: "发布状态", items: bars(statusRows), emptyText: "尚无产品记录。" }, { title: "目录类型", items: bars(typeRows), emptyText: "尚无目录记录。" }, { title: "页面访问", items: bars(pageRows), emptyText: "当前范围内暂无产品页面访问。" }];
    table = { title: "产品目录", columns: ["名称", "链接标识", "语言", "状态", "更新时间"], rows: rows.map((row) => [row.title, row.slug || "—", row.locale, row.status, dateTime(row.updated_at)]), emptyText: "尚未录入产品记录。" };
  } else if (area === "news" || area === "news-operations") {
    const rows = await sql<{ title: string; content_type: string; status: string; locale: string; updated_at: string }[]>`select title, content_type, status, locale, updated_at from content_records where site_id = ${siteId} order by updated_at desc limit 50`;
    const statusRows = await sql<{ label: string; value: number }[]>`select status as label, count(*)::int as value from content_records where site_id = ${siteId} group by status order by value desc`;
    const typeRows = await sql<{ label: string; value: number }[]>`select content_type as label, count(*)::int as value from content_records where site_id = ${siteId} group by content_type order by value desc`;
    const jobRows = await sql<{ label: string; value: number }[]>`select status as label, count(*)::int as value from admin_jobs where site_id = ${siteId} group by status order by value desc`;
    breakdowns = [{ title: "内容状态", items: bars(statusRows), emptyText: "尚无内容记录。" }, { title: "内容类型", items: bars(typeRows), emptyText: "尚无内容记录。" }, { title: "任务状态", items: bars(jobRows), emptyText: "尚无运行任务。" }];
    table = { title: area === "news" ? "内容记录" : "发布任务", columns: ["标题", "类型", "语言", "状态", "更新时间"], rows: rows.map((row) => [row.title, row.content_type, row.locale, row.status, dateTime(row.updated_at)]), emptyText: "尚无已保存的内容记录。" };
  } else if (area === "forms") {
    const rows = await sql<{ id: string; lead_status: string; created_at: string; attribution: { locale?: string; source?: string; product_name?: string } | null }[]>`select id::text, lead_status, created_at, attribution from form_leads where site_id = ${siteId} and created_at >= ${start} order by created_at desc limit 50`;
    const statusRows = await sql<{ label: string; value: number }[]>`select lead_status as label, count(*)::int as value from form_leads where site_id = ${siteId} and created_at >= ${start} group by lead_status order by value desc`;
    const leadLocaleRows = await sql<{ label: string; value: number }[]>`select coalesce(nullif(attribution->>'locale', ''), 'unknown') as label, count(*)::int as value from form_leads where site_id = ${siteId} and created_at >= ${start} group by 1 order by value desc`;
    breakdowns = [{ title: "询盘状态", items: bars(statusRows), emptyText: "当前范围内暂无询盘。" }, { title: "询盘语言", items: bars(leadLocaleRows), emptyText: "当前范围内暂无询盘。" }, { title: "来源渠道", items: bars(channelRows), emptyText: "当前范围内暂无来源数据。" }];
    table = { title: "询盘收件箱", columns: ["编号", "状态", "语言", "产品", "来源页面", "提交时间"], rows: rows.map((row) => [row.id.slice(0, 8), row.lead_status, row.attribution?.locale || "—", row.attribution?.product_name || "—", row.attribution?.source || "—", dateTime(row.created_at)]), emptyText: "当前范围内尚未收到询盘。" };
  } else if (area === "seo") {
    const rows = await sql<{ url: string; clicks: number | null; impressions: number | null; average_position: number | null; metric_date: string }[]>`select url, clicks, impressions, average_position, metric_date from seo_metrics where site_id = ${siteId} and metric_date >= ${startDate} order by metric_date desc, impressions desc nulls last limit 50`;
    const seoPages = await sql<{ label: string; value: number }[]>`select url as label, coalesce(sum(impressions), 0)::int as value from seo_metrics where site_id = ${siteId} and metric_date >= ${startDate} group by url order by value desc limit 6`;
    breakdowns = [{ title: "搜索展示页面", items: bars(seoPages), emptyText: "尚未同步 Search Console 数据。" }, { title: "站内页面访问", items: bars(pageRows), emptyText: "当前范围内暂无页面访问。" }, { title: "链接审计", items: [{ label: "待复查", value: linkIssues }], emptyText: "尚未运行链接审计。" }];
    table = { title: "Search Console 页面表现", columns: ["页面", "点击", "展示", "平均排名", "日期"], rows: rows.map((row) => [row.url, String(row.clicks ?? 0), String(row.impressions ?? 0), row.average_position == null ? "—" : Number(row.average_position).toFixed(1), dateOnly(row.metric_date)]), emptyText: "尚未同步到 Search Console 数据。" };
  } else if (area === "links") {
    const rows = await sql<{ source_url: string; target_url: string | null; http_status: number | null; severity: string; status: string; last_checked_at: string }[]>`select source_url, target_url, http_status, severity, status, last_checked_at from link_audits where site_id = ${siteId} order by last_checked_at desc limit 50`;
    const severityRows = await sql<{ label: string; value: number }[]>`select severity as label, count(*)::int as value from link_audits where site_id = ${siteId} group by severity order by value desc`;
    const typeRows = await sql<{ label: string; value: number }[]>`select link_type as label, count(*)::int as value from link_audits where site_id = ${siteId} group by link_type order by value desc`;
    breakdowns = [{ title: "问题优先级", items: bars(severityRows), emptyText: "尚未运行链接审计。" }, { title: "链接类型", items: bars(typeRows), emptyText: "尚未运行链接审计。" }, { title: "访问页面", items: bars(pageRows), emptyText: "当前范围内暂无页面访问。" }];
    table = { title: "链接审计结果", columns: ["来源页面", "目标", "HTTP", "优先级", "状态", "检查时间"], rows: rows.map((row) => [row.source_url, row.target_url || "—", String(row.http_status ?? "—"), row.severity, row.status, dateTime(row.last_checked_at)]), emptyText: "尚未运行链接审计。" };
  } else if (area === "visitors" || area === "traffic") {
    const rows = await sql<{ landing_path: string | null; channel: string | null; device_class: string | null; locale: string | null; event_count: number; started_at: string }[]>`select landing_path, channel, device_class, locale, event_count, started_at from visitor_sessions where site_id = ${siteId} and started_at >= ${start} order by started_at desc limit 50`;
    table = { title: area === "traffic" ? "来源与设备会话" : "匿名访问会话", columns: ["入口页面", "来源", "设备", "语言", "事件", "开始时间"], rows: rows.map((row) => [row.landing_path || "—", row.channel || "direct", row.device_class || "—", row.locale || "—", String(row.event_count), dateTime(row.started_at)]), emptyText: "当前范围内暂无访问记录；公开页面访问后会自动开始记录。" };
  } else if (area === "page-performance") {
    const rows = await sql<{ path: string; page_views: number | null; conversions: number | null; unique_visitors: number | null; metric_date: string }[]>`
      select metrics.path, sum(metrics.page_views)::int as page_views, sum(metrics.conversions)::int as conversions,
        coalesce(events.unique_visitors, 0)::int as unique_visitors, max(metrics.metric_date)::text as metric_date
      from page_metrics metrics
      left join (
        select allowed_properties->>'path' as path, count(distinct anonymous_session_id)::int as unique_visitors
        from analytics_events where site_id = ${siteId} and occurred_at >= ${start}
        group by allowed_properties->>'path'
      ) events on events.path = metrics.path
      where metrics.site_id = ${siteId} and metrics.metric_date >= ${startDate}
      group by metrics.path, events.unique_visitors order by sum(metrics.page_views) desc nulls last limit 50`;
    breakdowns = [{ title: "页面浏览排行", items: bars(pageRows), emptyText: "当前范围内暂无页面访问。" }, { title: "来源渠道", items: bars(channelRows), emptyText: "当前范围内暂无来源数据。" }, { title: "访问语言", items: bars(localeRows), emptyText: "当前范围内暂无语言数据。" }];
    table = { title: "落地页数据表现", columns: ["页面", "浏览", "访客", "转化", "最近记录"], rows: rows.map((row) => [row.path, String(row.page_views ?? 0), String(row.unique_visitors ?? 0), String(row.conversions ?? 0), dateOnly(row.metric_date)]), emptyText: "当前范围内暂无页面访问数据。" };
  } else if (area === "paths") {
    const rows = await sql<{ landing_path: string | null; exit_path: string | null; sessions: number; events: number }[]>`select landing_path, exit_path, count(*)::int as sessions, coalesce(sum(event_count), 0)::int as events from visitor_sessions where site_id = ${siteId} and started_at >= ${start} group by landing_path, exit_path order by sessions desc limit 50`;
    breakdowns = [{ title: "入口页面", items: bars(pageRows), emptyText: "当前范围内暂无访问数据。" }, { title: "来源渠道", items: bars(channelRows), emptyText: "当前范围内暂无来源数据。" }, { title: "访问设备", items: bars(deviceRows), emptyText: "当前范围内暂无设备数据。" }];
    table = { title: "访问路径", columns: ["入口页面", "最后页面", "会话", "事件数"], rows: rows.map((row) => [row.landing_path || "—", row.exit_path || "—", String(row.sessions), String(row.events)]), emptyText: "当前范围内暂无路径数据。" };
  } else if (area === "settings") {
    const rows = await sql<{ setting_key: string; updated_at: string }[]>`select setting_key, updated_at from site_settings where site_id = ${siteId} order by updated_at desc limit 50`;
    breakdowns = [{ title: "连接状态", items: [{ label: "数据库", value: 1 }, { label: "Search Console", value: lastSync[0]?.updated_at ? 1 : 0 }], emptyText: "暂无已保存设置。" }, { title: "站点数据", items: [{ label: "产品", value: products }, { label: "内容", value: content + publishedNews }, { label: "询盘", value: leads }], emptyText: "暂无站点数据。" }, { title: "待处理项目", items: [{ label: "任务", value: pendingJobs }, { label: "链接", value: linkIssues }], emptyText: "暂无待处理项目。" }];
    table = { title: "已保存的站点设置", columns: ["设置项", "更新时间"], rows: rows.map((row) => [row.setting_key, dateTime(row.updated_at)]), emptyText: "当前没有可展示的站点设置记录。" };
  } else {
    const rows = await sql<{ status: string; target_type: string; action: string; created_at: string }[]>`select 'recorded' as status, target_type, action, created_at from audit_logs where site_id = ${siteId} order by created_at desc limit 50`;
    breakdowns = [{ title: "来源渠道", items: bars(channelRows), emptyText: "当前范围内暂无来源数据。" }, { title: "访问设备", items: bars(deviceRows), emptyText: "当前范围内暂无设备数据。" }, { title: "页面浏览排行", items: bars(pageRows), emptyText: "当前范围内暂无页面访问。" }];
    table = { title: "最近后台操作", columns: ["状态", "对象", "操作", "时间"], rows: rows.map((row) => [row.status, row.target_type, row.action, dateTime(row.created_at)]), emptyText: "尚无后台操作记录。" };
  }

  return { connected: true, lastSynced: lastSync[0]?.updated_at ?? null, rangeDays, metrics: metricSets[area] ?? commonMetrics, trend: trendRows, breakdowns, table };
}

export async function writeAdminAudit(siteId: string, actorId: string, action: string, targetType: string, targetId: string | null, reason: string) {
  if (!sql) throw new Error("admin_store_not_configured");
  await sql`insert into audit_logs (id, site_id, actor_id, action, target_type, target_id, reason) values (${crypto.randomUUID()}, ${siteId}, ${actorId === "bootstrap-admin" ? null : actorId}, ${action}, ${targetType}, ${targetId}, ${reason})`;
}

export async function writeAdminJob(siteId: string, kind: string, idempotencyKey: string, payload: Record<string, unknown>) {
  if (!sql) throw new Error("admin_store_not_configured");
  await sql`insert into admin_jobs (id, site_id, kind, idempotency_key, status, payload, result) values (${crypto.randomUUID()}, ${siteId}, ${kind}, ${idempotencyKey}, 'queued', ${sql.json(payload as never)}, '{}'::jsonb) on conflict (site_id, idempotency_key) do update set status = 'queued', payload = excluded.payload`;
}

export async function reserveInquiryRateLimit(siteId: string, idempotencyKey: string) {
  if (!sql) throw new Error("admin_store_not_configured");
  const rows = await sql<{ id: string }[]>`insert into admin_jobs (id, site_id, kind, idempotency_key, status, payload, result) values (${crypto.randomUUID()}, ${siteId}, 'inquiry_rate_limit', ${idempotencyKey}, 'succeeded', '{}'::jsonb, '{}'::jsonb) on conflict (site_id, idempotency_key) do nothing returning id`;
  return rows.length === 1;
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
