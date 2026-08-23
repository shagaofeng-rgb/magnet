import "server-only";

import { createHmac, randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import postgres from "postgres";

const SITE_ID = "bzmagnet";
const cleanUrl = (value: string | undefined) => value?.trim().replace(/^(['"])(.*)\1$/, "$2") || undefined;
const databaseUrl = [process.env.ANALYTICS_CONNECTION_URL, process.env.ADMIN_DATABASE_URL, process.env.NEWS_DATABASE_URL, process.env.POSTGRES_URL, process.env.DATABASE_URL].map(cleanUrl).find(Boolean);
const sql = databaseUrl ? postgres(databaseUrl, { prepare: false, max: 3, idle_timeout: 10, connect_timeout: 10 }) : null;
const locales = new Set(["en", "es", "pt", "ar", "ru"]);
const events = new Set(["page_view", "cta_click", "form_start", "form_submit", "product_view", "language_change", "search"]);

export type AnalyticsInput = {
  event?: unknown; eventId?: unknown; sessionId?: unknown; visitorId?: unknown;
  path?: unknown; locale?: unknown; referrer?: unknown; utm?: unknown; label?: unknown; target?: unknown;
};
export type TrafficClass = "valid" | "internal" | "automation" | "test" | "suspicious";

const isUuid = (value: unknown): value is string => typeof value === "string" && /^[a-f0-9-]{36}$/i.test(value);
const safePath = (value: unknown): value is string => typeof value === "string" && /^\/(?:[a-z0-9_~%./-]|[\u0600-\u06ff])*$/iu.test(value) && value.length <= 240;
const safeText = (value: unknown, max = 120) => typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null;
const safeLocale = (value: unknown): value is string => locales.has(String(value));

function parseUrl(value: unknown) { try { return typeof value === "string" && value ? new URL(value) : null; } catch { return null; } }
function clientIp(request: NextRequest) { return (request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || "").trim() || null; }
function anonymize(value: string | null) {
  const secret = process.env.ANALYTICS_HASH_SECRET || process.env.ADMIN_SESSION_SECRET || process.env.INQUIRY_ENCRYPTION_KEY;
  return value && secret ? createHmac("sha256", secret).update(value).digest("hex") : null;
}
function attribution(input: AnalyticsInput) {
  const referrer = parseUrl(input.referrer);
  const utm = input.utm && typeof input.utm === "object" ? input.utm as Record<string, unknown> : {};
  const source = safeText(utm.source, 80) || referrer?.hostname.toLowerCase() || null;
  const medium = safeText(utm.medium, 80);
  const campaign = safeText(utm.campaign, 120);
  const content = safeText(utm.content, 120);
  const term = safeText(utm.term, 120);
  const referrerHost = referrer?.hostname.toLowerCase() || null;
  const lookup = `${source || ""} ${medium || ""}`.toLowerCase();
  const channel = /cpc|ppc|paid|display|affiliate/.test(lookup) ? "paid"
    : /email|newsletter/.test(lookup) ? "email"
    : /facebook|instagram|linkedin|twitter|x\.com|youtube|tiktok/.test(lookup) ? "social"
    : medium?.toLowerCase() === "organic" || /(^|\.)(google|bing|yahoo|duckduckgo)\./i.test(referrerHost || "") ? "organic"
    : referrerHost ? "referral" : "direct";
  return { channel, source, medium, campaign, content, term, referrerHost };
}
function classify(request: NextRequest, referrerHost: string | null): { trafficClass: TrafficClass; reason: string | null } {
  const agent = request.headers.get("user-agent") || "";
  const host = (request.headers.get("host") || "").toLowerCase();
  const ip = clientIp(request);
  const internalIps = new Set((process.env.ANALYTICS_INTERNAL_IPS || "").split(",").map((item) => item.trim()).filter(Boolean));
  const excluded = (process.env.ANALYTICS_EXCLUDED_REFERRERS || "collects").split(",").map((item) => item.trim().toLowerCase()).filter(Boolean);
  if (host.includes("localhost") || host.includes("vercel.app")) return { trafficClass: "test", reason: "preview_or_local_host" };
  if (ip && internalIps.has(ip)) return { trafficClass: "internal", reason: "configured_internal_ip" };
  if (/bot|crawler|spider|lighthouse|headless|puppeteer|playwright|selenium|curl|wget/i.test(agent)) return { trafficClass: "automation", reason: "automated_user_agent" };
  if (excluded.some((item) => referrerHost === item || Boolean(referrerHost?.includes(item)))) return { trafficClass: "test", reason: "excluded_referrer" };
  return { trafficClass: "valid", reason: null };
}

export async function collectAnalyticsEvent(request: NextRequest, input: AnalyticsInput) {
  if (!sql) return { accepted: false, unavailable: true };
  if (!events.has(String(input.event)) || !isUuid(input.sessionId) || !isUuid(input.visitorId) || !safePath(input.path) || !safeLocale(input.locale)) return { accepted: false, invalid: true };
  const event = String(input.event), eventId = isUuid(input.eventId) ? input.eventId : randomUUID();
  const sessionId = input.sessionId, visitorKey = input.visitorId, path = input.path, locale = input.locale;
  const source = attribution(input), classification = classify(request, source.referrerHost);
  const userAgent = request.headers.get("user-agent") || null;
  const countryCode = (request.headers.get("x-vercel-ip-country") || request.headers.get("cf-ipcountry") || "").toUpperCase() || null;
  const countryRegion = request.headers.get("x-vercel-ip-country-region") || null;
  const ipHash = anonymize(clientIp(request)), userAgentHash = anonymize(userAgent);
  const device = /Mobi|Android|iPhone|iPad/i.test(userAgent || "") ? "mobile" : "desktop";
  const today = new Date().toISOString().slice(0, 10);

  await sql.begin(async (transaction) => {
    const duplicate = await transaction<{ id: string }[]>`select id::text from analytics_events where site_id = ${SITE_ID} and event_id = ${eventId} limit 1`;
    if (duplicate.length) return;
    const existingSession = await transaction<{ id: string }[]>`select id::text from visitor_sessions where site_id = ${SITE_ID} and anonymous_session_id = ${sessionId} limit 1`;
    if (!existingSession.length) {
      const visitors = await transaction<{ visit_count: number }[]>`select visit_count from analytics_visitors where site_id = ${SITE_ID} and visitor_key = ${visitorKey} for update`;
      const visitNumber = visitors.length ? Number(visitors[0].visit_count || 0) + 1 : 1;
      const isReturning = visitNumber > 1;
      if (visitors.length) {
        await transaction`update analytics_visitors set last_seen_at = now(), visit_count = ${visitNumber}, country_code = coalesce(${countryCode}, country_code), country_region = coalesce(${countryRegion}, country_region), ip_hash = coalesce(${ipHash}, ip_hash), user_agent_hash = coalesce(${userAgentHash}, user_agent_hash), traffic_class = ${classification.trafficClass} where site_id = ${SITE_ID} and visitor_key = ${visitorKey}`;
      } else {
        await transaction`insert into analytics_visitors (id, site_id, visitor_key, visit_count, country_code, country_region, ip_hash, user_agent_hash, traffic_class, classification) values (${randomUUID()}, ${SITE_ID}, ${visitorKey}, 1, ${countryCode}, ${countryRegion}, ${ipHash}, ${userAgentHash}, ${classification.trafficClass}, ${transaction.json({ reason: classification.reason })})`;
      }
      await transaction`insert into visitor_sessions (id, site_id, anonymous_session_id, visitor_key, visit_number, is_returning, channel, source, medium, campaign, campaign_content, campaign_term, referrer_host, landing_path, exit_path, device_class, locale, country_code, country_region, ip_hash, user_agent_hash, traffic_class, exclusion_reason, started_at, ended_at, last_event_at, event_count) values (${randomUUID()}, ${SITE_ID}, ${sessionId}, ${visitorKey}, ${visitNumber}, ${isReturning}, ${source.channel}, ${source.source}, ${source.medium}, ${source.campaign}, ${source.content}, ${source.term}, ${source.referrerHost}, ${path}, ${path}, ${device}, ${locale}, ${countryCode}, ${countryRegion}, ${ipHash}, ${userAgentHash}, ${classification.trafficClass}, ${classification.reason}, now(), now(), now(), 1)`;
    } else {
      await transaction`update visitor_sessions set exit_path = ${path}, ended_at = now(), last_event_at = now(), event_count = visitor_sessions.event_count + 1 where site_id = ${SITE_ID} and anonymous_session_id = ${sessionId}`;
    }
    await transaction`insert into analytics_events (id, site_id, anonymous_session_id, visitor_key, event_id, event_name, path, locale, traffic_class, country_code, referrer_host, source, medium, campaign, allowed_properties, occurred_at, received_at) values (${randomUUID()}, ${SITE_ID}, ${sessionId}, ${visitorKey}, ${eventId}, ${event}, ${path}, ${locale}, ${classification.trafficClass}, ${countryCode}, ${source.referrerHost}, ${source.source}, ${source.medium}, ${source.campaign}, ${transaction.json({ path, locale, device, label: safeText(input.label), target: safeText(input.target, 240), trafficClass: classification.trafficClass })}, now(), now())`;
    if (classification.trafficClass !== "valid") return;
    if (event === "page_view") {
      const unique = await transaction<{ visitor_key: string }[]>`insert into analytics_page_visitors (site_id, path, metric_date, visitor_key) values (${SITE_ID}, ${path}, ${today}, ${visitorKey}) on conflict do nothing returning visitor_key`;
      await transaction`insert into page_metrics (id, site_id, path, locale, metric_date, page_views, unique_visitors, conversions, source) values (${randomUUID()}, ${SITE_ID}, ${path}, ${locale}, ${today}, 1, ${unique.length}, 0, 'first_party') on conflict (site_id, path, metric_date, source) do update set page_views = page_metrics.page_views + 1, unique_visitors = page_metrics.unique_visitors + ${unique.length}, locale = excluded.locale`;
    }
    if (event === "form_submit") {
      await transaction`insert into page_metrics (id, site_id, path, locale, metric_date, page_views, unique_visitors, conversions, source) values (${randomUUID()}, ${SITE_ID}, ${path}, ${locale}, ${today}, 0, 0, 1, 'first_party') on conflict (site_id, path, metric_date, source) do update set conversions = page_metrics.conversions + 1, locale = excluded.locale`;
    }
  });
  return { accepted: true, trafficClass: classification.trafficClass };
}
