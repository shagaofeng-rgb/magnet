"use server";
import { createHash, pbkdf2Sync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, encodeAdminSession } from "@/lib/admin-console";
function matchesPassword(password: string, stored: string) {
  const [scheme, iterationText, salt, expected] = stored.split("$");
  if (scheme === "pbkdf2-sha256" && iterationText && salt && expected) {
    const iterations = Number(iterationText);
    if (!Number.isSafeInteger(iterations) || iterations < 100_000) return false;
    const actual = pbkdf2Sync(password, salt, iterations, 32, "sha256").toString("hex");
    return actual.length === expected.length && timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
  }
  // Compatibility only for an already-configured legacy bootstrap hash.
  const actual = createHash("sha256").update(password).digest("hex");
  return actual.length === stored.length && timingSafeEqual(Buffer.from(actual), Buffer.from(stored));
}
export async function login(formData: FormData) { const email = String(formData.get("email") || "").trim().toLowerCase(); const password = String(formData.get("password") || ""); const expectedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase(); const expectedHash = process.env.ADMIN_PASSWORD_HASH; if (!process.env.ADMIN_SESSION_SECRET || !expectedEmail || !expectedHash || email !== expectedEmail || !matchesPassword(password, expectedHash)) redirect("/admin/login?error=1"); const token = encodeAdminSession({ userId: "bootstrap-admin", email, role: "super_admin", siteIds: ["bzmagnet"], expiresAt: Date.now() + 8 * 60 * 60 * 1000 }); (await cookies()).set(ADMIN_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/admin", maxAge: 8 * 60 * 60 }); redirect("/admin/bzmagnet/overview"); }
export async function logout() { (await cookies()).delete(ADMIN_COOKIE); redirect("/admin/login"); }
