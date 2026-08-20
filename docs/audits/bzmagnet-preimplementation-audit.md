# BZMAGNET product and News automation pre-implementation audit

Date: 2026-08-20  
Scope: read-only repository baseline; no production data, cron, deployment, or source-catalog changes were made while preparing this audit.

## Confirmed operating decisions

- Primary public origin: `https://bzmagnet.com` (pending DNS, Vercel and Search Console cross-check before release).
- Brand: BZMAGNET only.
- Default locale: English; supported locales: English, Spanish, Portuguese, Arabic and Russian.
- News maximum: one successfully published English News article every 48 hours.
- Blog remains outside automated publication.
- Source lists are versioned inputs. Replacing a list creates a new catalog version and preserves its import/audit history; it never silently changes an active source.

## Repository baseline

- Next.js App Router with TypeScript is in use.
- `NEXT_PUBLIC_SITE_ORIGIN` defaults to `https://bzmagnet.com`.
- Public robots allow crawl and disallow `/admin/` and `/api/`; sitemap and News sitemap are declared.
- The root route redirects to `/en`; locale routing includes `en`, `es`, `pt`, `ar`, and `ru`, with RTL layout for Arabic.
- Existing product detail URLs use locale-specific equipment segments, such as `/en/equipment/[slug]`.
- Existing configuration already has a protected 12-hour News review cron and a protected daily publish cron. The workflow enforces a 48-hour publication interval and currently defaults to safe `internal_review` mode.
- Existing News storage has durable candidates, articles, run records and distributed locks. Blog is excluded from automatic publication.
- The generated catalog has 88 imported/published records across four magnetic-separation families, with no duplicate locale slugs in the local dataset and no matching solar-tower/compressor terms in the local records.

## Risks and release blockers found before implementation

1. The current external source input is environment-variable feed JSON, not a versioned source catalog. It cannot safely preserve replacements, per-source health, robots status or rotation history.
2. Product detail pages are structurally mature but their extended technical sections currently render only for English. Localized full-detail publishing must be gated by reviewed locale content rather than presenting English operational copy as translated content.
3. The requested target product route shape differs from the existing indexed equipment route. A route registry and single-hop redirect map are required before any canonical change.
4. The locally provided 300-source list is explicitly provisional. It must not activate external crawling or auto-publication until a final source-list version is supplied, normalized, and verified.
5. Local runtime verification is currently constrained by an unavailable compatible Node executable. Build, typecheck and browser verification must be rerun in the Vercel-compatible CI/runtime before deployment.

## Public-page spot check

- The deployed English home, category and product detail endpoints were reachable during the audit.
- The deployed product detail endpoint still uses the old `/en/equipment/[slug]` shape. The repository migration introduces a category URL plus an explicit HTTP 301 alias rather than publishing two canonical detail pages.
- The sampled category and product descriptions are repetitive, catalogue-style prose. They are retained as factual baseline only; re-authoring is a separate truth-card-gated content task and is not treated as complete merely because a product is present.
- The sampled home and product HTML did not display an external source catalog or published automated News. This is expected while the verified source catalog and generator remain unconfigured.

## Required release readiness

No new product URL is added to the sitemap and no automated News item can publish unless all readiness checks pass:

- `primaryDomainResolved`
- `redirectChainPassed`
- `publicRobotsPassed`
- `canonicalAndHreflangPassed`
- `brandSeparationPassed`
- `productTruthCoveragePassed`
- `duplicateContentRiskPassed`
- `publicTemplateLeakCheckPassed`
- `cronAuthPassed`

## Migration safety rules

- Existing public URLs, product assets, enquiries and published records are retained.
- All data migrations are additive and reversible; no reset, bulk delete or blanket rewrite is permitted.
- Non-magnetic content is retained internally but removed from public navigation, search and sitemap only after classification and audit logging.
- Existing homepage-preview changes are a separate uncommitted workstream and are excluded from this product/News migration.
