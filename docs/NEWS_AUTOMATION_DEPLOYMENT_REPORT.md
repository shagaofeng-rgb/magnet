# BZMAGNET News automation deployment report

Updated: 2026-08-30

## Implemented

- Runs source discovery every six hours and invokes the publisher at three bounded retry windows per day. PostgreSQL still enforces one successful publication per 48 hours.
- Enforced a database-backed 48-hour `last_successful_publish_at` gate, one-item cap, idempotent source fingerprints, event fingerprints, title/content similarity checks and a database lock.
- Added a strict state machine: `discovered → fetched → verified → planned → generated → quality_checked → scheduled → publishing → published`, with `needs_review`, `failed` and `archived` failure states.
- Kept Blog outside all automatic routes, tables and write logic.
- Added direct canonical source evidence verification, an internal source-bound BZMAGNET writer, product/media, internal-link, structured content, metadata, canonical, GEO answer structure, FAQ and brand-boundary checks.
- The internal writer removes the external generator and manual article-approval dependency. Failed evidence or quality checks still move the candidate to `needs_review` and do not publish it.
- Added dynamic News lists/detail routes, NewsArticle/FAQ/Breadcrumb schema, primary and Google News sitemaps, Robots sitemap entries and homepage latest-News rendering.
- Added additive PostgreSQL migration, run logs, locks, candidate/article history, environment template and source policy documents.

## Verification

- `pnpm typecheck`: passed.
- `pnpm test`: 30 passed.
- `pnpm lint`: passed with no errors or warnings.
- `pnpm build`: passed; public boundary guard passed.

## Production configuration

The BZMAGNET Neon database and verified source catalog are the durable inputs. `NEWS_AUTOMATION_MODE=external_sources` enables the fully automatic path; `paused` is the emergency stop. Automatic publication is enabled unless `NEWS_AUTO_PUBLISH=false`. No external generator secret is required. Blog remains excluded from every automatic write path.

The publisher requires a valid Cron secret, at least one active verified source, complete BZMAGNET product truth records and successful evidence, SEO/GEO, similarity, media and public-delivery checks. “Sitemap submitted” is logged as a request and is never represented as Google indexing.

## Rollback

Rollback is a Vercel alias rollback to the prior production deployment. At content level, a failed post-publish route check moves the article from `published` to `needs_review` and retains the candidate, article JSON and run-log reason for remediation.
