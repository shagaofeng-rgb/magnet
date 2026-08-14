"use server";
import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, encodeAdminSession } from "@/lib/admin-console";
function digest(value: string) { return createHash("sha256").update(value).digest("hex"); }
export async function login(formData: FormData) { const email = String(formData.get("email") || "").trim().toLowerCase(); const password = String(formData.get("password") || ""); const expectedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase(); const expectedHash = process.env.ADMIN_PASSWORD_HASH; if (!process.env.ADMIN_SESSION_SECRET || !expectedEmail || !expectedHash || email !== expectedEmail) redirect("/admin/login?error=1"); const actual = digest(password); if (actual.length !== expectedHash.length || !timingSafeEqual(Buffer.from(actual), Buffer.from(expectedHash))) redirect("/admin/login?error=1"); const token = encodeAdminSession({ userId: "bootstrap-admin", email, role: "super_admin", siteIds: ["bzmagnet"], expiresAt: Date.now() + 8 * 60 * 60 * 1000 }); (await cookies()).set(ADMIN_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/admin", maxAge: 8 * 60 * 60 }); redirect("/admin/bzmagnet/overview"); }
export async function logout() { (await cookies()).delete(ADMIN_COOKIE); redirect("/admin/login"); }
