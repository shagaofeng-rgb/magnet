-- Additive, versioned source catalogue. Replacing a source list archives the
-- prior version and preserves provenance and health history.
create table if not exists news_source_catalog_versions (
  id uuid primary key,
  site_id text not null references sites(id),
  name text not null,
  raw_checksum text not null,
  raw_file_name text not null,
  status text not null check (status in ('draft', 'active', 'archived')),
  replaces_version_id uuid references news_source_catalog_versions(id),
  created_at timestamptz not null default now(),
  activated_at timestamptz,
  unique(site_id, raw_checksum)
);

create table if not exists news_sources (
  id uuid primary key,
  site_id text not null references sites(id),
  catalog_version_id uuid not null references news_source_catalog_versions(id),
  source_ordinal integer not null,
  raw_entry text not null,
  name text not null,
  requested_domain text not null,
  canonical_domain text,
  feed_url text,
  source_group text not null,
  industry_tags jsonb not null default '[]'::jsonb,
  content_languages jsonb not null default '["en"]'::jsonb,
  discovery_methods jsonb not null default '[]'::jsonb,
  tier text not null,
  active boolean not null default false,
  validation_status text not null default 'pending',
  robots_allowed boolean,
  last_checked_at timestamptz,
  last_used_at timestamptz,
  use_count integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(catalog_version_id, source_ordinal)
);

create table if not exists news_source_health_checks (
  id uuid primary key,
  source_id uuid not null references news_sources(id) on delete cascade,
  checked_at timestamptz not null default now(),
  http_status integer,
  robots_allowed boolean,
  method text,
  detail jsonb not null default '{}'::jsonb
);

create index if not exists news_sources_catalog_state on news_sources(site_id, catalog_version_id, validation_status, active);
create index if not exists news_sources_rotation on news_sources(site_id, canonical_domain, last_used_at);
