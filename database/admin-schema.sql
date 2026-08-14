-- Provider-neutral PostgreSQL schema. Apply through the private migration runner only.
create table sites (id text primary key, name text not null, origin text not null unique, timezone text not null, locales jsonb not null, created_at timestamptz not null default now());
create table users (id uuid primary key, email text not null unique, status text not null check (status in ('active','disabled')), created_at timestamptz not null default now());
create table site_roles (site_id text not null references sites(id), user_id uuid not null references users(id), role text not null check (role in ('super_admin','site_admin','editor','content_reviewer','seo_analyst','sales','viewer')), primary key(site_id,user_id));
create table audit_logs (id uuid primary key, site_id text not null references sites(id), actor_id uuid references users(id), action text not null, target_type text not null, target_id text, before_json jsonb, after_json jsonb, reason text, created_at timestamptz not null default now());
create table admin_jobs (id uuid primary key, site_id text not null references sites(id), kind text not null, idempotency_key text not null, status text not null, payload jsonb not null default '{}'::jsonb, result jsonb, created_at timestamptz not null default now(), unique(site_id,idempotency_key));
create table media_assets (id uuid primary key, site_id text not null references sites(id), storage_key text not null, visibility text not null check (visibility in ('public','private','on_request')), approved boolean not null default false, metadata jsonb not null default '{}'::jsonb);
create table form_leads (id uuid primary key, site_id text not null references sites(id), status text not null, encrypted_payload bytea not null, attribution jsonb not null default '{}'::jsonb, created_at timestamptz not null default now());
create table analytics_events (id uuid primary key, site_id text not null references sites(id), anonymous_session_id text not null, event_name text not null, allowed_properties jsonb not null default '{}'::jsonb, occurred_at timestamptz not null);
create index analytics_events_site_time on analytics_events(site_id, occurred_at desc);
create index audit_logs_site_time on audit_logs(site_id, created_at desc);
create index form_leads_site_status on form_leads(site_id, status, created_at desc);

-- BZMAGNET News automation. These tables are additive and may be applied independently.
-- Blog remains file/CMS editorial content and is intentionally excluded from this scheduler.
create table news_candidates (
  id uuid primary key,
  site_id text not null references sites(id),
  status text not null check (status in ('discovered','fetched','verified','planned','generated','quality_checked','scheduled','publishing','published','needs_review','failed','archived')),
  source_fingerprint text not null,
  event_fingerprint text not null,
  discovered_at timestamptz not null,
  updated_at timestamptz not null default now(),
  article_id uuid,
  candidate jsonb not null,
  rejection_reasons jsonb not null default '[]'::jsonb,
  unique(site_id, source_fingerprint)
);
create table news_articles (
  id uuid primary key,
  site_id text not null references sites(id),
  candidate_id uuid references news_candidates(id),
  locale text not null,
  content_type text not null check (content_type in ('company_news','industry_news')),
  status text not null check (status in ('scheduled','publishing','published','needs_review','failed','archived')),
  slug text not null,
  title text not null,
  content_fingerprint text not null,
  article jsonb not null,
  published_at timestamptz,
  modified_at timestamptz,
  created_at timestamptz not null default now(),
  unique(site_id, locale, slug)
);
alter table news_candidates add constraint news_candidates_article_fk foreign key (article_id) references news_articles(id) deferrable initially deferred;
create table news_runs (
  id uuid primary key,
  site_id text not null references sites(id),
  kind text not null check (kind in ('review','publish')),
  status text not null check (status in ('running','succeeded','failed','skipped')),
  started_at timestamptz not null,
  finished_at timestamptz,
  details jsonb not null default '{}'::jsonb
);
create table news_locks (
  lock_key text primary key,
  token uuid not null,
  expires_at timestamptz not null
);
create index news_candidates_site_status on news_candidates(site_id, status, discovered_at desc);
create index news_articles_site_status on news_articles(site_id, status, published_at desc);
create index news_articles_fingerprint on news_articles(site_id, content_fingerprint);
