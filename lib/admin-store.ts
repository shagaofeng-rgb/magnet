import "server-only";

import postgres from "postgres";

const cleanUrl = (value: string | undefined) => value?.trim().replace(/^(['"])(.*)\1$/, "$2") || undefined;
const databaseUrl = [process.env.ADMIN_DATABASE_URL, process.env.NEWS_DATABASE_URL, process.env.POSTGRES_URL, process.env.DATABASE_URL].map(cleanUrl).find(Boolean);
const sql = databaseUrl ? postgres(databaseUrl, { prepare: false, max: 4, idle_timeout: 10, connect_timeout: 10 }) : null;

export type AdminMetric = { label: string; value: string; source: string; detail: string; href: string };
export type AdminQueueItem = { status: string; item: string; evidence: string; next: string; severity?: string };
export type AdminModuleData = { metrics: AdminMetric[]; queue: AdminQueueItem[]; connected: boolean; lastSynced: string | null };

const pageHref = (area: string) => `/admin/bzmagnet/${area}`;
const count = async (query: () => Promise<Array<{ count: string }>>) => Number((await query())[0]?.count ?? 0);

export function isAdminStoreConfigured() { return Boolean(sql); }

export async function getAdminModuleData(siteId: string, area: string): Promise<AdminModuleData> {
  if (!sql) return { connected: false, lastSynced: null, metrics: [{ label: "数据连接", value: "未连接", source: "站点配置", detail: "数据库未配置，未展示演示指标。", href: pageHref("settings") }], queue: [{ status: "未连接", item: "运营数据", evidence: "等待站点级数据库连接", next: "前往系统设置配置" }] };

  const [products, content, leads, candidates, publishedNews, audits, sessions, pageRows, seoRows, linkRows, jobs] = await Promise.all([
    count(() => sql<{ count: string }[]>`select count(*)::text as count from catalog_records where site_id = ${siteId} and status = 'published'`),
    count(() => sql<{ count: string }[]>`select count(*)::text as count from content_records where site_id = ${siteId} and status = 'published'`),
    count(() => sql<{ count: string }[]>`select count(*)::text as count from form_leads where site_id = ${siteId}`),
    count(() => sql<{ count: string }[]>`select count(*)::text as count from news_candidates where site_id = ${siteId} and status in ('needs_review','failed')`),
    count(() => sql<{ count: string }[]>`select count(*)::text as count from news_articles where site_id = ${siteId} and status = 'published'`),
    count(() => sql<{ count: string }[]>`select count(*)::text as count from audit_logs where site_id = ${siteId}`),
    count(() => sql<{ count: string }[]>`select count(*)::text as count from visitor_sessions where site_id = ${siteId}`),
    count(() => sql<{ count: string }[]>`select count(*)::text as count from page_metrics where site_id = ${siteId}`),
    count(() => sql<{ count: string }[]>`select count(*)::text as count from seo_metrics where site_id = ${siteId}`),
    count(() => sql<{ count: string }[]>`select count(*)::text as count from link_audits where site_id = ${siteId} and status in ('open','recheck')`),
    count(() => sql<{ count: string }[]>`select count(*)::text as count from admin_jobs where site_id = ${siteId} and status in ('queued','running','failed')`),
  ]);
  const lastRun = await sql<{ finished_at: string | null }[]>`select finished_at from news_runs where site_id = ${siteId} order by finished_at desc nulls last limit 1`;
  const lastSynced = lastRun[0]?.finished_at ?? null;
  const overview: AdminMetric[] = [
    { label: "产品记录", value: String(products), source: "目录数据库", detail: "已发布产品记录", href: pageHref("products") },
    { label: "已发布内容", value: String(content + publishedNews), source: "内容数据库", detail: "News 与手工内容", href: pageHref("news") },
    { label: "询盘提交", value: String(leads), source: "内部表单", detail: "加密存储的线索", href: pageHref("forms") },
    { label: "待处理异常", value: String(candidates + linkRows + jobs), source: "任务与审计", detail: "需人工查看", href: pageHref("news-operations") },
  ];
  const byArea: Record<string, AdminMetric[]> = {
    overview,
    traffic: [{ label: "匿名会话", value: String(sessions), source: "内部事件库", detail: "未保存完整 IP", href: pageHref("visitors") }, { label: "页面指标", value: String(pageRows), source: "内部事件库", detail: "尚无数据时显示为 0", href: pageHref("page-performance") }],
    seo: [{ label: "搜索指标", value: String(seoRows), source: "站点数据库", detail: "未接入 Search Console", href: pageHref("settings") }, { label: "链接问题", value: String(linkRows), source: "链接审计", detail: "待复检记录", href: pageHref("links") }],
    products: [{ label: "已发布产品", value: String(products), source: "目录数据库", detail: "仅显示已审批记录", href: pageHref("products") }, { label: "审计事件", value: String(audits), source: "审计日志", detail: "发布、导入与回滚均留痕", href: pageHref("settings") }],
    news: [{ label: "已发布 News", value: String(publishedNews), source: "News 数据库", detail: "仅显示真实已发布内容", href: pageHref("news") }, { label: "待审核候选", value: String(candidates), source: "News 队列", detail: "无来源时不会自动生成", href: pageHref("news-operations") }],
    "news-operations": [{ label: "运行队列", value: String(jobs), source: "后台任务", detail: "内部模式不会调用外部服务", href: pageHref("news-operations") }, { label: "待人工审核", value: String(candidates), source: "News 队列", detail: "失败安全保留原因", href: pageHref("news") }],
    forms: [{ label: "询盘", value: String(leads), source: "Neon 加密存储", detail: "客户字段仅限授权角色读取", href: pageHref("forms") }, { label: "匿名会话", value: String(sessions), source: "隐私优先事件", detail: "同意后才关联线索", href: pageHref("visitors") }],
    links: [{ label: "待修复链接", value: String(linkRows), source: "链接审计", detail: "无审计数据时为 0", href: pageHref("links") }, { label: "页面记录", value: String(pageRows), source: "页面指标", detail: "用于孤儿页与路径检查", href: pageHref("page-performance") }],
    visitors: [{ label: "匿名会话", value: String(sessions), source: "内部事件库", detail: "粗粒度、可清理", href: pageHref("visitors") }, { label: "询盘", value: String(leads), source: "表单库", detail: "仅同意后关联", href: pageHref("forms") }],
    "page-performance": [{ label: "页面指标", value: String(pageRows), source: "内部事件库", detail: "CWV 未连接时不虚构", href: pageHref("page-performance") }, { label: "SEO 指标", value: String(seoRows), source: "站点数据库", detail: "等待人工导入或连接", href: pageHref("seo") }],
    paths: [{ label: "匿名会话", value: String(sessions), source: "内部事件库", detail: "达到最小样本后显示路径", href: pageHref("paths") }, { label: "页面指标", value: String(pageRows), source: "内部事件库", detail: "不呈现可识别个人行为", href: pageHref("page-performance") }],
    settings: [{ label: "审计事件", value: String(audits), source: "审计日志", detail: "站点隔离与权限操作", href: pageHref("settings") }, { label: "未完成任务", value: String(jobs), source: "任务队列", detail: "配置不完整不会伪装为成功", href: pageHref("settings") }],
  };
  const queue = await sql<{ status: string; target_type: string; action: string; created_at: string }[]>`select coalesce(status, 'recorded') as status, target_type, action, created_at from audit_logs where site_id = ${siteId} order by created_at desc limit 8`;
  return { connected: true, lastSynced, metrics: byArea[area] ?? overview, queue: queue.length ? queue.map((item) => ({ status: item.status, item: `${item.target_type}: ${item.action}`, evidence: `审计时间 ${new Date(item.created_at).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}`, next: "查看并按权限处理" })) : [{ status: "暂无数据", item: "尚无已记录的运营事件", evidence: "数据库已连接，未生成演示数据", next: "通过后台受限操作开始记录" }] };
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
