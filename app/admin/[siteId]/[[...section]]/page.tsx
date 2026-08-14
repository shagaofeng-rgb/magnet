import Link from "next/link";
import { notFound } from "next/navigation";
import { adminModules, adminSnapshot, requireAdmin, sites } from "@/lib/admin-console";
import { logout } from "@/lib/admin-actions";

type Params = { siteId: string; section?: string[] };

export default async function AdminModulePage({ params }: { params: Promise<Params> }) {
  const { siteId, section = ["overview"] } = await params;
  const site = sites.find((item) => item.id === siteId);
  if (!site) notFound();
  const session = await requireAdmin(siteId);
  const area = adminModules.find((item) => item[0] === section[0]) || adminModules[0];
  const snapshot = adminSnapshot();
  return <div className="admin-console"><aside className="admin-sidebar"><Link className="admin-brand" href={`/admin/${siteId}/overview`}>BZMAGNET<span>后台</span></Link><nav aria-label="后台模块">{adminModules.map(([slug, label]) => <Link key={slug} className={slug === area[0] ? "active" : ""} href={`/admin/${siteId}/${slug}`}>{label}</Link>)}</nav><div className="admin-account"><strong>{site.name}</strong><small>{site.timezone}</small><small>最后同步：尚未连接</small><form action={logout}><button type="submit">退出登录</button></form></div></aside><main className="admin-main"><header className="admin-topbar"><div><span>{site.name}</span><strong>{area[1]}</strong></div><div><span>语言：{site.locales.join(" / ")}</span><span>角色：{session.role}</span></div></header><section className="admin-title"><div><p>站点级隔离 · 服务端会话校验</p><h1>{area[1]}</h1><span>所有数据按 BZMAGNET 站点范围读取；未连接的服务不会以演示指标伪装。</span></div><button>导出当前视图</button></section><div className="admin-tabs" role="tablist">{area[2].map((name, index) => <button key={name} role="tab" aria-selected={index === 0}>{name}</button>)}</div><ModuleContent area={area[0]} snapshot={snapshot} /></main></div>;
}

function ModuleContent({ area, snapshot }: { area: string; snapshot: ReturnType<typeof adminSnapshot> }) {
  const cards = area === "overview" ? [["已发布产品", String(snapshot.publishedProducts), "产品目录"], ["已发布内容", String(snapshot.publishedArticles), "内容库"], ["待补充翻译", String(snapshot.localeGaps), "目录校验"], ["分析连接", "未连接", "需要授权"]] : [["数据状态", "未连接", "等待站点级连接"], ["可用权限", "已验证", "服务端会话"], ["最后同步", "—", "不展示虚构数据"], ["审计记录", "准备就绪", "写入动作需确认"]];
  const heading = area === "products" ? "产品与发布操作" : area === "news" || area === "news-operations" ? "内容工作流" : "操作安全";
  return <><section className="admin-metrics">{cards.map(([label, value, source]) => <article key={label}><small>{label}</small><strong>{value}</strong><span>来源：{source}</span></article>)}</section><section className="admin-grid-two"><article className="admin-panel"><h2>{area === "overview" ? "数据同步状态" : "数据源与质量"}</h2><p>Analytics、Search Console、CRM、链接审计及性能采集尚未配置。连接后将显示最后成功时间、处理数量、延迟和错误入口。</p><Link href="/admin/bzmagnet/settings">前往系统设置</Link></article><article className="admin-panel"><h2>{heading}</h2><p>创建、发布、导出、删除、回滚和批量导入均要求站点范围权限、字段验证、二次确认和审计记录。</p><button disabled>连接数据后启用操作</button></article></section><section className="admin-panel admin-table"><h2>{area === "overview" ? "高优先级异常" : "处理队列"}</h2><table><thead><tr><th>状态</th><th>项目</th><th>证据 / 来源</th><th>下一步</th></tr></thead><tbody><tr><td><span className="admin-status neutral">未连接</span></td><td>真实数据集</td><td>需要在系统设置完成站点级授权</td><td>由具备 settings 权限的管理员配置</td></tr></tbody></table></section><section className="admin-panel"><h2>无障碍与隐私说明</h2><p>图表、路径图、漏斗和导出会同时提供文本摘要；匿名访问只保存允许的粗粒度属性。完整 IP、完整 User-Agent、第三方密钥与来源原文不会发送到浏览器。</p></section></>;
}
