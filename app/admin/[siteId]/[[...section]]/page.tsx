import Link from "next/link";
import { notFound } from "next/navigation";
import { IconActivity, IconChartBar, IconInfoCircle } from "@tabler/icons-react";
import { adminModules, requireAdmin, sites } from "@/lib/admin-console";
import { logout, syncSearchConsole, validateNewsSources } from "@/lib/admin-actions";
import { getAdminModuleData } from "@/lib/admin-store";
import { getAnalyticsDashboard, type AnalyticsArea, type AnalyticsFilters } from "@/lib/admin-analytics";
import { AdminSidebar } from "@/app/admin/AdminSidebar";
import { AdminDateFields } from "@/app/admin/AdminDateFields";

type Params = { siteId: string; section?: string[] };
type Search = Record<string, string | string[] | undefined>;
const analyticsAreas = new Set<AnalyticsArea>(["overview", "traffic", "visitors", "page-performance", "paths"]);
const copy: Record<string, { title: string; description: string }> = {
  overview: { title: "数据总览", description: "仅展示经过质量筛选的第一方访问、询盘与内容运行数据。" },
  traffic: { title: "流量分析", description: "按真实来源、国家、设备、语言与入口页面分析访问。" },
  seo: { title: "SEO 数据", description: "查看已同步的搜索表现与技术 SEO 数据。" },
  products: { title: "产品管理", description: "管理产品目录、多语言内容与发布状态。" },
  news: { title: "新闻管理", description: "管理新闻、文章、来源与发布状态。" },
  "news-operations": { title: "News 运营", description: "查看来源验证、任务队列与运行状态。" },
  forms: { title: "客户表单", description: "查看已经安全保存的询盘与来源上下文。" },
  links: { title: "内外链审计", description: "查看链接检查结果、异常与复检任务。" },
  visitors: { title: "访客记录", description: "匿名会话和路径明细；运营界面不展示原始 IP。" },
  "page-performance": { title: "页面表现", description: "对比页面浏览、独立访客、询盘转化与内容表现。" },
  paths: { title: "访问路径", description: "查看真实访问从入口到退出的匿名路径。" },
  settings: { title: "系统设置", description: "查看站点连接与已保存的运营设置。" },
};
const number = new Intl.NumberFormat("zh-CN");
const displayTime = (value: string | null, timeZone: string) => value ? new Date(value).toLocaleString("zh-CN", { timeZone, hour12: false }) : "尚无有效事件";

function PageControl({ disabled, href, children }: { disabled: boolean; href: string; children: React.ReactNode }) {
  return disabled ? <span className="admin-page-disabled" aria-disabled="true">{children}</span> : <Link href={href}>{children}</Link>;
}

function compactBars({ title, items }: { title: string; items: Array<{ label: string; value: number }> }) {
  const high = Math.max(...items.map((item) => item.value), 1);
  return <section className="admin-panel"><h2>{title}</h2>{items.length ? <div className="admin-breakdown-list">{items.map((item) => <div key={item.label}><div><span>{item.label}</span><strong>{number.format(item.value)}</strong></div><i><b style={{ width: String(Math.max((item.value / high) * 100, 2)).concat("%") }} /></i></div>)}</div> : <p className="admin-empty">当前范围暂无真实数据。</p>}</section>;
}

