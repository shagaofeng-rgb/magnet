"use server";
import { createHash, pbkdf2Sync, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ADMIN_COOKIE, encodeAdminSession } from "@/lib/admin-console";
import { requireAdmin } from "@/lib/admin-console";
import { completeAdminJob, writeAdminAudit, writeAdminJob } from "@/lib/admin-store";
import { syncSearchConsoleMetrics } from "@/lib/search-console";
import { runSourceHealthChecks } from "@/lib/news/source-health";
const loginFailures = new Map<string, { attempts: number; startedAt: number }>();
const loginWindowMs = 15 * 60 * 1000;
const loginAttemptLimit = 5;
async function loginRateKey(email: string) {
  const forwarded = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  return `${email}:${forwarded}`;
}
function loginIsRateLimited(key: string) {
  const record = loginFailures.get(key);
  if (!record) return false;
  if (Date.now() - record.startedAt >= loginWindowMs) { loginFailures.delete(key); return false; }
  return record.attempts >= loginAttemptLimit;
}
function recordLoginFailure(key: string) {
  const record = loginFailures.get(key);
  if (!record || Date.now() - record.startedAt >= loginWindowMs) loginFailures.set(key, { attempts: 1, startedAt: Date.now() });
  else record.attempts += 1;
}
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
export async function login(formData: FormData) { const email = String(formData.get("email") || "").trim().toLowerCase(); const password = String(formData.get("password") || ""); const key = await loginRateKey(email); if (loginIsRateLimited(key)) redirect("/admin/login?error=2"); const expectedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase(); const expectedHash = process.env.ADMIN_PASSWORD_HASH; if (!process.env.ADMIN_SESSION_SECRET || !expectedEmail || !expectedHash || email !== expectedEmail || !matchesPassword(password, expectedHash)) { recordLoginFailure(key); redirect("/admin/login?error=1"); } loginFailures.delete(key); const token = encodeAdminSession({ userId: "bootstrap-admin", email, role: "super_admin", siteIds: ["bzmagnet"], expiresAt: Date.now() + 8 * 60 * 60 * 1000 }); (await cookies()).set(ADMIN_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/admin", maxAge: 8 * 60 * 60 }); redirect("/admin/bzmagnet/overview"); }
export async function logout() { (await cookies()).delete(ADMIN_COOKIE); redirect("/admin/login"); }

export async function queueInternalAdminCheck(formData: FormData) {
  const siteId = String(formData.get("siteId") || "");
  const area = String(formData.get("area") || "overview");
  if (siteId !== "bzmagnet" || !/^[a-z-]{2,40}$/.test(area)) throw new Error("invalid_admin_action");
  const session = await requireAdmin(siteId, "settings");
  const idempotencyKey = `internal-check:${area}:${new Date().toISOString().slice(0, 10)}`;
  await writeAdminJob(siteId, "internal_admin_check", idempotencyKey, { area, requestedBy: session.userId, requestedAt: new Date().toISOString() });
  await writeAdminAudit(siteId, session.userId, "queue", "internal_admin_check", area, "管理员手动记录内部检查；不调用第三方服务。");
  revalidatePath(`/admin/${siteId}/${area}`);
}

export async function syncSearchConsole(formData: FormData) {
  const siteId = String(formData.get("siteId") || "");
  if (siteId !== "bzmagnet") throw new Error("invalid_admin_action");
  const session = await requireAdmin(siteId, "settings");
  const idempotencyKey = `search-console:${new Date().toISOString().slice(0, 10)}`;
  await writeAdminJob(siteId, "search_console_sync", idempotencyKey, { requestedBy: session.userId, requestedAt: new Date().toISOString() });
  try {
    const result = await syncSearchConsoleMetrics(siteId);
    await completeAdminJob(siteId, idempotencyKey, result.configured ? "succeeded" : "failed", result);
    await writeAdminAudit(siteId, session.userId, "sync", "search_console", result.property, result.configured ? `Search Console sync completed: ${result.rows} metric records` : "Search Console is not configured");
  } catch (error) {
    const code = error instanceof Error ? error.message.replace(/[^a-z0-9_-]/gi, "_").slice(0, 120) : "search_console_sync_failed";
    await completeAdminJob(siteId, idempotencyKey, "failed", { code });
    await writeAdminAudit(siteId, session.userId, "sync_failed", "search_console", null, `Search Console sync failed: ${code}`);
  }
  revalidatePath(`/admin/${siteId}/seo`);
  revalidatePath(`/admin/${siteId}/settings`);
}

/** Runs the same bounded, robots-first validation used by the scheduled worker. */
export async function validateNewsSources(formData: FormData) {
  const siteId = String(formData.get("siteId") || "");
  if (siteId !== "bzmagnet") throw new Error("invalid_admin_action");
  const session = await requireAdmin(siteId, "settings");
  const result = await runSourceHealthChecks();
  await writeAdminAudit(siteId, session.userId, "validate", "news_source_catalog", null, `Bounded source validation: ${result.attempted} checked, ${result.verified} verified, ${result.blocked} robots-blocked.`);
  revalidatePath(`/admin/${siteId}/news-operations`);
}
