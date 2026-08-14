# BZMAGNET News old-rule removal report

Date: 2026-08-14

Replaced:

- `/api/cron/editorial-review`: placeholder candidate-review response.
- `/api/cron/editorial-publish`: unconditional “publication skipped” response.
- `vercel.json` references to the two placeholder editorial routes.

Enabled replacement:

- `/api/cron/news-review` collects only configured, HTTPS, trusted-source feeds every 12 hours.
- `/api/cron/news-publish` runs once per day at 01:00 UTC (09:00 Asia/Shanghai) and the database enforces a minimum 48-hour interval and a single-article cap.
- Only `industry_news` and `company_news` can be persisted by the scheduler. `/blog` has no scheduler write path and remains editorial-only.

The replacement fails closed: missing storage, sources, generator credentials, evidence, product relevance, validation or final checks move work to `needs_review` or return a safe non-publication result.
