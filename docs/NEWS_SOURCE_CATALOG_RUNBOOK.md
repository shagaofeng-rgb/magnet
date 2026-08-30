# BZMAGNET versioned News source-catalog runbook

## Replace a source list safely

1. Keep the user-supplied raw text in a dated file outside public assets.
2. Run a dry import. It parses entries but makes no database or network change.
3. Import the list as a draft version. This preserves every raw entry, including invalid and unavailable entries.
4. Complete low-frequency health and robots review. Mark only verified, robots-permitted feeds as active. Community sources remain discovery-only.
5. Review the draft catalog in **News 运营**, then activate it with the explicit replacement confirmation. The previous active version is archived, not deleted.

```powershell
npm run news:sources:import -- --file .\private\sources\bzmagnet-sources-YYYY-MM-DD.md --name "YYYY-MM-DD supplier list" --dry-run
npm run news:sources:import -- --file .\private\sources\bzmagnet-sources-YYYY-MM-DD.md --name "YYYY-MM-DD supplier list"
npm run news:sources:import -- --file .\private\sources\bzmagnet-sources-YYYY-MM-DD.md --name "YYYY-MM-DD supplier list" --activate --confirm-replace
```

## Automatic News publication

The deployed V2 workflow is fully automatic and does not wait for per-article approval. Production uses:

```ini
NEWS_AUTOMATION_MODE=external_sources
NEWS_AUTO_PUBLISH=true
```

Use `NEWS_AUTOMATION_MODE=paused` or `NEWS_AUTO_PUBLISH=false` as an emergency stop. The publish task remains limited by the durable 48-hour successful-publication gate. Blog is not an automated output type, and a failed source or quality gate is never overridden to satisfy the schedule.
