import "server-only";

import postgres from "postgres";

const cleanUrl = (value: string | undefined) => value?.trim().replace(/^(['"])(.*)\1$/, "$2") || undefined;
const databaseUrl = [process.env.ANALYTICS_CONNECTION_URL, process.env.ADMIN_DATABASE_URL, process.env.NEWS_DATABASE_URL, process.env.POSTGRES_URL, process.env.DATABASE_URL].map(cleanUrl).find(Boolean);
const sql = databaseUrl ? postgres(databaseUrl, { prepare: false, max: 5, idle_timeout: 10, connect_timeout: 10 }) : null;
const SITE_ID = "bzmagnet";
export type AnalyticsArea = "overview" | "traffic" | "visitors" | "page-performance" | "paths";
export type TrafficView = "valid" | "all" | "excluded";

export type DateRangePreset = "today" | "week" | "month" | "custom";
export type AnalyticsFilters = {
  range?: DateRangePreset; from?: string; to?: string; channel?: string; country?: string; traffic?: TrafficView;
  search?: string; page?: number; pageSize?: number; session?: string; visitor?: string;
};
export type SessionRow = { id: string; anonymous_session_id: string; visitor_key: string | null; visit_number: number | null; is_returning: boolean | null; country_code: string | null; channel: string | null; source: string | null; landing_path: string | null; exit_path: string | null; device_class: string | null; locale: string | null; event_count: number | null; started_at: string; traffic_class: string | null; exclusion_reason: string | null; };
export type AnalyticsRow = {
  id: string; visitor: string; visitNumber: number | null; returning: boolean; country: string;
  channel: string; source: string; landing: string; exit: string; device: string; locale: string;
  events: number; startedAt: string; trafficClass: string; excludedReason: string | null; pathSummary: string;
};
export type VisitorProfileRow = {
  visitorKey: string; visitor: string; visits: number; returningVisits: number; events: number;
  firstSeen: string; lastSeen: string; country: string; channel: string; source: string;
  landing: string; exit: string; device: string; locale: string;
};
export type VisitorJourney = { visitor: VisitorProfileRow; sessions: AnalyticsRow[]; events: Array<{ event: string; path: string; at: string; session: string }> };
export type AnalyticsDashboard = {
  connected: boolean; from: string; to: string; filters: Required<Pick<AnalyticsFilters, "traffic" | "page" | "pageSize">> & AnalyticsFilters;
  lastEventAt: string | null; totals: { views: number; sessions: number; visitors: number; returning: number; leads: number; excluded: number };
  trend: Array<{ label: string; views: number; visitors: number; leads: number }>;
  channels: Array<{ label: string; value: number }>; countries: Array<{ label: string; value: number }>;
  devices: Array<{ label: string; value: number }>; pages: Array<{ path: string; views: number; visitors: number; leads: number }>;
  visitors: AnalyticsRow[]; totalRows: number; profiles: VisitorProfileRow[]; profileTotalRows: number;
  timeline: Array<{ event: string; path: string; at: string }>; visitorJourney: VisitorJourney | null;
};

const dateParts = (value = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(value);
  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${lookup.year}-${lookup.month}-${lookup.day}`;
};
const addCalendarDays = (value: string, amount: number) => {
  const [year, month, day] = value.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + amount));
  return next.toISOString().slice(0, 10);
};
const safeDate = (value: string | undefined, fallback: string) => /^\d{4}-\d{2}-\d{2}$/.test(value || "") ? value! : fallback;
const number = (value: string | number | null | undefined) => Number(value || 0);
const selectedTraffic = (value: string | undefined): TrafficView => value === "all" || value === "excluded" ? value : "valid";
const selectedRange = (value: string | undefined): DateRangePreset => value === "week" || value === "month" || value === "custom" ? value : "today";
const selectedPageSize = (value: number | undefined) => [25, 50, 100].includes(Number(value)) ? Number(value) : 25;
const selectedPage = (value: number | undefined) => Math.max(1, Number(value) || 1);
const displayTime = (value: string | Date | null) => value ? new Date(value).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai", hour12: false }) : "—";

function period(input: AnalyticsFilters) {
  const today = dateParts();
  const range = selectedRange(input.range);
  if (range === "custom") {
    const from = safeDate(input.from, today), to = safeDate(input.to, today);
    return from <= to ? { range, from, to } : { range, from: to, to: from };
  }
  if (range === "month") return { range, from: `${today.slice(0, 8)}01`, to: today };
  if (range === "week") {
    const [year, month, day] = today.split("-").map(Number);
    const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay() || 7;
    return { range, from: addCalendarDays(today, 1 - weekday), to: today };
  }
  return { range, from: today, to: today };
}
function filterLabel(value: string | undefined) { return value?.trim().slice(0, 80) || ""; }

export async function getAnalyticsDashboard(input: AnalyticsFilters = {}): Promise<AnalyticsDashboard> {
  const { range, from, to } = period(input);
  const traffic = selectedTraffic(input.traffic);
  const page = selectedPage(input.page), pageSize = selectedPageSize(input.pageSize), offset = (page - 1) * pageSize;
  const channel = filterLabel(input.channel), country = filterLabel(input.country).toUpperCase(), search = filterLabel(input.search);
    const unavailable: AnalyticsDashboard = {
    connected: false, from, to, filters: { ...input, range, traffic, page, pageSize }, lastEventAt: null,
    totals: { views: 0, sessions: 0, visitors: 0, returning: 0, leads: 0, excluded: 0 },
    trend: [], channels: [], countries: [], devices: [], pages: [], visitors: [], totalRows: 0, profiles: [], profileTotalRows: 0, timeline: [], visitorJourney: null,
  };
  if (!sql) return unavailable;

  const sessionFilter = async () => sql<SessionRow[]>`
    select id::text, anonymous_session_id::text, visitor_key, visit_number, is_returning, country_code, channel, source,
      landing_path, exit_path, device_class, locale, event_count, started_at, traffic_class, exclusion_reason
    from visitor_sessions
    where site_id = ${SITE_ID} and started_at >= ${from}::date and started_at < (${to}::date + interval '1 day')
      and (${traffic} = 'all' or (${traffic} = 'valid' and traffic_class = 'valid') or (${traffic} = 'excluded' and traffic_class <> 'valid'))
      and (${channel} = '' or channel = ${channel})
      and (${country} = '' or country_code = ${country})
      and (${search} = '' or coalesce(landing_path,'') ilike '%' || ${search} || '%' or coalesce(exit_path,'') ilike '%' || ${search} || '%' or coalesce(source,'') ilike '%' || ${search} || '%')
    order by started_at desc limit ${pageSize} offset ${offset}`;

  try {
    const [totalsRows, excludedRows, trendRows, channelRows, countryRows, deviceRows, pageRows, visitorRows, countRows, lastEventRows] = await Promise.all([
      sql<{ views: string; sessions: string; visitors: string; returning: string; leads: string }[]>`
        select coalesce((select sum(page_views) from page_metrics where site_id = ${SITE_ID} and source = 'first_party' and metric_date >= ${from}::date and metric_date <= ${to}::date), 0)::text as views,
          count(*)::text as sessions, count(distinct visitor_key)::text as visitors,
          count(*) filter (where is_returning)::text as returning,
          coalesce((select sum(conversions) from page_metrics where site_id = ${SITE_ID} and source = 'first_party' and metric_date >= ${from}::date and metric_date <= ${to}::date), 0)::text as leads
        from visitor_sessions where site_id = ${SITE_ID} and traffic_class = 'valid' and started_at >= ${from}::date and started_at < (${to}::date + interval '1 day')`,
      sql<{ count: string }[]>`select count(*)::text as count from visitor_sessions where site_id = ${SITE_ID} and traffic_class <> 'valid' and started_at >= ${from}::date and started_at < (${to}::date + interval '1 day')`,
      sql<{ label: string; views: number; visitors: number; leads: number }[]>`
        select to_char(metric_date, 'MM-DD') as label, coalesce(sum(page_views),0)::int as views, coalesce(sum(unique_visitors),0)::int as visitors, coalesce(sum(conversions),0)::int as leads
        from page_metrics where site_id = ${SITE_ID} and source = 'first_party' and metric_date >= ${from}::date and metric_date <= ${to}::date group by metric_date order by metric_date`,
      sql<{ label: string; value: number }[]>`
        select coalesce(nullif(channel,''),'direct') as label, count(*)::int as value from visitor_sessions
        where site_id = ${SITE_ID} and traffic_class = 'valid' and started_at >= ${from}::date and started_at < (${to}::date + interval '1 day') group by 1 order by 2 desc limit 8`,
      sql<{ label: string; value: number }[]>`
        select coalesce(nullif(country_code,''),'未知') as label, count(*)::int as value from visitor_sessions
        where site_id = ${SITE_ID} and traffic_class = 'valid' and started_at >= ${from}::date and started_at < (${to}::date + interval '1 day') group by 1 order by 2 desc limit 8`,
      sql<{ label: string; value: number }[]>`
        select coalesce(nullif(device_class,''),'unknown') as label, count(*)::int as value from visitor_sessions
        where site_id = ${SITE_ID} and traffic_class = 'valid' and started_at >= ${from}::date and started_at < (${to}::date + interval '1 day') group by 1 order by 2 desc limit 6`,
      sql<{ path: string; views: number; visitors: number; leads: number }[]>`
        select path, sum(page_views)::int as views, sum(unique_visitors)::int as visitors, sum(conversions)::int as leads
        from page_metrics where site_id = ${SITE_ID} and source = 'first_party' and metric_date >= ${from}::date and metric_date <= ${to}::date group by path order by views desc limit 12`,
      sessionFilter(),
      sql<{ count: string }[]>`
        select count(*)::text as count from visitor_sessions
        where site_id = ${SITE_ID} and started_at >= ${from}::date and started_at < (${to}::date + interval '1 day')
          and (${traffic} = 'all' or (${traffic} = 'valid' and traffic_class = 'valid') or (${traffic} = 'excluded' and traffic_class <> 'valid'))
          and (${channel} = '' or channel = ${channel}) and (${country} = '' or country_code = ${country})
          and (${search} = '' or coalesce(landing_path,'') ilike '%' || ${search} || '%' or coalesce(exit_path,'') ilike '%' || ${search} || '%' or coalesce(source,'') ilike '%' || ${search} || '%')`,
      sql<{ occurred_at: string }[]>`select occurred_at::text from analytics_events where site_id = ${SITE_ID} and traffic_class = 'valid' order by occurred_at desc limit 1`,
    ]);
    const ids = visitorRows.map((row) => row.anonymous_session_id).filter(Boolean);
    const paths = ids.length ? await sql<{ anonymous_session_id: string; path_summary: string }[]>`
      select anonymous_session_id, string_agg(distinct path, ' → ' order by path) as path_summary
      from analytics_events where site_id = ${SITE_ID} and anonymous_session_id = any(${sql.array(ids as string[])}) group by anonymous_session_id` : [];
    const pathMap = new Map(paths.map((row) => [row.anonymous_session_id, row.path_summary]));
    const activeSession = filterLabel(input.session);
    const activeVisitor = filterLabel(input.visitor);
    const timeline = activeSession ? await sql<{ event_name: string; path: string | null; occurred_at: string }[]>`
      select event_name, path, occurred_at::text from analytics_events where site_id = ${SITE_ID} and anonymous_session_id = ${activeSession}
      order by occurred_at asc limit 100` : [];

    const [profileRows, profileCountRows] = await Promise.all([
      sql<{ visitor_key: string; visits: number; returning_visits: number; events: number; first_seen: string; last_seen: string; country: string | null; channel: string | null; source: string | null; landing: string | null; exit: string | null; device: string | null; locale: string | null }[]>`
        select visitor_key, count(*)::int as visits, count(*) filter (where is_returning)::int as returning_visits,
          coalesce(sum(event_count), 0)::int as events, min(started_at)::text as first_seen, max(last_event_at)::text as last_seen,
          (array_agg(country_code order by last_event_at desc))[1] as country, (array_agg(channel order by last_event_at desc))[1] as channel,
          (array_agg(source order by last_event_at desc))[1] as source, (array_agg(landing_path order by last_event_at desc))[1] as landing,
          (array_agg(exit_path order by last_event_at desc))[1] as exit, (array_agg(device_class order by last_event_at desc))[1] as device,
          (array_agg(locale order by last_event_at desc))[1] as locale
        from visitor_sessions where site_id = ${SITE_ID} and visitor_key is not null and started_at >= ${from}::date and started_at < (${to}::date + interval '1 day')
          and (${traffic} = 'all' or (${traffic} = 'valid' and traffic_class = 'valid') or (${traffic} = 'excluded' and traffic_class <> 'valid'))
          and (${channel} = '' or channel = ${channel}) and (${country} = '' or country_code = ${country})
          and (${search} = '' or coalesce(landing_path,'') ilike '%' || ${search} || '%' or coalesce(exit_path,'') ilike '%' || ${search} || '%' or coalesce(source,'') ilike '%' || ${search} || '%')
        group by visitor_key order by max(last_event_at) desc limit ${pageSize} offset ${offset}`,
      sql<{ count: string }[]>`
        select count(distinct visitor_key)::text as count from visitor_sessions where site_id = ${SITE_ID} and visitor_key is not null and started_at >= ${from}::date and started_at < (${to}::date + interval '1 day')
          and (${traffic} = 'all' or (${traffic} = 'valid' and traffic_class = 'valid') or (${traffic} = 'excluded' and traffic_class <> 'valid'))
          and (${channel} = '' or channel = ${channel}) and (${country} = '' or country_code = ${country})
          and (${search} = '' or coalesce(landing_path,'') ilike '%' || ${search} || '%' or coalesce(exit_path,'') ilike '%' || ${search} || '%' or coalesce(source,'') ilike '%' || ${search} || '%')`,
    ]);
    const profiles: VisitorProfileRow[] = profileRows.map((row) => ({
      visitorKey: row.visitor_key, visitor: row.visitor_key.slice(0, 12), visits: number(row.visits), returningVisits: number(row.returning_visits), events: number(row.events),
      firstSeen: displayTime(row.first_seen), lastSeen: displayTime(row.last_seen), country: row.country || "未知", channel: row.channel || "direct", source: row.source || "—",
      landing: row.landing || "—", exit: row.exit || "—", device: row.device || "—", locale: row.locale || "—",
    }));
    let visitorJourney: VisitorJourney | null = null;
    if (activeVisitor) {
      const [journeySessionRows, journeyEventRows] = await Promise.all([
        sql<SessionRow[]>`select id::text, anonymous_session_id::text, visitor_key, visit_number, is_returning, country_code, channel, source, landing_path, exit_path, device_class, locale, event_count, started_at, traffic_class, exclusion_reason
          from visitor_sessions where site_id = ${SITE_ID} and visitor_key = ${activeVisitor} and traffic_class = 'valid' order by started_at asc limit 200`,
        sql<{ event_name: string; path: string | null; occurred_at: string; anonymous_session_id: string }[]>`select event_name, path, occurred_at::text, anonymous_session_id::text from analytics_events
          where site_id = ${SITE_ID} and visitor_key = ${activeVisitor} and traffic_class = 'valid' order by occurred_at asc limit 1000`,
      ]);
      const sessionPaths = journeySessionRows.length ? await sql<{ anonymous_session_id: string; path_summary: string }[]>`
        select anonymous_session_id, string_agg(event_name || ': ' || coalesce(path, '—'), ' → ' order by occurred_at) as path_summary
        from analytics_events where site_id = ${SITE_ID} and anonymous_session_id = any(${sql.array(journeySessionRows.map((row) => row.anonymous_session_id))}) group by anonymous_session_id` : [];
      const journeyPathMap = new Map(sessionPaths.map((row) => [row.anonymous_session_id, row.path_summary]));
      const latest = profiles.find((item) => item.visitorKey === activeVisitor) || {
        visitorKey: activeVisitor, visitor: activeVisitor.slice(0, 12), visits: journeySessionRows.length, returningVisits: journeySessionRows.filter((row) => row.is_returning).length,
        events: journeySessionRows.reduce((sum, row) => sum + number(row.event_count), 0), firstSeen: displayTime(journeySessionRows[0]?.started_at || null),
        lastSeen: displayTime(journeySessionRows.at(-1)?.started_at || null), country: journeySessionRows.at(-1)?.country_code || "未知",
        channel: journeySessionRows.at(-1)?.channel || "direct", source: journeySessionRows.at(-1)?.source || "—",
        landing: journeySessionRows[0]?.landing_path || "—", exit: journeySessionRows.at(-1)?.exit_path || "—",
        device: journeySessionRows.at(-1)?.device_class || "—", locale: journeySessionRows.at(-1)?.locale || "—",
      };
      visitorJourney = {
        visitor: latest,
        sessions: journeySessionRows.map((row) => ({ id: row.anonymous_session_id, visitor: activeVisitor.slice(0, 12), visitNumber: row.visit_number || null, returning: Boolean(row.is_returning), country: row.country_code || "未知", channel: row.channel || "direct", source: row.source || "—", landing: row.landing_path || "—", exit: row.exit_path || "—", device: row.device_class || "—", locale: row.locale || "—", events: number(row.event_count), startedAt: displayTime(row.started_at), trafficClass: row.traffic_class || "valid", excludedReason: row.exclusion_reason, pathSummary: journeyPathMap.get(row.anonymous_session_id) || "暂未记录路径事件" })),
        events: journeyEventRows.map((row) => ({ event: row.event_name, path: row.path || "—", at: displayTime(row.occurred_at), session: row.anonymous_session_id })),
      };
    }

    return {
      connected: true, from, to, filters: { ...input, range, traffic, page, pageSize }, lastEventAt: lastEventRows[0]?.occurred_at || null,
      totals: { views: number(totalsRows[0]?.views), sessions: number(totalsRows[0]?.sessions), visitors: number(totalsRows[0]?.visitors), returning: number(totalsRows[0]?.returning), leads: number(totalsRows[0]?.leads), excluded: number(excludedRows[0]?.count) },
      trend: trendRows, channels: channelRows, countries: countryRows, devices: deviceRows, pages: pageRows,
      visitors: visitorRows.map((row) => ({ id: row.anonymous_session_id, visitor: row.visitor_key ? row.visitor_key.slice(0, 12) : "历史会话", visitNumber: row.visit_number || null, returning: Boolean(row.is_returning), country: row.country_code || "未知", channel: row.channel || "direct", source: row.source || "—", landing: row.landing_path || "—", exit: row.exit_path || "—", device: row.device_class || "—", locale: row.locale || "—", events: number(row.event_count), startedAt: displayTime(row.started_at), trafficClass: row.traffic_class || "valid", excludedReason: row.exclusion_reason, pathSummary: pathMap.get(row.anonymous_session_id) || "暂未记录路径事件" })),
      totalRows: number(countRows[0]?.count), profiles, profileTotalRows: number(profileCountRows[0]?.count),
      timeline: timeline.map((row) => ({ event: row.event_name, path: row.path || "—", at: displayTime(row.occurred_at) })), visitorJourney,
    };
  } catch {
    return unavailable;
  }
}
