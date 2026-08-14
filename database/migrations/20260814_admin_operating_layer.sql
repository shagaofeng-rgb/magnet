-- Additive operating layer for the BZMAGNET admin. All operational rows are site scoped.
create table if not exists site_settings (
  site_id text not null references sites(id),
  setting_key text not null,
  value jsonb not null default '{}'::jsonb,
  updated_by text,
  updated_at timestamptz not null default now(),
  primary key (site_id, setting_key)
);

create table if not exists catalog_records (
  id uuid primary key,
  site_id text not null references sites(id),
  record_type text not null check (record_type in ('category','series','product','model','parameter','option')),
  parent_id uuid,
  status text not null check (status in ('draft','review','approved','published','archived')),
  locale text not null default 'en',
  title text not null,
  slug text,
  payload jsonb not null default '{}'::jsonb,
  revision integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(site_id, record_type, locale, slug)
);

create table if not exists content_records (
  id uuid primary key,
  site_id text not null references sites(id),
  content_type text not null check (content_type in ('company_news','industry_news','blog')),
  locale text not null,
  status text not null check (status in ('draft','review','approved','published','needs_revision','archived')),
  title text not null,
  slug text not null,
  payload jsonb not null default '{}'::jsonb,
  author_id uuid references users(id),
  reviewer_id uuid references users(id),
  published_at timestamptz,
  modified_at timestamptz,
  created_at timestamptz not null default now(),
  unique(site_id, locale, slug)
);

create table if not exists content_versions (
  id uuid primary key,
  site_id text not null references sites(id),
  content_id uuid not null references content_records(id),
  version integer not null,
  snapshot jsonb not null,
  created_by uuid references users(id),
  change_reason text,
  created_at timestamptz not null default now(),
  unique(content_id, version)
);

alter table content_records add column if not exists updated_at timestamptz not null default now();

create table if not exists seo_metrics (
  id uuid primary key,
  site_id text not null references sites(id),
  url text not null,
  locale text,
  metric_date date not null,
  clicks integer,
  impressions integer,
  ctr numeric(8,5),
  average_position numeric(8,3),
  source text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(site_id, url, metric_date, source)
);

create table if not exists link_audits (
  id uuid primary key,
  site_id text not null references sites(id),
  source_url text not null,
  target_url text,
  link_type text not null check (link_type in ('internal','external','redirect','orphan')),
  anchor_text text,
  http_status integer,
  severity text not null check (severity in ('info','low','medium','high','critical')),
  status text not null check (status in ('open','ignored','fixed','recheck')),
  evidence jsonb not null default '{}'::jsonb,
  first_seen_at timestamptz not null default now(),
  last_checked_at timestamptz not null default now()
);

create table if not exists visitor_sessions (
  id uuid primary key,
  site_id text not null references sites(id),
  anonymous_session_id text not null,
  channel text,
  landing_path text,
  exit_path text,
  country_code text,
  device_class text,
  locale text,
  consented_at timestamptz,
  started_at timestamptz not null,
  ended_at timestamptz,
  event_count integer not null default 0,
  converted_lead_id uuid references form_leads(id),
  unique(site_id, anonymous_session_id)
);

create table if not exists page_metrics (
  id uuid primary key,
  site_id text not null references sites(id),
  path text not null,
  locale text,
  metric_date date not null,
  page_views integer,
  unique_visitors integer,
  conversions integer,
  lcp_ms integer,
  inp_ms integer,
  cls numeric(8,4),
  source text not null,
  created_at timestamptz not null default now(),
  unique(site_id, path, metric_date, source)
);

create table if not exists privacy_requests (
  id uuid primary key,
  site_id text not null references sites(id),
  request_type text not null check (request_type in ('access','export','delete')),
  status text not null check (status in ('received','verifying','completed','rejected')),
  requester_hash text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table form_leads add column if not exists lead_status text not null default 'new';
alter table form_leads add column if not exists assigned_to uuid references users(id);
alter table form_leads add column if not exists spam_score integer not null default 0;
alter table form_leads add column if not exists updated_at timestamptz not null default now();
alter table form_leads add column if not exists last_follow_up_at timestamptz;
create index if not exists catalog_records_site_type on catalog_records(site_id, record_type, status, updated_at desc);
create index if not exists content_records_site_status on content_records(site_id, content_type, status, updated_at desc);
create index if not exists seo_metrics_site_url on seo_metrics(site_id, url, metric_date desc);
create index if not exists link_audits_site_status on link_audits(site_id, status, severity, last_checked_at desc);
create index if not exists visitor_sessions_site_started on visitor_sessions(site_id, started_at desc);
create index if not exists page_metrics_site_date on page_metrics(site_id, metric_date desc);
