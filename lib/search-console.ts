import "server-only";

import { createSign, randomUUID } from "node:crypto";
import postgres from "postgres";
import { origin } from "@/lib/i18n";
import { productPathFor, publicProducts } from "@/lib/product-model";

type ServiceAccount = { client_email: string; private_key: string; token_uri?: string };
type SearchConsoleRow = { keys?: string[]; clicks?: number; impressions?: number; ctr?: number; position?: number };
type SearchConsoleResponse = { rows?: SearchConsoleRow[] };
type InspectionResult = {
  inspectionResult?: {
    indexStatusResult?: {
      verdict?: string;
      coverageState?: string;
      robotsTxtState?: string;
      indexingState?: string;
      lastCrawlTime?: string;
      googleCanonical?: string;
      userCanonical?: string;
    };
  };
};

const cleanUrl = (value: string | undefined) => value?.trim().replace(/^(['"])(.*)\1$/, "$2") || undefined;
const databaseUrl = [process.env.ADMIN_DATABASE_URL, process.env.NEWS_DATABASE_URL, process.env.POSTGRES_URL, process.env.DATABASE_URL].map(cleanUrl).find(Boolean);
const sql = databaseUrl ? postgres(databaseUrl, { prepare: false, max: 2, idle_timeout: 10, connect_timeout: 10 }) : null;
const tokenEndpoint = "https://oauth2.googleapis.com/token";
const apiBase = "https://www.googleapis.com/webmasters/v3";
const inspectionEndpoint = "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect";
const readScope = "https://www.googleapis.com/auth/webmasters.readonly";
const writeScope = "https://www.googleapis.com/auth/webmasters";

function config() {
  const property = process.env.SEARCH_CONSOLE_SITE_URL?.trim();
  const rawCredentials = process.env.GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT_JSON?.trim();
  if (!property || !rawCredentials) return null;
  if (!/^sc-domain:[a-z0-9.-]+$/i.test(property) && !/^https:\/\/[a-z0-9.-]+\/$/i.test(property)) throw new Error("search_console_property_invalid");
  let account: ServiceAccount;
  try { account = JSON.parse(rawCredentials) as ServiceAccount; }
  catch { throw new Error("search_console_credentials_invalid"); }
  if (!account.client_email || !account.private_key || (account.token_uri && account.token_uri !== tokenEndpoint)) throw new Error("search_console_credentials_invalid");
  return { property, account };
}

async function accessToken(account: ServiceAccount, scope: string) {
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${encode({ alg: "RS256", typ: "JWT" })}.${encode({ iss: account.client_email, scope, aud: tokenEndpoint, iat: now, exp: now + 3600 })}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  const assertion = `${unsigned}.${signer.sign(account.private_key).toString("base64url")}`;
  const response = await fetch(tokenEndpoint, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }), cache: "no-store", signal: AbortSignal.timeout(12_000) });
  if (!response.ok) throw new Error(`search_console_oauth_${response.status}`);
  const payload = await response.json() as { access_token?: string };
  if (!payload.access_token) throw new Error("search_console_oauth_invalid_response");
  return payload.access_token;
}

const isoDate = (date: Date) => date.toISOString().slice(0, 10);
const safeErrorCode = (error: unknown) => {
  if (error instanceof Error && /^(search_console_[a-z0-9_]+|admin_store_not_configured)$/.test(error.message)) return error.message;
  if (error instanceof Error && error.name === "TimeoutError") return "search_console_timeout";
  return "search_console_operation_failed";
};

async function recordStatus(siteId: string, settingKey: string, value: Record<string, unknown>) {
  if (!sql) return;
  await sql`
    insert into site_settings (site_id, setting_key, value, updated_at)
    values (${siteId}, ${settingKey}, ${sql.json(value as never)}, now())
    on conflict (site_id, setting_key) do update set value = site_settings.value || excluded.value, updated_at = now()
  `;
}

