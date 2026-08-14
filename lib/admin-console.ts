import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ADMIN_COOKIE = "bzmagnet_admin_session";
export const roles = ["super_admin", "site_admin", "editor", "content_reviewer", "seo_analyst", "sales", "viewer"] as const;
export type AdminRole = (typeof roles)[number];
export type AdminAction = "read" | "create" | "update" | "publish" | "delete" | "export" | "settings";
export type AdminSession = { userId: string; email: string; role: AdminRole; siteIds: string[]; expiresAt: number };

export const adminModules = [
  ["overview", "数据总览", ["运营概览"]],
  ["traffic", "流量分析", ["访问概览"]],
  ["seo", "SEO 数据", ["搜索表现"]],
  ["products", "产品管理", ["产品目录"]],
  ["news", "新闻管理", ["内容库"]],
  ["news-operations", "News 运营", ["发布任务"]],
  ["forms", "客户表单", ["询盘收件箱"]],
  ["links", "内外链审计", ["链接审计"]],
  ["visitors", "访客记录", ["访客会话"]],
  ["page-performance", "页面表现", ["页面表现"]],
  ["paths", "访问路径", ["转化路径"]],
  ["settings", "系统设置", ["站点设置"]],
] as const;

export const sites = [{ id: "bzmagnet", name: "BZMAGNET", origin: process.env.NEXT_PUBLIC_SITE_ORIGIN || "https://bzmagnet.com", locales: ["en", "es", "pt", "ar", "ru"], timezone: "Asia/Shanghai" }] as const;
const actionRoles: Record<AdminAction, readonly AdminRole[]> = { read: roles, create: ["super_admin", "site_admin", "editor", "content_reviewer", "sales"], update: ["super_admin", "site_admin", "editor", "content_reviewer", "sales"], publish: ["super_admin", "site_admin", "content_reviewer"], delete: ["super_admin", "site_admin"], export: ["super_admin", "site_admin", "seo_analyst", "sales"], settings: ["super_admin", "site_admin"] };

function sign(payload: string) { return createHmac("sha256", process.env.ADMIN_SESSION_SECRET || "").update(payload).digest("hex"); }
export function encodeAdminSession(session: AdminSession) { const payload = Buffer.from(JSON.stringify(session)).toString("base64url"); return `${payload}.${sign(payload)}`; }
export function decodeAdminSession(token?: string): AdminSession | null { if (!token || !process.env.ADMIN_SESSION_SECRET) return null; const [payload, signature] = token.split("."); if (!payload || !signature) return null; const expected = sign(payload); if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null; try { const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AdminSession; return session.expiresAt > Date.now() && roles.includes(session.role) ? session : null; } catch { return null; } }
export async function getAdminSession() { return decodeAdminSession((await cookies()).get(ADMIN_COOKIE)?.value); }
export async function requireAdmin(siteId: string, action: AdminAction = "read") { const session = await getAdminSession(); if (!session || !session.siteIds.includes(siteId) || !actionRoles[action].includes(session.role)) redirect("/admin/login"); return session; }
