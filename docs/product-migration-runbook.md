# BZMAGNET product migration runbook

The source catalogue is read-only. All generated public IDs, slugs and media filenames belong to BZMAGNET; private source mapping stays under `data/private-migration/` and is ignored by Git.

## Commands

Use the bundled Node runtime or an installed Node.js 22 runtime:

```text
node scripts/migrate-approved-catalog.mjs <source-root> dry-run
node scripts/migrate-approved-catalog.mjs <source-root> report-only
node scripts/migrate-approved-catalog.mjs <source-root> import
node scripts/migrate-approved-catalog.mjs <source-root> update-approved-data
node scripts/migrate-approved-catalog.mjs <source-root> rollback
```

- `dry-run` evaluates source records without replacing the public catalogue.
- `report-only` refreshes private audits and count reports without replacing public data.
- `import` creates the BZMAGNET catalogue and copies approved product images.
- `update-approved-data` performs an idempotent refresh using the stable BZMAGNET UUID mapping.
- `rollback` removes generated public catalogue/media and must only be used when an earlier Git/deployment version is ready for restoration.

## Fact approval workflow

1. Review `reports/private/private-source-product-audit.csv` and the private inventory.
2. Resolve conflicts and verify the exact configuration, unit, conditions and approval source.
3. Change only the verified fact state to public in the isolated BZMAGNET data workflow; keep unresolved values `needs_confirmation`, `on_request` or hidden.
4. Run the import in `update-approved-data` mode.
5. Run public guard, typecheck, tests, lint, production build, similarity report and build-output scan.
6. Browser-test English and Arabic at 375, 768 and 1440 pixels before promotion.

Never commit private source URLs, credentials or the private mapping files.
