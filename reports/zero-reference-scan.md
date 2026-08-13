# Public boundary scan

The prebuild guard scans public source roots for denied source domains, legacy logo/asset identifiers, tracking remnants and technical placeholders. It intentionally excludes private migration files and scanner rule definitions.

On 2026-08-13, the production build produced 163 static HTML files. Rendered HTML/RSC/public-response scanning found zero denied source-brand references and zero public HTTP origins outside `bzmagnet.com` and `schema.org`. Internal Next.js build manifests were excluded because they contain local compiler dependency paths and are not public page output.
