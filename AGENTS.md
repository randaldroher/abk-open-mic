# Project instructions

- Read [the architecture](docs/ARCHITECTURE.md) before changing product behavior, Google Sheets access, publication rules, or cache boundaries. The site already runs against the May 2026 historical spreadsheet; do not scaffold it again. [The website update plan](docs/WEBSITE_UPDATE_PLAN.md) records delivered work and next-event decisions. Synthetic data belongs only in tests.
- **Before writing Next.js code, always consult the relevant up-to-date docs for the installed version** in `node_modules/next/dist/docs/`. Locate the appropriate App Router guide or API reference there, heed deprecation notices, and do not rely on remembered APIs. Before dependencies are installed, consult the [official Next.js docs index](https://nextjs.org/docs/llms.txt) and [AI agent guide](https://nextjs.org/docs/app/guides/ai-agents); confirm against bundled docs once Next.js is installed. When `next dev` adds a managed agent-rules block here, keep project-specific instructions outside it.
- Follow the App Router with TypeScript, Cache Components, and MUI's App Router integration. Check the installed Next.js and MUI versions before choosing providers or cache directives.
- The site is public and read-only: no website authentication, authorization, database, write endpoints, or sign-up forms. Read the private organizer-managed Google Sheet only on the server with a viewer service account and read-only scope. The current historical adapter publishes selected ranges, not `published` flags; never point it at next-event drafts. Performer-name consent is confirmed for the historical site, not permission to expose contacts or private notes. Resolve the architecture's next-event publication decisions before switching data.
- Verify affected behavior with focused tests and run lint, typecheck, tests, and build for release changes. Keep documentation aligned with material architecture decisions.

## Repository skills

- Use [test-and-build](.github/skills/test-and-build/SKILL.md) for dependency setup, focused tests, release checks, and browser verification.
- Use [inspect-spreadsheet](.github/skills/inspect-spreadsheet/SKILL.md) to discover tabs and inspect selected spreadsheet ranges read-only when planning an event. Inspection does not authorize publishing new data.
- Spreadsheet layouts may change frequently during signup planning. Rediscover normalized column headers rather than assuming a column stays at a fixed position; the current adapter's positional mappings describe only the historical data.

## Google Sheets credentials

- On a local computer, use the existing `SHEETS_SERVICE_ACCOUNT` from the shell environment or the ignored `.env.local`; run commands directly and do not require a separate `SHEETS` variable.
- GitHub-hosted Copilot agents receive the service-account JSON in the `SHEETS` secret. The server adapter expects `SHEETS_SERVICE_ACCOUNT`; map `SHEETS` for each credential-dependent command rather than changing application code or writing credentials to disk. For example, after `npm ci`, run from the repository root:

  ```bash
  SHEETS_SERVICE_ACCOUNT="${SHEETS:?SHEETS agent secret is required}" npm run build
  ```

- For GitHub-hosted agent browser checks, use the same assignment with `npm run dev` or `npm run start`; it applies only to that command, so repeat it for each invocation. Local checks use the local credential directly.
- Never print secret values, enable shell tracing (`set -x`), commit credentials, or use a `NEXT_PUBLIC_` variable for them. If `SHEETS` is absent in the GitHub-hosted agent environment, ask a maintainer to configure it under **Settings → Environments → copilot → Environment secrets** and start a new agent session.
- Production prerendering reads Google Sheets, so the service account needs Viewer access to the configured spreadsheet and the environment must allow Google authentication and Sheets API requests.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
