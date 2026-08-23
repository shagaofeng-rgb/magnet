-- BZMAGNET first-party analytics quality layer.
-- Additive migration: preserves existing leads, sessions, events and aggregate metrics.

create table if not exists analytics_visitors (
  id uuid primary key,
  site_id text not null,
  visitor_key text not null,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  visit_count integer not null default 0,
  country_code text,
  country_region text,
  ip_hash text,
  user_agent_hash text,
  traffic_class text not null default 'valid',
  classification jsonb not null default '{}'::jsonb,
  unique (site_id, visitor_key)
);

alter table visitor_sessions add column if not exists visitor_key text;
alter table visitor_sessions add column if not exists visit_number integer;
alter table visitor_sessions add column if not exists is_returning boolean not null default false;
alter table visitor_sessions add column if not exists referrer_host text;
alter table visitor_sessions add column if not exists source text;
alter table visitor_sessions add column if not exists medium text;
alter table visitor_sessions add column if not exists campaign text;
alter table visitor_sessions add column if not exists campaign_content text;
alter table visitor_sessions add column if not exists campaign_term text;
alter table visitor_sessions add column if not exists country_region text;
alter table visitor_sessions add column if not exists ip_hash text;
alter table visitor_sessions add column if not exists user_agent_hash text;
alter table visitor_sessions add column if not exists traffic_class text not null default 'valid';
alter table visitor_sessions add column if not exists exclusion_reason text;
alter table visitor_sessions add column if not exists last_event_at timestamptz;

alter table analytics_events add column if not exists visitor_key text;
alter table analytics_events add column if not exists path text;
alter table analytics_events add column if not exists locale text;
alter table analytics_events add column if not exists traffic_class text not null default 'valid';
alter table analytics_events add column if not exists country_code text;
alter table analytics_events add column if not exists referrer_host text;
alter table analytics_events add column if not exists source text;
alter table analytics_events add column if not exists medium text;
alter table analytics_events add column if not exists campaign text;
alter table analytics_events add column if not exists event_id text;
alter table analytics_events add column if not exists received_at timestamptz not null default now();

create table if not exists analytics_page_visitors (
  site_id text not null,
  path text not null,
  metric_date date not null,
  visitor_key text not null,
  first_seen_at timestamptz not null default now(),
  primary key (site_id, path, metric_date, visitor_key)
);

create table if not exists analytics_exclusion_rules (
  id uuid primary key,
  site_id text not null,
  rule_type text not null,
  rule_value text not null,
  traffic_class text not null default 'test',
  active boolean not null default true,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, rule_type, rule_value)
);

create table if not exists analytics_sync_runs (
  id uuid primary key,
  site_id text not null,
  source text not null,
  status text not null,
  details jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create index if not exists analytics_visitors_site_last_seen_idx on analytics_visitors (site_id, last_seen_at desc);
create index if not exists visitor_sessions_quality_idx on visitor_sessions (site_id, traffic_class, started_at desc);
create index if not exists visitor_sessions_visitor_idx on visitor_sessions (site_id, visitor_key, started_at desc);
create index if not exists analytics_events_quality_idx on analytics_events (site_id, traffic_class, occurred_at desc);
create index if not exists analytics_events_session_idx on analytics_events (site_id, anonymous_session_id, occurred_at asc);
create index if not exists analytics_events_path_idx on analytics_events (site_id, path, occurred_at desc);
create index if not exists analytics_page_visitors_daily_idx on analytics_page_visitors (site_id, metric_date, path);
create unique index if not exists analytics_events_event_id_unique on analytics_events (site_id, event_id) where event_id is not null;
create index if not exists analytics_sync_runs_site_source_idx on analytics_sync_runs (site_id, source, started_at desc);
