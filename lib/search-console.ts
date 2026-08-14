import "server-only";

import { createSign, randomUUID } from "node:crypto";
import postgres from "postgres";

type ServiceAccount = { client_email: string; private_key: string; token_uri?: string };
type SearchConsoleRow = { keys?: string[]; clicks?: number; impressions?: number; ctr?: number; position?: number };
type SearchConsoleResponse = { rows?: SearchConsoleRow[] };

const cleanUrl = (value: string | undefined) => value?.trim().replace(/^(['"])(.*)\1$/, "$2") || undefined;
const databaseUrl = [process.env.ADMIN_DATABASE_URL, process.env.NEWS_DATABASE_URL, process.env.POSTGRES_URL, process.env.DATABASE_URL].map(cleanUrl).find(Boolean);
const sql = databaseUrl ? postgres(databaseUrl, { prepare: false, max: 2, idle_timeout: 10, connect_timeout: 10 }) : null;
const tokenEndpoint = "https://oauth2.googleapis.com/token";
const apiBase = "https://www.googleapis.com/webmasters/v3";

function config() {
  const property = process.env.SEARCH_CONSOLE_SITE_URL?.trim();
  const rawCredentials = process.env.GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT_JSON?.trim();
  if (!property || !rawCredentials) return null;
  if (!/^sc-domain:[a-z0-9.-]+$/i.test(property) && !/^https:\/\/[a-z0-9.-]+\/$/i.test(property)) throw new Error("search_console_property_invalid");
  const account = JSON.parse(rawCredentials) as ServiceAccount;
  if (!account.client_email || !account.private_key || (account.token_uri && account.token_uri !== tokenEndpoint)) throw new Error("search_console_credentials_invalid");
  return { property, account };
}

async function accessToken(account: ServiceAccount) {
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${encode({ alg: "RS256", typ: "JWT" })}.${encode({ iss: account.client_email, scope: "https://www.googleapis.com/auth/webmasters.readonly", aud: tokenEndpoint, iat: now, exp: now + 3600 })}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  const assertion = `${unsigned}.${signer.sign(account.private_key).toString("base64url")}`;
  const response = await fetch(tokenEndpoint, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }), cache: "no-store" });
  if (!response.ok) throw new Error(`search_console_oauth_${response.status}`);
  const payload = await response.json() as { access_token?: string };
  if (!payload.access_token) throw new Error("search_console_oauth_invalid_response");
  return payload.access_token;
}

const isoDate = (date: Date) => date.toISOString().slice(0, 10);

export async function syncSearchConsoleMetrics(siteId: string) {
  if (!sql) throw new Error("admin_store_not_configured");
  const settings = config();
  if (!settings) return { configured: false, rows: 0, property: null };
  const end = new Date();
  end.setUTCDate(end.getUTCDate() - 3);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 27);
  const token = await accessToken(settings.account);
  const response = await fetch(`${apiBase}/sites/${encodeURIComponent(settings.property)}/searchAnalytics/query`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ startDate: isoDate(start), endDate: isoDate(end), dimensions: ["date", "page"], rowLimit: 25000 }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`search_console_query_${response.status}`);
  const payload = await response.json() as SearchConsoleResponse;
  const rows = (payload.rows ?? []).filter((row) => row.keys?.length === 2 && row.keys[0] && row.keys[1]);
  await sql.begin(async (transaction) => {
    for (const row of rows) {
      const [metricDate, page] = row.keys!;
      await transaction`
        insert into seo_metrics (id, site_id, url, metric_date, clicks, impressions, ctr, average_position, source, metadata)
        values (${randomUUID()}, ${siteId}, ${page}, ${metricDate}, ${Math.round(row.clicks ?? 0)}, ${Math.round(row.impressions ?? 0)}, ${row.ctr ?? 0}, ${row.position ?? 0}, 'google_search_console', ${transaction.json({ property: settings.property })})
        on conflict (site_id, url, metric_date, source) do update set clicks = excluded.clicks, impressions = excluded.impressions, ctr = excluded.ctr, average_position = excluded.average_position, metadata = excluded.metadata
      `;
    }
    await transaction`
      insert into site_settings (site_id, setting_key, value, updated_at)
      values (${siteId}, 'search_console_sync', ${transaction.json({ property: settings.property, lastSuccessAt: new Date().toISOString(), rows: rows.length })}, now())
      on conflict (site_id, setting_key) do update set value = excluded.value, updated_at = now()
    `;
  });
  return { configured: true, rows: rows.length, property: settings.property, startDate: isoDate(start), endDate: isoDate(end) };
}
