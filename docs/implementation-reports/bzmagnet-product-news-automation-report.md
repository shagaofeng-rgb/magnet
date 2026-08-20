# BZMAGNET product and News automation implementation report

## Current controlled-release status

- Primary public origin is `https://bzmagnet.com`; no alias is treated as a primary origin.
- Legacy locale product endpoints now have a single-hop 301 path to BZMAGNET-only category routes.
- The temporary V1 source catalog contains 300 retained entries and is versioned for replacement and rollback.
- V1 is active as the catalog selection, but has **zero eligible crawler sources** until bounded robots, reachability, feed-endpoint and editorial-tier checks pass.
- News can publish at most one item in any 48-hour window. Blog is not handled by the automated publisher.

## Release gate

Publication is blocked unless `NEWS_AUTO_PUBLISH`, release readiness flags, an approved generator, an active verified source, fact validation, similarity checks, citation checks, image-rights checks and post-publication route checks all pass. A failure moves the item to `needs_review`; the worker never substitutes an unrelated article.

## Verification performed in this environment

- Source parser counted ordinals 1–300 with no duplicates.
- The production source-catalog schema and V1 records were added additively; no existing article, product, inquiry or source record was deleted.
- TypeScript syntax checks passed for the edited source, News and admin modules.
- A public-source boundary scan found no Cowin domain references in public source files.

## Pending deployment verification

The local Windows Node/Git runtime currently terminates before commands start because the host does not support CET. Consequently `npm run lint`, `npm run typecheck`, test and production build must run in the Vercel build environment before production promotion. External source network checks were not recorded from this local execution environment; the deployed bounded worker is responsible for authoritative checks.
