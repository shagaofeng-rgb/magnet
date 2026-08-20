# BZMAGNET News source catalog

Do not place a source list directly in an environment variable. Import a dated raw
source-list file with `npm run news:sources:import -- --file <path> --name <name>`.

The importer creates a draft catalog version. It does not crawl, activate, or
publish from a source automatically. After low-frequency robots and health review,
activate the version explicitly with `--activate --confirm-replace`. Previous
versions remain archived for audit and rollback.

Raw entries are retained exactly as supplied. A malformed or unavailable entry is
marked for review rather than silently corrected or removed.
