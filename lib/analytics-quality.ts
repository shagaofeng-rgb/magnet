import "server-only";

import { createHmac, randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import postgres from "postgres";
import { resolveAdminDateRange } from "@/lib/admin-date-range";
import { campaignValue, externalReferrerHost, isProductDetailPath } from "@/lib/site-attribution";

const SITE_ID = "bzmagnet";
const cleanUrl = (value: string | undefined) => value?.trim().replace(/^(['"])(.*)\1$/, "$2") || undefined;
const databaseUrl = [process.env.ANALYTICS_CONNECTION_URL, process.env.ADMIN_DATABASE_URL, process.env.NEWS_DATABASE_URL, process.env.POSTGRES_URL, process.env.DATABASE_URL].map(cleanUrl).find(Boolean);
const sql = databaseUrl ? postgres(databaseUrl, { prepare: false, max: 3, idle_timeout: 10, connect_timeout: 10 }) : null;
const locales = new Set(["en", "es", "pt", "ar", "ru"]);
const events = new Set(["page_view", "cta_click", "form_start", "form_submit", "product_view", "language_change", "search"]);

export type AnalyticsInput = {
  event?: unknown; eventId?: unknown; sessionId?: unknown; visitorId?: unknown;
  path?: unknown; locale?: unknown; referrer?: unknown; referrerHost?: unknown; utm?: unknown; label?: unknown; target?: unknown;
};
export type TrafficClass = "valid" | "internal" | "automation" | "test" | "suspicious";

const isUuid = (value: unknown): value is string => typeof value === "string" && /^[a-f0-9-]{36}$/i.test(value);
const safePath = (value: unknown): value is string => typeof value === "string" && /^\/(?:[a-z0-9_~%./-]|[\u0600-\u06ff])*$/iu.test(value) && value.length <= 240;
const safeText = (value: unknown, max = 120) => typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null;
const safeLocale = (value: unknown): value is string => locales.has(String(value));

function clientIp(request: NextRequest) { return (request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || "").trim() || null; }
function anonymize(value: string | null) {
  const secret = process.env.ANALYTICS_HASH_SECRET || process.env.ADMIN_SESSION_SECRET || process.env.INQUIRY_ENCRYPTION_KEY;
  return value && secret ? createHmac("sha256", secret).update(value).digest("hex") : null;
}
function attribution(input: AnalyticsInput, hostname: string) {
  const host = typeof input.referrerHost === "string" && /^[a-z0-9.-]{1,253}$/i.test(input.referrerHost)
    ? externalReferrerHost(`https://${input.referrerHost}`, hostname)
    : typeof input.referrer === "string" ? externalReferrerHost(input.referrer, hostname) : undefined;
  const referrerHost = host || null;
  const utm = input.utm && typeof input.utm === "object" ? input.utm as Record<string, unknown> : {};
  const source = campaignValue(utm.source) || referrerHost;
  const medium = campaignValue(utm.medium) || null;
  const campaign = campaignValue(utm.campaign) || null;
  const content = campaignValue(utm.content) || null;
  const term = campaignValue(utm.term) || null;
  const lookup = `${source || ""} ${medium || ""}`.toLowerCase();
  const channel = /cpc|ppc|paid|display|affiliate/.test(lookup) ? "paid"
    : /email|newsletter/.test(lookup) ? "email"
    : /facebook|instagram|linkedin|twitter|x\.com|youtube|tiktok/.test(lookup) ? "social"
    : medium?.toLowerCase() === "organic" || /(^|\.)(google|bing|yahoo|duckduckgo)\./i.test(referrerHost || "") ? "organic"
    : referrerHost ? "referral" : source ? "campaign" : "direct";
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
  if (!input || !events.has(String(input.event)) || !isUuid(input.sessionId) || !isUuid(input.visitorId) || !safePath(input.path) || !safeLocale(input.locale)
    || (input.path !== `/${input.locale}` && !input.path.startsWith(`/${input.locale}/`))
    || (input.event === "product_view" && !isProductDetailPath(input.path))
    || ((input.event === "form_start" || input.event === "form_submit") && !/\/(request-quote|about-contact)\/?$/.test(input.path))) {
    return { accepted: false, invalid: true };
  }
  const event = String(input.event), eventId = isUuid(input.eventId) ? input.eventId : randomUUID();
  const sessionId = input.sessionId, visitorKey = input.visitorId, path = input.path, locale = input.locale;
  const source = attribution(input, request.nextUrl.hostname), classification = classify(request, source.referrerHost);
  const userAgent = request.headers.get("user-agent") || null;
  const country = (request.headers.get("x-vercel-ip-country") || "").toUpperCase();
  const countryCode = /^[A-Z]{2}$/.test(country) && country !== "XX" ? country : null;
  const countryRegion = request.headers.get("x-vercel-ip-country-region") || null;
  const ipHash = anonymize(clientIp(request)), userAgentHash = anonymize(userAgent);
  const device = /Mobi|Android|iPhone|iPad/i.test(userAgent || "") ? "mobile" : "desktop";
  const today = resolveAdminDateRange({ range: "today" }).from;

  await sql.begin(async (transaction) => {
    await transaction`select pg_advisory_xact_lock(hashtextextended(${`analytics-session:${SITE_ID}:${sessionId}`}, 0))`;
    const inserted = await transaction`insert into analytics_events (id, site_id, anonymous_session_id, visitor_key, event_id, event_name, path, locale, traffic_class, country_code, referrer_host, source, medium, campaign, allowed_properties, occurred_at, received_at)
      values (${randomUUID()}, ${SITE_ID}, ${sessionId}, ${visitorKey}, ${eventId}, ${event}, ${path}, ${locale}, ${classification.trafficClass}, ${countryCode}, ${source.referrerHost}, ${source.source}, ${source.medium}, ${source.campaign}, ${transaction.json({ path, locale, device, label: safeText(input.label), target: safeText(input.target, 240), trafficClass: classification.trafficClass })}, now(), now())
      on conflict do nothing returning id`;
    if (!inserted.length) return;
    const existingSession = await transaction<{ id: string }[]>`select id::text from visitor_sessions where site_id = ${SITE_ID} and anonymous_session_id = ${sessionId} limit 1`;
    if (!existingSession.length) {
      const [visitor] = await transaction<{ visit_count: number }[]>`
        insert into analytics_visitors (id, site_id, visitor_key, visit_count, country_code, country_region, ip_hash, user_agent_hash, traffic_class, classification)
        values (${randomUUID()}, ${SITE_ID}, ${visitorKey}, 1, ${countryCode}, ${countryRegion}, ${ipHash}, ${userAgentHash}, ${classification.trafficClass}, ${transaction.json({ reason: classification.reason })})
        on conflict (site_id, visitor_key) do update set
          visit_count = analytics_visitors.visit_count + 1, last_seen_at = now(),
          country_code = coalesce(excluded.country_code, analytics_visitors.country_code),
          country_region = coalesce(excluded.country_region, analytics_visitors.country_region),
          ip_hash = coalesce(excluded.ip_hash, analytics_visitors.ip_hash),
          user_agent_hash = coalesce(excluded.user_agent_hash, analytics_visitors.user_agent_hash),
          traffic_class = excluded.traffic_class, classification = excluded.classification
        returning visit_count`;
      const visitNumber = visitor.visit_count;
      const isReturning = visitNumber > 1;
      await transaction`insert into visitor_sessions (id, site_id, anonymous_session_id, visitor_key, visit_number, is_returning, channel, source, medium, campaign, campaign_content, campaign_term, referrer_host, landing_path, exit_path, device_class, locale, country_code, country_region, ip_hash, user_agent_hash, traffic_class, exclusion_reason, started_at, ended_at, last_event_at, event_count) values (${randomUUID()}, ${SITE_ID}, ${sessionId}, ${visitorKey}, ${visitNumber}, ${isReturning}, ${source.channel}, ${source.source}, ${source.medium}, ${source.campaign}, ${source.content}, ${source.term}, ${source.referrerHost}, ${path}, ${path}, ${device}, ${locale}, ${countryCode}, ${countryRegion}, ${ipHash}, ${userAgentHash}, ${classification.trafficClass}, ${classification.reason}, now(), now(), now(), 1)`;
    } else {
      await transaction`update visitor_sessions set exit_path = ${path}, ended_at = now(), last_event_at = now(), event_count = visitor_sessions.event_count + 1 where site_id = ${SITE_ID} and anonymous_session_id = ${sessionId}`;
    }
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
