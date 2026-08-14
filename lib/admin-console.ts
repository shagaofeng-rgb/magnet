import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ADMIN_COOKIE = "bzmagnet_admin_session";
export const roles = ["super_admin", "site_admin", "editor", "content_reviewer", "seo_analyst", "sales", "viewer"] as const;
export type AdminRole = (typeof roles)[number];
export type AdminAction = "read" | "create" | "update" | "publish" | "delete" | "export" | "settings";
export type AdminSession = { userId: string; email: string; role: AdminRole; siteIds: string[]; expiresAt: number };

export const adminModules = [
  ["overview", "数据总览", ["总览仪表盘", "时间范围与比较", "数据同步状态", "核心指标卡", "内容库存状态", "流量趋势", "来源渠道", "高优先级异常", "快捷操作"]],
  ["traffic", "流量分析", ["流量概览", "渠道与来源", "地域、设备与语言", "着陆页", "转化分析", "数据质量"]],
  ["seo", "SEO 数据", ["搜索表现", "关键词与页面", "收录与抓取", "Sitemap 与 Robots", "Canonical / Hreflang", "Schema 验证", "SEO 问题队列"]],
  ["products", "产品管理", ["产品列表", "产品分类/系列", "产品编辑器", "参数与选项", "图片与文件", "多语言内容", "SEO 与关联内容", "发布与版本", "批量导入/导出"]],
  ["news", "新闻管理", ["内容列表", "内容编辑器", "分类与标签", "作者与审核", "来源与证据", "多语言与 SEO", "发布日历", "版本/回滚"]],
  ["news-operations", "News 运营", ["运营仪表盘", "主题队列", "采集与来源审核", "自动生成任务", "质量/重复检测", "发布队列与失败任务", "产品关联规则", "运行日志/告警"]],
  ["forms", "客户表单", ["询盘收件箱", "表单字段与路由", "线索状态/分配", "垃圾/重复识别", "转化报表", "导出与隐私请求"]],
  ["links", "内外链审计", ["站内链接图谱", "失效链接", "外链与来源链接", "重定向链", "孤儿页", "锚文本与关联性", "修复队列"]],
  ["visitors", "访客记录", ["匿名访问会话", "事件明细", "来源与着陆页", "询盘转化关联", "数据保留与脱敏", "隐私访问请求"]],
  ["page-performance", "页面表现", ["页面 KPI", "SEO / 内容质量", "Core Web Vitals", "图片与资源性能", "页面异常", "优化建议队列"]],
  ["paths", "访问路径", ["路径漏斗", "常见路径", "退出与回退点", "产品到询盘路径", "页面间跳转图谱"]],
  ["settings", "系统设置", ["站点与品牌", "域名/语言/时区", "分析与搜索连接", "内容自动化配置", "SEO 与爬虫配置", "表单/邮件/CRM 配置", "媒体与存储配置", "用户、角色与权限", "审计日志与数据保留", "危险操作与备份"]],
] as const;

export const sites = [{ id: "bzmagnet", name: "BZMAGNET", origin: process.env.NEXT_PUBLIC_SITE_ORIGIN || "https://bzmagnet.com", locales: ["en", "es", "pt", "ar", "ru"], timezone: "Asia/Shanghai" }] as const;
const actionRoles: Record<AdminAction, readonly AdminRole[]> = { read: roles, create: ["super_admin", "site_admin", "editor", "content_reviewer", "sales"], update: ["super_admin", "site_admin", "editor", "content_reviewer", "sales"], publish: ["super_admin", "site_admin", "content_reviewer"], delete: ["super_admin", "site_admin"], export: ["super_admin", "site_admin", "seo_analyst", "sales"], settings: ["super_admin", "site_admin"] };

function sign(payload: string) { return createHmac("sha256", process.env.ADMIN_SESSION_SECRET || "").update(payload).digest("hex"); }
export function encodeAdminSession(session: AdminSession) { const payload = Buffer.from(JSON.stringify(session)).toString("base64url"); return `${payload}.${sign(payload)}`; }
export function decodeAdminSession(token?: string): AdminSession | null { if (!token || !process.env.ADMIN_SESSION_SECRET) return null; const [payload, signature] = token.split("."); if (!payload || !signature) return null; const expected = sign(payload); if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null; try { const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AdminSession; return session.expiresAt > Date.now() && roles.includes(session.role) ? session : null; } catch { return null; } }
export async function getAdminSession() { return decodeAdminSession((await cookies()).get(ADMIN_COOKIE)?.value); }
export async function requireAdmin(siteId: string, action: AdminAction = "read") { const session = await getAdminSession(); if (!session || !session.siteIds.includes(siteId) || !actionRoles[action].includes(session.role)) redirect("/admin/login"); return session; }
