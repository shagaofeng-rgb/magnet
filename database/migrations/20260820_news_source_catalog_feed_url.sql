-- A feed endpoint is discovered only after a robots-permitted, low-rate source
-- health check. Root domains are never assumed to be RSS endpoints.
alter table news_sources add column if not exists feed_url text;

create index if not exists news_sources_feed_health
  on news_sources(site_id, catalog_version_id, validation_status, active, last_checked_at);
