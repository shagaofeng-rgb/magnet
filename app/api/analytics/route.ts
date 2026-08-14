import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import postgres from "postgres";

const databaseUrl = [process.env.ADMIN_DATABASE_URL, process.env.NEWS_DATABASE_URL, process.env.POSTGRES_URL, process.env.DATABASE_URL].map((value) => value?.trim().replace(/^(['"])(.*)\1$/, "$2")).find(Boolean);
const sql = databaseUrl ? postgres(databaseUrl, { prepare: false, max: 2 }) : null;
const safePath = (value: unknown) => typeof value === "string" && /^\/(?:[a-z0-9_~%./-]|[\u0600-\u06ff])*$/iu.test(value) && value.length <= 240;
const safeLocale = (value: unknown) => ["en", "es", "pt", "ar", "ru"].includes(String(value));
const channel = (value: unknown) => typeof value === "string" && /google|bing|yahoo/i.test(value) ? "organic" : typeof value === "string" && value ? "referral" : "direct";

export async function POST(request: NextRequest) {
  if (!sql) return NextResponse.json({ accepted: false }, { status: 202 });
  try {
    const body = await request.json() as { sessionId?: unknown; event?: unknown; path?: unknown; locale?: unknown; referrer?: unknown };
    if (body.event !== "page_view" || typeof body.sessionId !== "string" || !/^[a-f0-9-]{36}$/i.test(body.sessionId) || !safePath(body.path) || !safeLocale(body.locale)) return NextResponse.json({ accepted: false }, { status: 400 });
    const path = body.path as string;
    const locale = body.locale as string;
    const sessionId = body.sessionId;
    const today = new Date().toISOString().slice(0, 10);
    const device = /Mobi|Android|iPhone/i.test(request.headers.get("user-agent") || "") ? "mobile" : "desktop";
    await sql.begin(async (transaction) => {
      await transaction`insert into visitor_sessions (id, site_id, anonymous_session_id, channel, landing_path, exit_path, device_class, locale, started_at, ended_at, event_count) values (${randomUUID()}, 'bzmagnet', ${sessionId}, ${channel(body.referrer)}, ${path}, ${path}, ${device}, ${locale}, now(), now(), 1) on conflict (site_id, anonymous_session_id) do update set exit_path = excluded.exit_path, ended_at = now(), event_count = visitor_sessions.event_count + 1`;
      await transaction`insert into analytics_events (id, site_id, anonymous_session_id, event_name, allowed_properties, occurred_at) values (${randomUUID()}, 'bzmagnet', ${sessionId}, 'page_view', ${transaction.json({ path, locale, device })}, now())`;
      await transaction`insert into page_metrics (id, site_id, path, locale, metric_date, page_views, unique_visitors, conversions, source) values (${randomUUID()}, 'bzmagnet', ${path}, ${locale}, ${today}, 1, 0, 0, 'internal') on conflict (site_id, path, metric_date, source) do update set page_views = page_metrics.page_views + 1, locale = excluded.locale`;
    });
    return NextResponse.json({ accepted: true }, { status: 202 });
  } catch { return NextResponse.json({ accepted: false }, { status: 400 }); }
}
