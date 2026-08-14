# BZMAGNET News automation deployment report

Date: 2026-08-14

## Implemented

- Replaced the former no-op editorial Cron endpoints with the single News workflow: review every 12 hours and a daily 09:00 Asia/Shanghai publication window (01:00 UTC).
- Enforced a database-backed 48-hour `last_successful_publish_at` gate, one-item cap, idempotent source fingerprints, event fingerprints, title/content similarity checks and a database lock.
- Added a strict state machine: `discovered → fetched → verified → planned → generated → quality_checked → scheduled → publishing → published`, with `needs_review`, `failed` and `archived` failure states.
- Kept Blog outside all automatic routes, tables and write logic.
- Added source recency, licence-note, source trust, product-family/media, internal-link, structured content, metadata, canonical, FAQ, schema and post-publish HTTP gate checks.
- Added dynamic News lists/detail routes, NewsArticle/FAQ/Breadcrumb schema, primary and Google News sitemaps, Robots sitemap entries and homepage latest-News rendering.
- Added additive PostgreSQL migration, run logs, locks, candidate/article history, environment template and source policy documents.

## Verification

- `pnpm typecheck`: passed.
- `pnpm test`: 30 passed.
- `pnpm lint`: no errors; one pre-existing `SiteHeader.tsx` React Hook warning remains.
- `pnpm build`: passed; public boundary guard passed.

## Production configuration status

At the final pre-deployment check, the BZMAGNET Vercel production project had no environment variables. The code is deployable but cannot persist or publish News until the following server-only values are configured:

1. `CRON_SECRET`
2. `NEWS_DATABASE_URL` (then run `pnpm news:migrate` against that private database)
3. `NEWS_SOURCE_FEEDS` with trusted HTTPS RSS/Atom feeds and licence notes
4. `NEWS_GENERATOR_WEBHOOK_URL` and `NEWS_GENERATOR_TOKEN` for a structured, source-bounded generator
5. Optional `GOOGLE_SEARCH_CONSOLE_SITEMAP_WEBHOOK_URL` and token for the approved sitemap submission integration

Until then, Cron calls are authenticated and fail closed: no article is fabricated, no Blog record is written and no News page is published. “Sitemap submitted” is logged as a request, never represented as Google indexing.

## Rollback

Rollback is a Vercel alias rollback to the prior production deployment. At content level, a failed post-publish route check moves the article from `published` to `needs_review` and retains the candidate, article JSON and run-log reason for remediation.
