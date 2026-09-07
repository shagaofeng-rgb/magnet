# Search Console indexability remediation

## Scope

This release makes BZMAGNET product URLs canonical, removes incomplete localized product pages from XML sitemap discovery, and adds a server-side Search Console submission and inspection loop.

## URL policy

- Each product has one public path derived from its approved localized title and stable BZMAGNET UUID suffix.
- Historical generic slugs and locale equipment aliases issue one permanent redirect to that path.
- Unknown product URLs remain 404. Arbitrary text combined with a valid UUID suffix is never served as a second 200 page.
- A completed English product record is currently indexable. Localized product detail pages remain available to buyers but are marked noindex until their full product detail content is independently localized and reviewed.

## Sitemap policy

- `/robots.txt` references only `/sitemap-index.xml`.
- The sitemap index includes the canonical public sitemap and the time-limited News sitemap.
- XML product entries are emitted only for product pages currently eligible for indexing.
- Sitemap, robots and RSS discovery resources are exempt from visitor-country blocking. Public page geo controls remain in effect.

## Google Search Console operations

- `/api/cron/search-console-sync` imports performance data, then submits `/sitemap-index.xml`.
- `/api/cron/search-console-inspect` samples critical canonical URLs for Search Console inspection data.
- Each result is persisted in the site-scoped `site_settings` table without credentials.
- A sitemap submission is reported as submitted, not indexed. The Google Indexing API is intentionally not used for ordinary product, category or news pages.

## Required production configuration

- `SEARCH_CONSOLE_SITE_URL` must match the verified property, normally `sc-domain:bzmagnet.com`.
- The configured service account must be an authorized user with permission to submit sitemaps for that property.
- `CRON_SECRET` must be present so only Vercel Cron can trigger the endpoints.

## Release verification

1. Test canonical product URL, historical generic URL, locale equipment alias and unknown product URL.
2. Confirm only canonical, indexable URLs occur in `/sitemap.xml`.
3. Confirm `/sitemap-index.xml`, `/robots.txt` and `/news-sitemap.xml` return XML or text with HTTP 200.
4. Check the daily Cron result and persisted submission/inspection state.
5. Recheck Search Console coverage after 7, 14 and 28 days; do not interpret sitemap submission as indexing success.
