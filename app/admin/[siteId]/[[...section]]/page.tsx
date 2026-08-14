import Link from "next/link";
import { notFound } from "next/navigation";
import { adminModules, requireAdmin, sites } from "@/lib/admin-console";
import { logout, queueInternalAdminCheck, syncSearchConsole } from "@/lib/admin-actions";
import { getAdminModuleData } from "@/lib/admin-store";

type Params = { siteId: string; section?: string[] };
type Search = { tab?: string };

const sectionNotes: Record<string, string> = {
  overview: "汇总站点健康、内容、询盘与内部任务。数字均来自当前站点数据库。",
  traffic: "仅显示匿名且允许保存的会话与事件；未接入分析服务时不会生成虚假数据。",
  seo: "查看导入的搜索表现、抓取与结构化数据审计；Search Console 同步仅在服务器端执行。",
  products: "管理本站分类、产品与版本；发布前需要字段、权限与审计校验。",
  news: "管理 Company News、Industry News 与 Blog 的结构化内容、审核和版本。",
  "news-operations": "内部模式不会采集外部来源或自动发布；运行日志只显示实际任务结果。",
  forms: "询盘写入本站范围的加密存储；只有授权人员可处理线索。",
  links: "链接审计、重定向和修复队列只展示已经保存的检查结果。",
  visitors: "会话记录只使用匿名标识、粗粒度国家/设备信息和明确的数据保留策略。",
  "page-performance": "页面 KPI、内容质量和性能数据依据内部采集或已导入结果显示。",
  paths: "路径与漏斗仅在达到最小样本量后显示，避免识别个人行为。",
  settings: "品牌、域名、语言、权限、保留期和站点级连接配置在这里统一维护。",
};

export default async function AdminModulePage({ params, searchParams }: { params: Promise<Params>; searchParams: Promise<Search> }) {
  const { siteId, section = ["overview"] } = await params;
  const { tab } = await searchParams;
  const site = sites.find((item) => item.id === siteId);
  if (!site) notFound();

  const session = await requireAdmin(siteId);
  const area = adminModules.find((item) => item[0] === section[0]) || adminModules[0];
  const activeTab = area[2].includes(tab as never) ? tab! : area[2][0];
  const data = await getAdminModuleData(siteId, area[0]);
  const canConfigure = session.role === "super_admin" || session.role === "site_admin";

  return (
    <div className="admin-console">
      <aside className="admin-sidebar">
        <Link className="admin-brand" href={`/admin/${siteId}/overview`}>BZMAGNET<span>后台管理</span></Link>
        <nav aria-label="后台模块">
          {adminModules.map(([slug, label]) => <Link key={slug} className={slug === area[0] ? "active" : ""} href={`/admin/${siteId}/${slug}`}>{label}</Link>)}
        </nav>
        <div className="admin-account">
          <strong>{site.name}</strong><small>{session.email}</small>
          <small>最后同步：{data.lastSynced ? new Date(data.lastSynced).toLocaleString("zh-CN", { timeZone: site.timezone }) : "暂无实际同步"}</small>
          <form action={logout}><button type="submit">退出登录</button></form>
        </div>
      </aside>
      <main className="admin-main">
        <header className="admin-topbar"><div><span>{site.name}</span><strong>{area[1]}</strong></div><div><span>{site.locales.join(" / ")}</span><span>角色：{session.role}</span></div></header>
        <section className="admin-title">
          <div><p>站点级隔离 · 服务端会话校验</p><h1>{area[1]}</h1><span>{sectionNotes[area[0]]}</span></div>
          {canConfigure ? <form action={queueInternalAdminCheck}><input type="hidden" name="siteId" value={siteId}/><input type="hidden" name="area" value={area[0]}/><button type="submit">记录内部检查</button></form> : <span className="admin-readonly">当前角色为只读权限</span>}
        </section>
        {canConfigure && area[0] === "seo" ? <section className="admin-panel"><h2>Google Search Console</h2><p>同步最近 28 天的按日期与页面搜索表现。凭据仅在服务器端使用；同步失败会写入审计记录，不会显示密钥或原始 Google 响应。</p><form action={syncSearchConsole}><input type="hidden" name="siteId" value={siteId}/><button type="submit">同步 Search Console 数据</button></form></section> : null}
        <div className="admin-tabs" role="tablist" aria-label={`${area[1]}二级功能`}>
          {area[2].map((name) => <Link key={name} role="tab" aria-selected={activeTab === name} href={`/admin/${siteId}/${area[0]}?tab=${encodeURIComponent(name)}`}>{name}</Link>)}
        </div>
        <section className="admin-context"><strong>当前视图：</strong>{activeTab}<span> · {data.connected ? "已连接站点数据库" : "数据库未连接"}</span></section>
        <section className="admin-metrics">{data.metrics.map((metric) => <Link key={metric.label} href={metric.href}><article><small>{metric.label}</small><strong>{metric.value}</strong><span>来源：{metric.source}</span><em>{metric.detail}</em></article></Link>)}</section>
        <section className="admin-grid-two">
          <article className="admin-panel"><h2>数据状态</h2><p>{data.connected ? "当前页面读取的是 BZMAGNET 站点范围内的真实数据库记录。尚未采集或未接入的数据会保留为空。" : "尚未建立站点数据连接，后台不会以 Demo 指标替代真实数据。"}</p><Link href={`/admin/${siteId}/settings`}>前往系统设置</Link></article>
          <article className="admin-panel"><h2>操作边界</h2><p>发布、删除、回滚、批量导入和导出都必须经过站点权限、字段验证、二次确认和审计日志。外部连接未配置时保持关闭。</p><span className="admin-status neutral">{data.connected ? "数据层已启用" : "等待配置"}</span></article>
        </section>
        <section className="admin-panel admin-table"><h2>处理队列</h2><table><thead><tr><th>状态</th><th>项目</th><th>证据 / 来源</th><th>下一步</th></tr></thead><tbody>{data.queue.map((item, index) => <tr key={`${item.item}-${index}`}><td><span className="admin-status neutral">{item.status}</span></td><td>{item.item}</td><td>{item.evidence}</td><td>{item.next}</td></tr>)}</tbody></table></section>
        <section className="admin-panel"><h2>无障碍与隐私说明</h2><p>图表、路径图、漏斗和导出必须提供文本摘要。匿名访问仅保存允许的粗粒度属性；完整 IP、完整 User-Agent、数据库凭据、密钥和加密询盘字段不会发送到浏览器。</p></section>
      </main>
    </div>
  );
}
