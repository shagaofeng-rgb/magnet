import Link from "next/link";
import { notFound } from "next/navigation";
import { adminModules, requireAdmin, sites } from "@/lib/admin-console";
import { logout, syncSearchConsole } from "@/lib/admin-actions";
import { getAdminModuleData } from "@/lib/admin-store";

type Params = { siteId: string; section?: string[] };
type Search = { range?: string };

const copy: Record<string, { title: string; description: string }> = {
  overview: { title: "网站数据总览", description: "集中查看网站访问、询盘、内容和搜索数据。" },
  traffic: { title: "来源渠道与设备分析", description: "查看访问来源、设备和语言的真实会话数据。" },
  seo: { title: "Search Console 数据", description: "查看已同步的搜索点击、展示和页面表现。" },
  products: { title: "产品目录管理", description: "查看当前产品目录、语言和发布状态。" },
  news: { title: "新闻与内容管理", description: "查看已保存内容的类型、语言和发布状态。" },
  "news-operations": { title: "News 运营", description: "查看内容发布任务和当前运行状态。" },
  forms: { title: "询盘与客户线索", description: "查看网站表单已保存的询盘记录和来源上下文。" },
  links: { title: "内外链审计", description: "查看已保存的链接检查结果和待复查项目。" },
  visitors: { title: "近期访问记录", description: "查看匿名会话、入口页面、设备和语言；不展示完整 IP。" },
  "page-performance": { title: "落地页数据表现", description: "按浏览、访客和转化查看已记录的页面表现。" },
  paths: { title: "访问路径", description: "查看从入口页面到最后页面的匿名访问路径。" },
  settings: { title: "系统设置", description: "查看站点连接与已保存的运营设置。" },
};

const ranges = [{ key: "day", label: "日", days: 1 }, { key: "week", label: "周", days: 7 }, { key: "month", label: "月", days: 30 }];
const rangeDays = (value?: string) => ranges.find((item) => item.key === value)?.days ?? 7;
const formatTime = (value: string | null, timeZone: string) => value ? new Date(value).toLocaleString("zh-CN", { timeZone, hour12: false }) : "暂无同步记录";

function TrendChart({ points }: { points: Array<{ label: string; value: number; secondary?: number }> }) {
  if (!points.length) return <p className="admin-empty">当前时间范围内暂无趋势数据。公开页面产生访问后会自动记录。</p>;
  const high = Math.max(...points.map((point) => Math.max(point.value, point.secondary || 0)), 1);
  return <figure className="admin-trend">
    <div className="admin-bar-chart" aria-label="页面浏览与转化趋势">
      {points.map((point) => <div className="admin-bar-group" key={point.label}>
        <div className="admin-bars"><span style={{ height: `${Math.max((point.value / high) * 100, 2)}%` }} title={`${point.label} 页面浏览 ${point.value}`} /><span className="secondary" style={{ height: `${Math.max(((point.secondary || 0) / high) * 100, 0)}%` }} title={`${point.label} 转化 ${point.secondary || 0}`} /></div>
        <small>{point.label}</small>
      </div>)}
    </div>
    <figcaption><span className="admin-legend primary">页面浏览</span><span className="admin-legend secondary">转化</span></figcaption>
  </figure>;
}

function Breakdown({ title, items, emptyText }: { title: string; items: Array<{ label: string; value: number }>; emptyText: string }) {
  const high = Math.max(...items.map((item) => item.value), 1);
  return <section className="admin-panel admin-breakdown"><h2>{title}</h2>{items.length ? <div className="admin-breakdown-list">{items.map((item) => <div key={item.label}><div><span>{item.label}</span><strong>{item.value}</strong></div><i><b style={{ width: `${Math.max((item.value / high) * 100, 2)}%` }} /></i></div>)}</div> : <p className="admin-empty">{emptyText}</p>}</section>;
}

export default async function AdminModulePage({ params, searchParams }: { params: Promise<Params>; searchParams: Promise<Search> }) {
  const { siteId, section = ["overview"] } = await params;
  const search = await searchParams;
  const site = sites.find((item) => item.id === siteId);
  if (!site) notFound();
  const session = await requireAdmin(siteId);
  const area = adminModules.find((item) => item[0] === section[0]) || adminModules[0];
  const activeRange = ranges.find((item) => item.key === search.range) || ranges[1];
  const data = await getAdminModuleData(siteId, area[0], rangeDays(activeRange.key));
  const content = copy[area[0]] || copy.overview;
  const canConfigure = session.role === "super_admin" || session.role === "site_admin";
  const route = `/admin/${siteId}/${area[0]}`;

  return <div className="admin-console">
    <aside className="admin-sidebar">
      <Link className="admin-brand" href={`/admin/${siteId}/overview`}><span className="admin-brand-mark" aria-hidden="true">B</span>BZMAGNET<small>运营后台</small></Link>
      <nav aria-label="后台模块">{adminModules.map(([slug, label]) => <Link key={slug} className={slug === area[0] ? "active" : ""} href={`/admin/${siteId}/${slug}`}>{label}</Link>)}</nav>
      <div className="admin-account"><strong>{site.name}</strong><small>{session.email}</small><small>数据范围：近 {data.rangeDays} 天</small><form action={logout}><button type="submit">退出登录</button></form></div>
    </aside>
    <main className="admin-main">
      <header className="admin-page-head">
        <div><h1>{content.title}</h1><p>{content.description}</p></div>
        <section className="admin-range" aria-label="数据时间范围"><strong>时间范围</strong><small>当前查看：近 {data.rangeDays} 天</small><div>{ranges.map((item) => <Link key={item.key} className={item.key === activeRange.key ? "active" : ""} href={`${route}?range=${item.key}`}>{item.label}</Link>)}</div><Link className="admin-refresh" href={`${route}?range=${activeRange.key}`}>刷新当前范围</Link></section>
      </header>
      <section className={`admin-sync ${data.connected ? "ready" : ""}`}><span />{data.connected ? <>站点数据已连接 <small>最近 Search Console 同步：{formatTime(data.lastSynced, site.timezone)}</small></> : "数据连接未完成"}</section>
      {canConfigure && area[0] === "seo" ? <section className="admin-action"><div><strong>Google Search Console</strong><span>同步后会更新当前站点的搜索表现数据。</span></div><form action={syncSearchConsole}><input type="hidden" name="siteId" value={siteId} /><button type="submit">同步搜索数据</button></form></section> : null}
      <section className="admin-metrics admin-metrics-dense" aria-label={`${content.title}关键数据`}>{data.metrics.map((metric) => <Link key={metric.label} href={metric.href}><article><small>{metric.label}</small><strong>{metric.value}</strong>{metric.detail ? <em>{metric.detail}</em> : null}<i /></article></Link>)}</section>
      <section className="admin-panel admin-trend-panel"><h2>每日数据变化</h2><TrendChart points={data.trend} /></section>
      <div className="admin-breakdown-grid">{data.breakdowns.map((breakdown) => <Breakdown key={breakdown.title} {...breakdown} />)}</div>
      <section className="admin-panel admin-table"><h2>{data.table.title}</h2>{data.table.rows.length ? <div className="admin-table-scroll"><table><thead><tr>{data.table.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{data.table.rows.map((row, index) => <tr key={`${row[0]}-${index}`}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></div> : <p className="admin-empty">{data.table.emptyText}</p>}</section>
    </main>
  </div>;
}