export async function syncSearchConsoleMetrics(siteId: string) {
  const attemptedAt = new Date().toISOString();
  try {
    const result = await pullSearchConsoleMetrics(siteId, attemptedAt);
    if (!result.configured) await recordStatus(siteId, "search_console_sync", { state: "unconfigured", attemptedAt, code: "search_console_not_configured" });
    return result;
  } catch (error) {
    const code = safeErrorCode(error);
    await recordStatus(siteId, "search_console_sync", { state: "failed", attemptedAt, code });
    throw new Error(code);
  }
}

async function pullSearchConsoleMetrics(siteId: string, attemptedAt: string) {
  if (!sql) throw new Error("admin_store_not_configured");
  const settings = config();
  if (!settings) return { configured: false, rows: 0, property: null };
  const end = new Date();
  end.setUTCDate(end.getUTCDate() - 3);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 27);
  const token = await accessToken(settings.account, readScope);
  const response = await fetch(`${apiBase}/sites/${encodeURIComponent(settings.property)}/searchAnalytics/query`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ startDate: isoDate(start), endDate: isoDate(end), dimensions: ["date", "page"], rowLimit: 25000 }),
    cache: "no-store",
    signal: AbortSignal.timeout(25_000),
  });
  if (!response.ok) throw new Error(`search_console_query_${response.status}`);
  const payload = await response.json() as SearchConsoleResponse;
  const rows = (payload.rows ?? []).flatMap((row) => {
    if (row.keys?.length !== 2 || !row.keys[0] || !row.keys[1]) return [];
    const [metric_date, url] = row.keys;
    return [{ id: randomUUID(), metric_date, url, clicks: Math.round(row.clicks ?? 0), impressions: Math.round(row.impressions ?? 0), ctr: row.ctr ?? 0, average_position: row.position ?? 0 }];
  });
  await sql.begin(async (transaction) => {
    for (let index = 0; index < rows.length; index += 500) {
      await transaction`
        insert into seo_metrics (id, site_id, url, metric_date, clicks, impressions, ctr, average_position, source, metadata)
        select id, ${siteId}, url, metric_date, clicks, impressions, ctr, average_position, 'google_search_console', ${transaction.json({ property: settings.property })}
        from jsonb_to_recordset(${transaction.json(rows.slice(index, index + 500))}::jsonb)
          as incoming(id uuid, url text, metric_date date, clicks integer, impressions integer, ctr numeric, average_position numeric)
        on conflict (site_id, url, metric_date, source) do update set clicks = excluded.clicks, impressions = excluded.impressions, ctr = excluded.ctr, average_position = excluded.average_position, metadata = excluded.metadata
      `;
    }
    await transaction`
      insert into site_settings (site_id, setting_key, value, updated_at)
      values (${siteId}, 'search_console_sync', ${transaction.json({ state: "succeeded", attemptedAt, property: settings.property, lastSuccessAt: new Date().toISOString(), rows: rows.length, rowLimitReached: (payload.rows?.length ?? 0) >= 25000 })}, now())
      on conflict (site_id, setting_key) do update set value = excluded.value, updated_at = now()
    `;
  });
  return { configured: true, rows: rows.length, property: settings.property, startDate: isoDate(start), endDate: isoDate(end) };
}

