# Deployment runbook

1. Configure only BZMAGNET-owned environment values from `.env.example`.
2. Run `npm ci`, `npm run guard:public`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run report:similarity` and `npm run build`.
3. Crawl all five locale outputs and confirm canonical, hreflang, JSON-LD, sitemap and robots use the final origin.
4. QA 375, 768 and 1440 px, including Arabic RTL and form errors.
5. Deploy a preview. Do not promote while translations, product-image rights, private persistence or similarity review remain unresolved.
6. Record deployment ID and keep the prior production target available for rollback.
