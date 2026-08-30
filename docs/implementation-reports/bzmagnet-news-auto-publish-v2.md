# BZMAGNET fully automatic News V2

Date: 2026-08-30

## Publication contract

- Discovery, canonical source evidence, product binding, structured writing, SEO/GEO validation, scheduling, publication and public delivery verification run without per-article approval.
- Every public URL, author, publisher, image, product link, CTA, canonical and structured-data publisher belongs to BZMAGNET.
- External reports are citations and industry context only. Their images are not copied, and their text is not reproduced as an article.
- One article may publish in a 48-hour window. Multiple daily publisher invocations are bounded retry opportunities, not additional publication slots.
- Missing evidence, an inaccessible source, duplicate content, unsupported claims, brand leakage, missing product truth or a failed public check moves the item to `needs_review`.

## Pipeline

1. Rotate through active, verified, robots-permitted RSS sources.
2. Normalize source items and persist deduplicated candidates.
3. Fetch the original source page, confirm its canonical domain and persist an evidence fingerprint.
4. Bind one approved BZMAGNET product and its verified product facts.
5. Generate a deterministic structured BZMAGNET industry-news document.
6. Enforce citation, structure, SEO, GEO, brand, media, product and similarity gates.
7. Schedule and publish the oldest eligible article under a durable database lock.
8. Verify the public detail, list, News sitemap, RSS, canonical, NewsArticle schema, source panel and brand boundary.
9. Withdraw a failed public delivery to `needs_review`.

## Emergency stop and rollback

- Set `NEWS_AUTOMATION_MODE=paused` or `NEWS_AUTO_PUBLISH=false` to stop future automatic work.
- Restore code from `backup/pre-bzmagnet-news-auto-publish-20260830` or roll the Vercel production alias back to the previous READY deployment.
- News tables were backed up before rollout; no product, inquiry, analytics, admin or historical News record is deleted by this implementation.