function AnalyticsWorkspace({ area, data, route }: { area: AnalyticsArea; data: Awaited<ReturnType<typeof getAnalyticsDashboard>>; route: string }) {
  const params = new URLSearchParams();
  params.set("range", data.filters.range || "today"); params.set("from", data.from); params.set("to", data.to); params.set("traffic", data.filters.traffic);
  if (data.filters.channel) params.set("channel", data.filters.channel);
  if (data.filters.country) params.set("country", data.filters.country);
  if (data.filters.search) params.set("search", data.filters.search);
  if (data.filters.visitor) params.set("visitor", data.filters.visitor);
  if (data.filters.session) params.set("session", data.filters.session);
  params.set("pageSize", String(data.filters.pageSize));
  const url = (changes: Record<string, string | number | undefined>) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([key, value]) => value === undefined || value === "" ? next.delete(key) : next.set(key, String(value)));
    return String(route).concat("?").concat(next.toString());
  };
  const isVisitorView = area === "visitors";
  const journey = data.visitorJourney;
  const activeTotal = isVisitorView ? data.profileTotalRows : data.totalRows;
  const totalPages = Math.max(1, Math.ceil(activeTotal / data.filters.pageSize));
  const maxTrend = Math.max(...data.trend.map((point) => point.views), 1);
  const rangeButtons = [["today", "今天"], ["week", "本周"], ["month", "本月"], ["90d", "90 天"], ["custom", "自定义"]] as const;
  return <>
    <section className={String("admin-sync ").concat(data.connected ? "ready" : data.error ? "error" : "")}><IconActivity size={20} aria-hidden="true" />{data.connected ? <>第一方数据已连接 <small>最近有效事件：{displayTime(data.lastEventAt, "Asia/Shanghai")} · 默认排除测试、自动化及预览流量</small></> : data.error ? <>数据查询失败 <small>暂时无法读取真实数据，请稍后重试。</small></> : <>分析数据库尚未连接 <small>请检查数据库连接配置。</small></>}</section>
    <form className="admin-filter-panel" method="get">
      <AdminDateFields range={data.filters.range || "today"} from={data.from} to={data.to} />
      <label>流量口径<select name="traffic" defaultValue={data.filters.traffic}><option value="valid">仅真实流量</option><option value="all">全部（含隔离）</option><option value="excluded">仅隔离流量</option></select></label>
      <label>渠道<input name="channel" defaultValue={data.filters.channel} placeholder="例如 organic" /></label>
      <label>国家/地区<input name="country" defaultValue={data.filters.country} placeholder="例如 US" maxLength={2} /></label>
      <label className="admin-filter-search">页面、来源或 UTM<input name="search" defaultValue={data.filters.search} placeholder="/en/ 或来源域名" /></label>
      <input type="hidden" name="pageSize" value={data.filters.pageSize} />
      <button type="submit">应用筛选</button><Link href={route}>重置</Link>
    </form>
    <div className="admin-quick-range" aria-label="快捷时间范围">{rangeButtons.map(([range, label]) => <Link key={range} className={data.filters.range === range ? "active" : ""} href={url({ range, from: undefined, to: undefined, page: 1, visitor: undefined, session: undefined })}>{label}</Link>)}</div>
    <p className="admin-data-note admin-filter-note">指标、趋势与分布按时间范围汇总；渠道、国家和关键词用于下方会话明细。默认指标只计有效访问。</p>
    <section className="admin-metrics admin-metrics-dense">
      {[[ "页面浏览", data.totals.views, "有效第一方事件" ], [ "独立访客", data.totals.visitors, "以匿名访客 ID 去重" ], [ "有效会话", data.totals.sessions, "当前范围" ], [ "回访会话", data.totals.returning, "同一匿名访客再次访问" ], [ "已保存询盘", data.totals.leads, "以数据库入库记录计数" ], [ "已隔离流量", data.totals.excluded, "不进入正式访问指标" ]].map(([label, value, detail]) => <article key={String(label)}><small>{label}</small><strong>{data.connected ? number.format(Number(value)) : "—"}</strong><em>{detail}</em></article>)}
    </section>
    <section className="admin-panel admin-trend-panel"><div className="admin-section-heading"><h2><IconChartBar size={20} aria-hidden="true" />有效流量趋势</h2><small>{data.from} 至 {data.to} · 按日页面浏览</small></div>{data.trend.length ? <div className="admin-bar-chart" role="img" aria-label={`从 ${data.from} 至 ${data.to} 的有效页面浏览趋势；共 ${number.format(data.totals.views)} 次页面浏览`}>{data.trend.map((point) => <div className="admin-bar-group" key={point.label}><div className="admin-bars"><span style={{ height: String(Math.max((point.views / maxTrend) * 100, 2)).concat("%") }} title={String(point.label).concat(" ").concat(String(point.views))} /></div><small>{point.label}</small></div>)}</div> : <p className="admin-empty">{data.connected ? "当前时间范围暂无有效访问。" : "数据连接恢复后显示真实趋势。"}</p>}</section>
    <div className="admin-breakdown-grid">{compactBars({ title: "来源渠道", items: data.channels })}{compactBars({ title: "访问国家/地区", items: data.countries })}{compactBars({ title: "访问设备", items: data.devices })}</div>
    {(area === "overview" || area === "page-performance") ? <section className="admin-panel admin-table"><h2>页面表现</h2><div className="admin-table-scroll"><table><thead><tr><th>页面</th><th>浏览</th><th>访客</th><th>表单提交事件</th></tr></thead><tbody>{data.pages.map((item) => <tr key={item.path}><td>{item.path}</td><td>{number.format(item.views)}</td><td>{number.format(item.visitors)}</td><td>{number.format(item.leads)}</td></tr>)}</tbody></table></div>{!data.pages.length ? <p className="admin-empty">当前范围内暂无有效页面数据。</p> : <p className="admin-data-note">表单提交事件源于站点追踪；已保存询盘以客户表单数据为准。</p>}</section> : null}
    <section className="admin-panel admin-table"><div className="admin-table-heading"><div><h2>{isVisitorView ? "匿名访客归属" : area === "paths" ? "访问路径会话" : "真实来源会话"}</h2><p>显示 {activeTotal ? (data.filters.page - 1) * data.filters.pageSize + 1 : 0}–{Math.min(data.filters.page * data.filters.pageSize, activeTotal)} / {activeTotal} 条</p></div><span className="admin-page-size-label">每页 25 / 50 / 100 条</span></div>
      <div className="admin-table-scroll">{isVisitorView ? <table><thead><tr><th>匿名访客</th><th>访问次数</th><th>首次 / 最近访问</th><th>国家</th><th>最近来源</th><th>入口 → 退出</th><th>设备 / 语言</th><th>事件</th><th>详情</th></tr></thead><tbody>{data.profiles.map((row) => <tr key={row.visitorKey}><td>{row.visitor}<small>受保护匿名标识</small></td><td>{row.visits}<small>其中回访 {row.returningVisits}</small></td><td>{row.firstSeen}<small>{row.lastSeen}</small></td><td>{row.country}</td><td>{row.channel}<small>{row.source}</small></td><td>{row.landing}<small>{row.exit}</small></td><td>{row.device}<small>{row.locale}</small></td><td>{row.events}</td><td><Link className="admin-detail-link" href={url({ visitor: row.visitorKey, session: undefined })}>查看全部路径</Link></td></tr>)}</tbody></table> : <table><thead><tr><th>匿名访客</th><th>第几次访问</th><th>国家</th><th>渠道 / 来源</th><th>入口 → 退出</th><th>设备 / 语言</th><th>事件</th><th>时间</th><th>路径</th></tr></thead><tbody>{data.visitors.map((row) => <tr key={row.id}><td>{row.visitor}<small>{row.returning ? "回访" : "首次"}</small></td><td>{row.visitNumber || "历史记录"}</td><td>{row.country}</td><td>{row.channel}<small>{row.source}</small></td><td>{row.landing}<small>{row.exit}</small></td><td>{row.device}<small>{row.locale}</small></td><td>{row.events}</td><td>{row.startedAt}</td><td><details><summary>查看</summary><span>{row.pathSummary}</span>{row.trafficClass !== "valid" ? <small>已隔离：{row.excludedReason || row.trafficClass}</small> : null}</details></td></tr>)}</tbody></table>}</div>
      {!(isVisitorView ? data.profiles.length : data.visitors.length) ? <p className="admin-empty">此筛选条件下暂无记录。</p> : null}
      <nav className="admin-pagination" aria-label="列表分页"><PageControl disabled={data.filters.page <= 1} href={url({ page: Math.max(1, data.filters.page - 1) })}>上一页</PageControl><span>第 {data.filters.page} / {totalPages} 页</span><PageControl disabled={data.filters.page >= totalPages} href={url({ page: Math.min(totalPages, data.filters.page + 1) })}>下一页</PageControl>{[25, 50, 100].map((size) => <Link key={size} className={size === data.filters.pageSize ? "active" : ""} href={url({ page: 1, pageSize: size })}>{size}/页</Link>)}</nav>
    </section>
    {journey ? <section className="admin-panel admin-journey"><div className="admin-table-heading"><div><h2>访客访问详情</h2><p>匿名访客 {journey.visitor.visitor} · 全部已记录的有效访问</p></div><Link href={url({ visitor: undefined, session: undefined })}>关闭详情</Link></div><div className="admin-journey-summary"><span>访问 {journey.visitor.visits} 次</span><span>事件 {journey.visitor.events} 次</span><span>{journey.visitor.country}</span><span>{journey.visitor.channel}</span></div><h3>访问会话</h3><ol className="admin-session-list">{journey.sessions.map((row) => <li key={row.id}><div><strong>第 {row.visitNumber || "—"} 次访问</strong><span>{row.startedAt} · {row.channel} · {row.country}</span></div><p>{row.pathSummary}</p><Link href={url({ visitor: journey.visitor.visitorKey, session: row.id })}>查看该次事件</Link></li>)}</ol><h3>完整事件路径</h3><ol className="admin-event-list">{journey.events.map((event, index) => <li key={String(event.at).concat(String(index))}><strong>{event.event}</strong><span>{event.path}</span><time>{event.at}</time></li>)}</ol></section> : null}
    {data.timeline.length ? <section className="admin-panel"><h2>选中会话事件</h2><ol className="admin-event-list">{data.timeline.map((event, index) => <li key={String(event.at).concat(String(index))}><strong>{event.event}</strong><span>{event.path}</span><time>{event.at}</time></li>)}</ol></section> : null}
  </>;
}

