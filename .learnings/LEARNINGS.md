# Workspace learnings

- 2026-08-30: The desktop shell has no system `node`. Use `/Users/apple/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node` directly for ESLint and other package entrypoints; the pnpm-generated ESLint launcher can lose the bundled Node path.
- 2026-08-30: The bundled pnpm is newer than the package metadata, so keep `pnpm-lock.yaml` frozen and confirm it remains unchanged after dependency installation.