/** Submits the sitemap index to the property. It reports submission, never indexing. */
export async function submitSearchConsoleSitemap(siteId: string, sitemapUrl = `${origin}/sitemap-index.xml`) {
  if (!sql) throw new Error("admin_store_not_configured");
  const attemptedAt = new Date().toISOString();
  try {
    const settings = config();
    if (!settings) {
      const result = { configured: false, submitted: false, sitemapUrl, attemptedAt, code: "search_console_not_configured" };
      await recordStatus(siteId, "search_console_sitemap_submission", result);
      return result;
    }
    const token = await accessToken(settings.account, writeScope);
    const response = await fetch(`${apiBase}/sites/${encodeURIComponent(settings.property)}/sitemaps/${encodeURIComponent(sitemapUrl)}`, {
      method: "PUT",
      headers: { authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) throw new Error(`search_console_sitemap_submit_${response.status}`);
    const result = { configured: true, submitted: true, sitemapUrl, attemptedAt, submittedAt: new Date().toISOString(), property: settings.property, code: null };
    await recordStatus(siteId, "search_console_sitemap_submission", result);
    return result;
  } catch (error) {
    const result = { configured: true, submitted: false, sitemapUrl, attemptedAt, failedAt: new Date().toISOString(), code: safeErrorCode(error) };
    await recordStatus(siteId, "search_console_sitemap_submission", result);
    return result;
  }
}

export async function runSearchConsoleCycle(siteId: string) {
  const [metrics, submission] = await Promise.allSettled([syncSearchConsoleMetrics(siteId), submitSearchConsoleSitemap(siteId)]);
  const sync = metrics.status === "fulfilled" ? metrics.value : null;
  const sitemap = submission.status === "fulfilled" ? submission.value : null;
  const ok = Boolean(sync?.configured && sitemap?.submitted);
  return {
    status: ok ? 200 : sync?.configured === false && sitemap?.configured === false ? 409 : 502,
    body: {
      ok, configured: Boolean(sync?.configured || sitemap?.configured),
      rows: sync?.rows ?? 0, property: sync?.property, startDate: sync?.startDate, endDate: sync?.endDate,
      metricsSynced: Boolean(sync?.configured),
      metricsCode: metrics.status === "rejected" ? safeErrorCode(metrics.reason) : undefined,
      sitemapSubmitted: Boolean(sitemap?.submitted), sitemapUrl: sitemap?.sitemapUrl,
      submissionCode: submission.status === "rejected" ? safeErrorCode(submission.reason) : sitemap?.code,
    },
  };
}

const inspectionTargets = () => {
  const products = publicProducts.slice(0, 3).map((product) => `${origin}${productPathFor("en", product)}`);
  return [`${origin}/en`, `${origin}/en/products`, `${origin}/en/industry-solutions`, `${origin}/en/news`, ...products];
};

/** Samples important canonical URLs daily. This reads Google status and does not request indexing. */
export async function inspectSearchConsoleUrls(siteId: string, urls = inspectionTargets()) {
  if (!sql) throw new Error("admin_store_not_configured");
  const settings = config();
  if (!settings) return { configured: false, inspected: 0, results: [] as Array<Record<string, unknown>> };

  try {
    const token = await accessToken(settings.account, readScope);
    const results = [] as Array<Record<string, unknown>>;
    for (const inspectionUrl of urls.slice(0, 10)) {
      const response = await fetch(inspectionEndpoint, {
        method: "POST",
        headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
        body: JSON.stringify({ inspectionUrl, siteUrl: settings.property }),
        cache: "no-store",
      });
      if (!response.ok) throw new Error(`search_console_inspection_${response.status}`);
      const payload = await response.json() as InspectionResult;
      const index = payload.inspectionResult?.indexStatusResult;
      results.push({
        url: inspectionUrl,
        verdict: index?.verdict ?? "UNKNOWN",
        coverageState: index?.coverageState ?? "UNKNOWN",
        robotsTxtState: index?.robotsTxtState ?? "UNKNOWN",
        indexingState: index?.indexingState ?? "UNKNOWN",
        userCanonical: index?.userCanonical,
        googleCanonical: index?.googleCanonical,
        lastCrawlTime: index?.lastCrawlTime,
      });
    }
    const result = { configured: true, inspected: results.length, inspectedAt: new Date().toISOString(), property: settings.property, results };
    await recordStatus(siteId, "search_console_inspection", result);
    return result;
  } catch (error) {
    const result = { configured: true, inspected: 0, failedAt: new Date().toISOString(), code: safeErrorCode(error), property: settings.property, results: [] as Array<Record<string, unknown>> };
    await recordStatus(siteId, "search_console_inspection", result);
    return result;
  }
}
