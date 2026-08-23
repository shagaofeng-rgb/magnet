import "server-only";

import postgres from "postgres";

const cleanUrl = (value: string | undefined) => value?.trim().replace(/^(['"])(.*)\1$/, "$2") || undefined;
const databaseUrl = [process.env.ANALYTICS_CONNECTION_URL, process.env.ADMIN_DATABASE_URL, process.env.NEWS_DATABASE_URL, process.env.POSTGRES_URL, process.env.DATABASE_URL].map(cleanUrl).find(Boolean);
const sql = databaseUrl ? postgres(databaseUrl, { prepare: false, max: 5, idle_timeout: 10, connect_timeout: 10 }) : null;
const SITE_ID = "bzmagnet";
export type AnalyticsArea = "overview" | "traffic" | "visitors" | "page-performance" | "paths";
export type TrafficView = "valid" | "all" | "excluded";

export type AnalyticsFilters = {
  from?: string; to?: string; channel?: string; country?: string; traffic?: TrafficView;
  search?: string; page?: number; pageSize?: number; session?: string;
};
export type SessionRow = { id: string; anonymous_session_id: string; visitor_key: string | null; visit_number: number | null; is_returning: boolean | null; country_code: string | null; channel: string | null; source: string | null; landing_path: string | null; exit_path: string | null; device_class: string | null; locale: string | null; event_count: number | null; started_at: string; traffic_class: string | null; exclusion_reason: string | null; };
export type AnalyticsRow = {
  id: string; visitor: string; visitNumber: number | null; returning: boolean; country: string;
  channel: string; source: string; landing: string; exit: string; device: string; locale: string;
  events: number; startedAt: string; trafficClass: string; excludedReason: string | null; pathSummary: string;
};
export type AnalyticsDashboard = {
  connected: boolean; from: string; to: string; filters: Required<Pick<AnalyticsFilters, "traffic" | "page" | "pageSize">> & AnalyticsFilters;
  lastEventAt: string | null; totals: { views: number; sessions: number; visitors: number; returning: number; leads: number; excluded: number };
  trend: Array<{ label: string; views: number; visitors: number; leads: number }>;
  channels: Array<{ label: string; value: number }>; countries: Array<{ label: string; value: number }>;
  devices: Array<{ label: string; value: number }>; pages: Array<{ path: string; views: number; visitors: number; leads: number }>;
  visitors: AnalyticsRow[]; totalRows: number; timeline: Array<{ event: string; path: string; at: string }>;
};

const day = (value: Date) => value.toISOString().slice(0, 10);
const safeDate = (value: string | undefined, fallback: Date) => /^\d{4}-\d{2}-\d{2}$/.test(value || "") ? value! : day(fallback);
const number = (value: string | number | null | undefined) => Number(value || 0);
const selectedTraffic = (value: string | undefined): TrafficView => value === "all" || value === "excluded" ? value : "valid";
const selectedPageSize = (value: number | undefined) => [25, 50, 100].includes(Number(value)) ? Number(value) : 25;
const selectedPage = (value: number | undefined) => Math.max(1, Number(value) || 1);
const displayTime = (value: string | Date | null) => value ? new Date(value).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai", hour12: false }) : "—";

function period(input: AnalyticsFilters) {
  const now = new Date();
  const defaultStart = new Date(now);
  defaultStart.setUTCDate(defaultStart.getUTCDate() - 6);
  const from = safeDate(input.from, defaultStart);
  const to = safeDate(input.to, now);
  return from <= to ? { from, to } : { from: to, to: from };
}
function filterLabel(value: string | undefined) { return value?.trim().slice(0, 80) || ""; }

export async function getAnalyticsDashboard(input: AnalyticsFilters = {}): Promise<AnalyticsDashboard> {
  const { from, to } = period(input);
  const traffic = selectedTraffic(input.traffic);
  const page = selectedPage(input.page), pageSize = selectedPageSize(input.pageSize), offset = (page - 1) * pageSize;
  const channel = filterLabel(input.channel), country = filterLabel(input.country).toUpperCase(), search = filterLabel(input.search);
    const unavailable: AnalyticsDashboard = {
    connected: false, from, to, filters: { ...input, traffic, page, pageSize }, lastEventAt: null,
    totals: { views: 0, sessions: 0, visitors: 0, returning: 0, leads: 0, excluded: 0 },
    trend: [], channels: [], countries: [], devices: [], pages: [], visitors: [], totalRows: 0, timeline: [],
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
    const timeline = activeSession ? await sql<{ event_name: string; path: string | null; occurred_at: string }[]>`
      select event_name, path, occurred_at::text from analytics_events where site_id = ${SITE_ID} and anonymous_session_id = ${activeSession}
      order by occurred_at asc limit 100` : [];

    return {
      connected: true, from, to, filters: { ...input, traffic, page, pageSize }, lastEventAt: lastEventRows[0]?.occurred_at || null,
      totals: { views: number(totalsRows[0]?.views), sessions: number(totalsRows[0]?.sessions), visitors: number(totalsRows[0]?.visitors), returning: number(totalsRows[0]?.returning), leads: number(totalsRows[0]?.leads), excluded: number(excludedRows[0]?.count) },
      trend: trendRows, channels: channelRows, countries: countryRows, devices: deviceRows, pages: pageRows,
      visitors: visitorRows.map((row) => ({ id: row.anonymous_session_id, visitor: row.visitor_key ? row.visitor_key.slice(0, 12) : "历史会话", visitNumber: row.visit_number || null, returning: Boolean(row.is_returning), country: row.country_code || "未知", channel: row.channel || "direct", source: row.source || "—", landing: row.landing_path || "—", exit: row.exit_path || "—", device: row.device_class || "—", locale: row.locale || "—", events: number(row.event_count), startedAt: displayTime(row.started_at), trafficClass: row.traffic_class || "valid", excludedReason: row.exclusion_reason, pathSummary: pathMap.get(row.anonymous_session_id) || "暂未记录路径事件" })),
      totalRows: number(countRows[0]?.count),
      timeline: timeline.map((row) => ({ event: row.event_name, path: row.path || "—", at: displayTime(row.occurred_at) })),
    };
  } catch {
    return unavailable;
  }
}
