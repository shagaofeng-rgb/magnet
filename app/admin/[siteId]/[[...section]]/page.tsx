import Link from "next/link";
import { notFound } from "next/navigation";
import { adminModules, requireAdmin, sites } from "@/lib/admin-console";
import { logout, syncSearchConsole, validateNewsSources } from "@/lib/admin-actions";
import { getAdminModuleData } from "@/lib/admin-store";
import { getAnalyticsDashboard, type AnalyticsArea, type AnalyticsFilters } from "@/lib/admin-analytics";

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
const rangeButtons = [{ label: "今天", days: 0 }, { label: "近 7 天", days: 6 }, { label: "近 30 天", days: 29 }];
const number = new Intl.NumberFormat("zh-CN");
const localDate = (value: Date) => value.toISOString().slice(0, 10);
const displayTime = (value: string | null, timeZone: string) => value ? new Date(value).toLocaleString("zh-CN", { timeZone, hour12: false }) : "尚无有效事件";

function compactBars({ title, items }: { title: string; items: Array<{ label: string; value: number }> }) {
  const high = Math.max(...items.map((item) => item.value), 1);
  return <section className="admin-panel"><h2>{title}</h2>{items.length ? <div className="admin-breakdown-list">{items.map((item) => <div key={item.label}><div><span>{item.label}</span><strong>{number.format(item.value)}</strong></div><i><b style={{ width: String(Math.max((item.value / high) * 100, 2)).concat("%") }} /></i></div>)}</div> : <p className="admin-empty">当前范围暂无真实数据。</p>}</section>;
}

