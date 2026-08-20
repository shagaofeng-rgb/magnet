# BZMAGNET temporary News source catalog V1

## Scope

- Primary domain: `https://bzmagnet.com`
- Catalog name: Temporary V1 global industry source list
- Imported source count: 300
- Raw-list checksum: `6a6304477ff07932c3e96cfed8819fb41049d0f17bb8b7288fefdca8edcc9502`
- Catalog role: replaceable V1 input, not a permanent allow-list.

## Safe activation state

The catalog version is active so the worker can validate it, but every imported
source begins inactive. No source becomes eligible for automated collection
until all of the following are recorded: a permitted robots result, a reachable
HTTPS page, a same-host RSS or Atom endpoint, and a verified editorial tier.

The import retained all 300 raw entries. Two entries contain whitespace in the
requested domain and were automatically marked `needs_review`; they are never
silently corrected. Community entries (281–300) remain discovery-only and can
never independently support article facts.

## Replacement procedure

1. Import a new raw list as a draft with `npm run news:sources:import`.
2. Review the normalization and source-health records.
3. Explicitly activate the reviewed version; the prior version is archived,
   never deleted.
4. Re-run the readiness audit before allowing automatic publication.

No News article was generated or published during this import.
