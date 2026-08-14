import Link from "next/link";
import { notFound } from "next/navigation";
import { adminModules, requireAdmin, sites } from "@/lib/admin-console";
import { logout, syncSearchConsole } from "@/lib/admin-actions";
import { getAdminModuleData } from "@/lib/admin-store";

type Params = { siteId: string; section?: string[] };

const formatTime = (value: string | null, timeZone: string) => value
  ? new Date(value).toLocaleString("zh-CN", { timeZone, hour12: false })
  : "暂无同步记录";

function TrendChart({ points }: { points: Array<{ label: string; value: number }> }) {
  if (!points.length) return <p className="admin-empty">暂无趋势数据。网站访问后会自动开始记录。</p>;
  const high = Math.max(...points.map((point) => point.value), 1);
  const width = 720;
  const height = 220;
  const coordinates = points.map((point, index) => {
    const x = points.length === 1 ? width / 2 : 20 + (index * (width - 40)) / (points.length - 1);
    const y = height - 30 - (point.value / high) * (height - 70);
    return `${x},${y}`;
  }).join(" ");
  return <figure className="admin-chart">
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby="traffic-chart-title traffic-chart-summary">
      <title id="traffic-chart-title">近 14 天页面浏览趋势</title>
      <desc id="traffic-chart-summary">{points.map((point) => `${point.label} ${point.value}`).join("；")}</desc>
      <line x1="20" x2={width - 20} y1={height - 30} y2={height - 30} className="admin-chart-axis" />
      <polyline points={coordinates} className="admin-chart-line" />
      {points.map((point, index) => {
        const [x, y] = coordinates.split(" ")[index].split(",");
        return <g key={point.label}><circle cx={x} cy={y} r="4" className="admin-chart-dot" /><text x={x} y={height - 8} textAnchor="middle">{point.label}</text></g>;
      })}
    </svg>
    <figcaption>近 14 天页面浏览量</figcaption>
  </figure>;
}

export default async function AdminModulePage({ params }: { params: Promise<Params> }) {
  const { siteId, section = ["overview"] } = await params;
  const site = sites.find((item) => item.id === siteId);
  if (!site) notFound();

  const session = await requireAdmin(siteId);
  const area = adminModules.find((item) => item[0] === section[0]) || adminModules[0];
  const data = await getAdminModuleData(siteId, area[0]);
  const canConfigure = session.role === "super_admin" || session.role === "site_admin";

  return <div className="admin-console">
    <aside className="admin-sidebar">
      <Link className="admin-brand" href={`/admin/${siteId}/overview`}>BZMAGNET<span>运营后台</span></Link>
      <nav aria-label="后台模块">
        {adminModules.map(([slug, label]) => <Link key={slug} className={slug === area[0] ? "active" : ""} href={`/admin/${siteId}/${slug}`}>{label}</Link>)}
      </nav>
      <div className="admin-account">
        <strong>{site.name}</strong><small>{session.email}</small>
        <small>最近同步：{formatTime(data.lastSynced, site.timezone)}</small>
        <form action={logout}><button type="submit">退出登录</button></form>
      </div>
    </aside>
    <main className="admin-main">
      <header className="admin-topbar"><div><span>{site.name}</span><strong>{area[1]}</strong></div><span>{site.locales.join(" / ")}</span></header>
      <section className="admin-title">
        <div><h1>{area[1]}</h1><p>{data.connected ? "显示当前站点已保存的真实运营数据。" : "数据连接未完成，暂无可展示的数据。"}</p></div>
        {canConfigure && area[0] === "seo" ? <form action={syncSearchConsole}><input type="hidden" name="siteId" value={siteId} /><button type="submit">同步 Search Console</button></form> : null}
      </section>
      <section className="admin-metrics" aria-label={`${area[1]}关键数据`}>
        {data.metrics.map((metric) => <Link key={metric.label} href={metric.href}><article><small>{metric.label}</small><strong>{metric.value}</strong></article></Link>)}
      </section>
      <section className="admin-panel"><h2>访问趋势</h2><TrendChart points={data.trend} /></section>
      <section className="admin-panel admin-table"><h2>{data.table.title}</h2>
        {data.table.rows.length ? <div className="admin-table-scroll"><table><thead><tr>{data.table.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{data.table.rows.map((row, index) => <tr key={`${row[0]}-${index}`}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></div> : <p className="admin-empty">{data.table.emptyText}</p>}
      </section>
    </main>
  </div>;
}