function AnalyticsWorkspace({ area, data, route }: { area: AnalyticsArea; data: Awaited<ReturnType<typeof getAnalyticsDashboard>>; route: string }) {
  const params = new URLSearchParams();
  params.set("from", data.from); params.set("to", data.to); params.set("traffic", data.filters.traffic);
  if (data.filters.channel) params.set("channel", data.filters.channel);
  if (data.filters.country) params.set("country", data.filters.country);
  if (data.filters.search) params.set("search", data.filters.search);
  params.set("pageSize", String(data.filters.pageSize));
  const url = (changes: Record<string, string | number | undefined>) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([key, value]) => value === undefined || value === "" ? next.delete(key) : next.set(key, String(value)));
    return String(route).concat("?").concat(next.toString());
  };
  const totalPages = Math.max(1, Math.ceil(data.totalRows / data.filters.pageSize));
  const maxTrend = Math.max(...data.trend.map((point) => point.views), 1);
  return <>
    <section className={String("admin-sync ").concat(data.connected ? "ready" : "")}><span />{data.connected ? <>第一方数据已连接 <small>最近有效事件：{displayTime(data.lastEventAt, "Asia/Shanghai")} · 默认已排除测试、自动化、预览及 collects 来源流量</small></> : <>分析数据库尚未连接 <small>连接完成前不会使用演示数据替代真实数据。</small></>}</section>
    <form className="admin-filter-panel" method="get">
      <label>开始日期<input type="date" name="from" defaultValue={data.from} max={data.to} /></label>
      <label>结束日期<input type="date" name="to" defaultValue={data.to} min={data.from} /></label>
      <label>流量口径<select name="traffic" defaultValue={data.filters.traffic}><option value="valid">仅真实流量</option><option value="all">全部（含隔离）</option><option value="excluded">仅隔离流量</option></select></label>
      <label>渠道<input name="channel" defaultValue={data.filters.channel} placeholder="例如 organic" /></label>
      <label>国家/地区<input name="country" defaultValue={data.filters.country} placeholder="例如 US" maxLength={2} /></label>
      <label className="admin-filter-search">页面或来源<input name="search" defaultValue={data.filters.search} placeholder="/en/ 或来源域名" /></label>
      <input type="hidden" name="pageSize" value={data.filters.pageSize} />
      <button type="submit">应用筛选</button>
      <Link href={route}>清除筛选</Link>
    </form>
    <div className="admin-quick-range">{rangeButtons.map((button) => {
      const to = new Date(), from = new Date();
      from.setUTCDate(from.getUTCDate() - button.days);
      return <Link key={button.label} href={url({ from: localDate(from), to: localDate(to), page: undefined })}>{button.label}</Link>;
    })}</div>
    <section className="admin-metrics admin-metrics-dense">
      {[["页面浏览", data.totals.views, "first_party"], ["独立访客", data.totals.visitors, "visitor"], ["有效会话", data.totals.sessions, "session"], ["回访会话", data.totals.returning, "returning"], ["询盘转化", data.totals.leads, "lead"], ["已隔离流量", data.totals.excluded, "excluded"]].map(([label, value, detail]) => <article key={String(label)}><small>{label}</small><strong>{number.format(Number(value))}</strong><em>{detail === "excluded" ? "不进入主指标" : "当前筛选范围"}</em></article>)}
    </section>
    <section className="admin-panel admin-trend-panel"><h2>有效流量趋势</h2>{data.trend.length ? <div className="admin-bar-chart" aria-label="按日的有效页面浏览趋势">{data.trend.map((point) => <div className="admin-bar-group" key={point.label}><div className="admin-bars"><span style={{ height: String(Math.max((point.views / maxTrend) * 100, 2)).concat("%") }} title={String(point.label).concat(" ").concat(String(point.views))} /></div><small>{point.label}</small></div>)}</div> : <p className="admin-empty">新口径从本次升级部署后开始累计；这里不会把未分类的历史测试流量伪装为真实流量。</p>}</section>
    <div className="admin-breakdown-grid">{compactBars({ title: "来源渠道", items: data.channels })}{compactBars({ title: "访问国家/地区", items: data.countries })}{compactBars({ title: "访问设备", items: data.devices })}</div>
    {(area === "overview" || area === "page-performance") ? <section className="admin-panel admin-table"><h2>页面表现</h2><div className="admin-table-scroll"><table><thead><tr><th>页面</th><th>浏览</th><th>访客</th><th>询盘</th></tr></thead><tbody>{data.pages.map((item) => <tr key={item.path}><td>{item.path}</td><td>{number.format(item.views)}</td><td>{number.format(item.visitors)}</td><td>{number.format(item.leads)}</td></tr>)}</tbody></table></div>{!data.pages.length ? <p className="admin-empty">当前范围内暂无有效页面数据。</p> : null}</section> : null}
    <section className="admin-panel admin-table"><div className="admin-table-heading"><div><h2>{area === "paths" ? "访问路径" : area === "traffic" ? "真实来源会话" : "匿名访客会话"}</h2><p>显示 {data.totalRows ? (data.filters.page - 1) * data.filters.pageSize + 1 : 0}–{Math.min(data.filters.page * data.filters.pageSize, data.totalRows)} / {data.totalRows} 条</p></div><span className="admin-page-size-label">每页可切换 25 / 50 / 100 条</span></div>
      <div className="admin-table-scroll"><table><thead><tr><th>匿名访客</th><th>第几次访问</th><th>国家</th><th>渠道/来源</th><th>入口 → 退出</th><th>设备/语言</th><th>事件</th><th>时间</th><th>路径</th></tr></thead><tbody>{data.visitors.map((row) => <tr key={row.id}><td>{row.visitor}<small>{row.returning ? "回访" : "首次"}</small></td><td>{row.visitNumber || "历史记录"}</td><td>{row.country}</td><td>{row.channel}<small>{row.source}</small></td><td>{row.landing}<small>{row.exit}</small></td><td>{row.device}<small>{row.locale}</small></td><td>{row.events}</td><td>{row.startedAt}</td><td><details><summary>查看</summary><span>{row.pathSummary}</span>{row.trafficClass !== "valid" ? <small>已隔离：{row.excludedReason || row.trafficClass}</small> : null}</details></td></tr>)}</tbody></table></div>
      {!data.visitors.length ? <p className="admin-empty">此筛选条件下暂无会话记录。</p> : null}
      <nav className="admin-pagination" aria-label="会话分页"><Link aria-disabled={data.filters.page <= 1} href={url({ page: Math.max(1, data.filters.page - 1) })}>上一页</Link><span>第 {data.filters.page} / {totalPages} 页</span><Link aria-disabled={data.filters.page >= totalPages} href={url({ page: Math.min(totalPages, data.filters.page + 1) })}>下一页</Link>{[25, 50, 100].map((size) => <Link key={size} className={size === data.filters.pageSize ? "active" : ""} href={url({ page: 1, pageSize: size })}>{size}/页</Link>)}</nav>
    </section>
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
  const filters: AnalyticsFilters = {
    from: typeof search.from === "string" ? search.from : undefined, to: typeof search.to === "string" ? search.to : undefined,
    channel: typeof search.channel === "string" ? search.channel : undefined, country: typeof search.country === "string" ? search.country : undefined,
    traffic: search.traffic === "all" || search.traffic === "excluded" ? search.traffic : "valid",
    search: typeof search.search === "string" ? search.search : undefined, page: Number(search.page) || 1, pageSize: Number(search.pageSize) || 25,
    session: typeof search.session === "string" ? search.session : undefined,
  };
  const [analytics, legacy] = await Promise.all([isAnalytics ? getAnalyticsDashboard(filters) : Promise.resolve(null), isAnalytics ? Promise.resolve(null) : getAdminModuleData(siteId, area[0], 7)]);
  const canConfigure = session.role === "super_admin" || session.role === "site_admin";

  return <div className="admin-console">
    <aside className="admin-sidebar">
      <Link className="admin-brand" href={String("/admin/").concat(siteId).concat("/overview")}><span className="admin-brand-mark">B</span>BZMAGNET<small>运营后台</small></Link>
      <nav aria-label="后台模块">{adminModules.map(([slug, label]) => <Link key={slug} className={slug === area[0] ? "active" : ""} href={String("/admin/").concat(siteId).concat("/").concat(slug)}>{label}</Link>)}</nav>
      <div className="admin-account"><strong>{site.name}</strong><small>{session.email}</small><small>仅经授权的数据可见</small><form action={logout}><button type="submit">退出登录</button></form></div>
    </aside>
    <main className="admin-main">
      <header className="admin-page-head"><div><p className="admin-eyebrow">BZMAGNET · {site.timezone}</p><h1>{title.title}</h1><p>{title.description}</p></div><div className="admin-live-state"><span />数据刷新：有效事件写入后约 60 秒内显示</div></header>
      {analytics ? <AnalyticsWorkspace area={area[0] as AnalyticsArea} data={analytics} route={route} /> : legacy ? <>
        <section className={String("admin-sync ").concat(legacy.connected ? "ready" : "")}><span />{legacy.connected ? <>站点数据已连接 <small>最近 Search Console 同步：{displayTime(legacy.lastSynced, site.timezone)}</small></> : "数据库尚未连接"}</section>
        {canConfigure && area[0] === "seo" ? <section className="admin-action"><div><strong>Google Search Console</strong><span>同步后更新当前站点的搜索表现。</span></div><form action={syncSearchConsole}><input type="hidden" name="siteId" value={siteId} /><button type="submit">同步搜索数据</button></form></section> : null}
        {canConfigure && area[0] === "news-operations" ? <section className="admin-action"><div><strong>来源目录核验</strong><span>只检查待核验来源状态，不发布内容。</span></div><form action={validateNewsSources}><input type="hidden" name="siteId" value={siteId} /><button type="submit">核验下一批来源</button></form></section> : null}
        <section className="admin-metrics admin-metrics-dense">{legacy.metrics.map((metric) => <Link key={metric.label} href={metric.href}><article><small>{metric.label}</small><strong>{metric.value}</strong>{metric.detail ? <em>{metric.detail}</em> : null}</article></Link>)}</section>
        <div className="admin-breakdown-grid">{legacy.breakdowns.map((breakdown) => compactBars({ title: breakdown.title, items: breakdown.items }))}</div>
        <section className="admin-panel admin-table"><h2>{legacy.table.title}</h2><div className="admin-table-scroll"><table><thead><tr>{legacy.table.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{legacy.table.rows.map((row, index) => <tr key={String(index)}>{row.map((cell, cellIndex) => <td key={String(cellIndex)}>{cell}</td>)}</tr>)}</tbody></table></div>{!legacy.table.rows.length ? <p className="admin-empty">{legacy.table.emptyText}</p> : null}</section>
      </> : null}
    </main>
  </div>;
}
