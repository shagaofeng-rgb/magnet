-- Additive migration for the BZMAGNET News automation store.
-- Apply only after the base admin schema has created `sites`.
create table if not exists news_candidates (
  id uuid primary key,
  site_id text not null references sites(id),
  status text not null,
  source_fingerprint text not null,
  event_fingerprint text not null,
  discovered_at timestamptz not null,
  updated_at timestamptz not null default now(),
  article_id uuid,
  candidate jsonb not null,
  rejection_reasons jsonb not null default '[]'::jsonb,
  unique(site_id, source_fingerprint)
);
create table if not exists news_articles (
  id uuid primary key,
  site_id text not null references sites(id),
  candidate_id uuid references news_candidates(id),
  locale text not null,
  content_type text not null check (content_type in ('company_news','industry_news')),
  status text not null,
  slug text not null,
  title text not null,
  content_fingerprint text not null,
  article jsonb not null,
  published_at timestamptz,
  modified_at timestamptz,
  created_at timestamptz not null default now(),
  unique(site_id, locale, slug)
);
create table if not exists news_runs (
  id uuid primary key,
  site_id text not null references sites(id),
  kind text not null check (kind in ('review','publish')),
  status text not null,
  started_at timestamptz not null,
  finished_at timestamptz,
  details jsonb not null default '{}'::jsonb
);
create table if not exists news_locks (lock_key text primary key, token uuid not null, expires_at timestamptz not null);
create index if not exists news_candidates_site_status on news_candidates(site_id, status, discovered_at desc);
create index if not exists news_articles_site_status on news_articles(site_id, status, published_at desc);
create index if not exists news_articles_fingerprint on news_articles(site_id, content_fingerprint);
