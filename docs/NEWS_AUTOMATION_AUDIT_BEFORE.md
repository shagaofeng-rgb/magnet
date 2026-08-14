# BZMAGNET News automation audit — before change

Date: 2026-08-14

- Public News and Blog routes existed, but only a static Blog seed was published.
- `editorial-review` ran every 12 hours and returned a no-op response.
- `editorial-publish` ran every 48 hours and always skipped publication because no private queue existed.
- Content was held in `lib/editorial.ts`; there was no durable candidate queue, publish lock, source policy, run log, article history or database migration.
- Blog and News shared a general editorial model, but no scheduler wrote Blog data.
- Vercel production had no News database, source-feed or generator variables configured at audit time.

No existing public content, product record, enquiry, media asset or deployment was deleted during this change.