export default async function AdminModulePage({ params, searchParams }: { params: Promise<Params>; searchParams: Promise<Search> }) {
  const { siteId, section = ["overview"] } = await params;
  const search = await searchParams;
  const site = sites.find((item) => item.id === siteId);
  if (!site) notFound();
  const session = await requireAdmin(siteId);
  const area = adminModules.find((item) => item[0] === section[0]) || adminModules[0];
  const title = copy[area[0]] || copy.overview;
  const route = String("/admin/").concat(siteId).concat("/").concat(area[0]);
  const isAnalytics = analyticsAreas.has(area[0] as AnalyticsArea);
  const defaultRange = isAnalytics ? "month" : "90d";
  const filters: AnalyticsFilters = {
    range: search.range === "today" || search.range === "week" || search.range === "month" || search.range === "90d" || search.range === "custom" ? search.range : defaultRange,
    from: typeof search.from === "string" ? search.from : undefined, to: typeof search.to === "string" ? search.to : undefined,
    channel: typeof search.channel === "string" ? search.channel : undefined, country: typeof search.country === "string" ? search.country : undefined,
    traffic: search.traffic === "all" || search.traffic === "excluded" ? search.traffic : "valid",
    search: typeof search.search === "string" ? search.search : undefined, page: Number(search.page) || 1, pageSize: Number(search.pageSize) || 25,
    session: typeof search.session === "string" ? search.session : undefined,
    visitor: typeof search.visitor === "string" ? search.visitor : undefined,
  };
  const [analytics, legacy] = await Promise.all([isAnalytics ? getAnalyticsDashboard(filters) : Promise.resolve(null), isAnalytics ? Promise.resolve(null) : getAdminModuleData(siteId, area[0], { range: filters.range, from: filters.from, to: filters.to, search: filters.search, page: filters.page, pageSize: filters.pageSize })]);
  const canConfigure = session.role === "super_admin" || session.role === "site_admin";
  const legacyUrl = (changes: Record<string, string | number | undefined>) => {
    const query = new URLSearchParams();
    query.set("range", filters.range || "today");
    if (filters.from) query.set("from", filters.from);
    if (filters.to) query.set("to", filters.to);
    if (filters.search) query.set("search", filters.search);
    query.set("pageSize", String(filters.pageSize));
    Object.entries(changes).forEach(([key, value]) => value === undefined || value === "" ? query.delete(key) : query.set(key, String(value)));
    return String(route).concat("?").concat(query.toString());
  };

  return <div className="admin-console">
    <AdminSidebar siteId={siteId} area={area[0]} email={session.email} modules={adminModules.map(([slug, label]) => [slug, label] as const)} logoutAction={logout} />
    <main className="admin-main">
      <header className="admin-page-head"><div><p className="admin-eyebrow">BZMAGNET / {site.name}</p><h1>{title.title}</h1><p>{title.description}</p></div><div className="admin-live-state"><IconInfoCircle size={17} aria-hidden="true" />时区：{site.timezone}</div></header>
      {analytics ? <AnalyticsWorkspace area={area[0] as AnalyticsArea} data={analytics} route={route} /> : legacy ? <>
        <section className={String("admin-sync ").concat(legacy.connected ? "ready" : "")}><IconActivity size={20} aria-hidden="true" />{legacy.connected ? <>站点数据已连接 <small>筛选范围：{legacy.from} 至 {legacy.to}{area[0] === "seo" ? ` · 最近同步：${displayTime(legacy.lastSynced, site.timezone)} · 最新搜索数据：${legacy.lastDataAt || "暂无"}` : ""}</small></> : <>数据库尚未连接 <small>请检查数据库连接配置。</small></>}</section>
        <form className="admin-filter-panel" method="get">
          <AdminDateFields range={filters.range || "today"} from={legacy.from} to={legacy.to} />
          <label className="admin-filter-search">搜索<input name="search" defaultValue={filters.search} placeholder={area[0] === "seo" ? "页面 URL" : area[0] === "forms" ? "编号、产品或来源" : "名称、URL 或设置项"} /></label>
          <label>每页条数<select name="pageSize" defaultValue={String(legacy.pageSize)}><option value="25">25 条</option><option value="50">50 条</option><option value="100">100 条</option></select></label>
          <input type="hidden" name="page" value="1" />
          <button type="submit">应用筛选</button><Link href={route}>重置</Link>
        </form>
        <div className="admin-quick-range" aria-label="快捷时间范围">{([["today", "今天"], ["week", "本周"], ["month", "本月"], ["90d", "90 天"], ["custom", "自定义"]] as const).map(([range, label]) => <Link key={range} className={filters.range === range ? "active" : ""} href={legacyUrl({ range, from: undefined, to: undefined, page: 1 })}>{label}</Link>)}</div>
        {canConfigure && area[0] === "seo" ? <section className="admin-action"><div><strong>Google Search Console</strong><span>{legacy.connected ? "同步后更新当前站点的搜索表现。" : "数据库连接恢复后可同步搜索数据。"}</span></div><form action={syncSearchConsole}><input type="hidden" name="siteId" value={siteId} /><button type="submit" disabled={!legacy.connected}>同步搜索数据</button></form></section> : null}
        {canConfigure && area[0] === "news-operations" ? <section className="admin-action"><div><strong>来源目录核验</strong><span>只检查待核验来源状态，不发布内容。</span></div><form action={validateNewsSources}><input type="hidden" name="siteId" value={siteId} /><button type="submit" disabled={!legacy.connected}>核验下一批来源</button></form></section> : null}
        <section className="admin-metrics admin-metrics-dense">{legacy.metrics.map((metric) => <Link key={metric.label} href={metric.href}><article><small>{metric.label}</small><strong>{metric.value}</strong>{metric.detail ? <em>{metric.detail}</em> : null}</article></Link>)}</section>
        {area[0] === "seo" ? <section className="admin-panel admin-trend-panel"><div className="admin-section-heading"><h2><IconChartBar size={20} aria-hidden="true" />搜索表现趋势</h2><small>{legacy.from} 至 {legacy.to} · Google Search Console</small></div>{legacy.trend.length ? <div className="admin-bar-chart" role="img" aria-label={`从 ${legacy.from} 至 ${legacy.to} 的 Search Console 每日点击趋势`}>{legacy.trend.map((point) => <div className="admin-bar-group" key={point.label}><div className="admin-bars"><span style={{ height: `${Math.max((point.value / Math.max(...legacy.trend.map((item) => item.value), 1)) * 100, 2)}%` }} title={`${point.label}：${point.value} 次点击、${point.secondary || 0} 次展示`} /></div><small>{point.label}</small></div>)}</div> : <p className="admin-empty">当前范围暂无已同步的 Search Console 数据。</p>}</section> : null}
        <div className="admin-breakdown-grid">{legacy.breakdowns.map((breakdown) => compactBars({ title: breakdown.title, items: breakdown.items }))}</div>
        <section className="admin-panel admin-table"><div className="admin-table-heading"><div><h2>{legacy.table.title}</h2><p>显示 {legacy.totalRows ? (legacy.page - 1) * legacy.pageSize + 1 : 0}–{Math.min(legacy.page * legacy.pageSize, legacy.totalRows)} / {legacy.totalRows} 条</p></div><span className="admin-page-size-label">固定每页 {legacy.pageSize} 条</span></div><div className="admin-table-scroll"><table><thead><tr>{legacy.table.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{legacy.table.rows.map((row, index) => <tr key={String(index)}>{row.map((cell, cellIndex) => <td key={String(cellIndex)}>{cell}</td>)}</tr>)}</tbody></table></div>{!legacy.table.rows.length ? <p className="admin-empty">{legacy.table.emptyText}</p> : null}<nav className="admin-pagination" aria-label="后台列表分页"><PageControl disabled={legacy.page <= 1} href={legacyUrl({ page: Math.max(1, legacy.page - 1) })}>上一页</PageControl><span>第 {legacy.page} / {Math.max(1, Math.ceil(legacy.totalRows / legacy.pageSize))} 页</span><PageControl disabled={legacy.page >= Math.max(1, Math.ceil(legacy.totalRows / legacy.pageSize))} href={legacyUrl({ page: legacy.page + 1 })}>下一页</PageControl>{[25, 50, 100].map((size) => <Link key={size} className={size === legacy.pageSize ? "active" : ""} href={legacyUrl({ page: 1, pageSize: size })}>{size}/页</Link>)}</nav></section>
      </> : null}
    </main>
  </div>;
}
