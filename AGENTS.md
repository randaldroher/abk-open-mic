# Project instructions

- Read [the architecture](docs/ARCHITECTURE.md) before changing product behavior, Google Sheets access, publication rules, or cache boundaries. Use [the scaffold plan](docs/SCAFFOLD_PLAN.md) for the initial setup; neither document implies that the site has already been built.
- **Before writing Next.js code, always consult the relevant up-to-date docs for the installed version** in `node_modules/next/dist/docs/`. Locate the appropriate App Router guide or API reference there, heed deprecation notices, and do not rely on remembered APIs. Before dependencies are installed, consult the [official Next.js docs index](https://nextjs.org/docs/llms.txt) and [AI agent guide](https://nextjs.org/docs/app/guides/ai-agents); confirm against bundled docs once Next.js is installed. When `next dev` adds a managed agent-rules block here, keep project-specific instructions outside it.
- Follow the App Router with TypeScript, Cache Components, and MUI's App Router integration. Check the installed Next.js and MUI versions before choosing providers or cache directives.
- The site is public and read-only: no website authentication, authorization, database, write endpoints, or sign-up forms. Read a private organizer-managed Google Sheet only on the server with a viewer service account and read-only scope; render only validated, published fields and never expose credentials or drafts. Resolve the architecture's consent and publication decisions before launching with real performer data.
- After scaffold, verify affected behavior with focused tests and run lint, typecheck, and build for release changes. Keep documentation aligned with material architecture decisions.

## Agent build credentials

- The Copilot environment provides the service-account JSON in the `SHEETS` secret. The server adapter expects `SHEETS_SERVICE_ACCOUNT`; map it for each build command rather than changing application code or writing credentials to disk.
- After `npm ci`, run from the repository root:

  ```bash
  SHEETS_SERVICE_ACCOUNT="${SHEETS:?SHEETS agent secret is required}" npm run build
  ```

- Use the same environment-variable assignment with `npm run dev` when checking pages locally. The assignment applies only to that command; repeat it in each new shell invocation.
- Never print secret values, enable shell tracing (`set -x`), commit credentials, or use a `NEXT_PUBLIC_` variable for them. If `SHEETS` is absent, ask a maintainer to configure it under **Settings → Environments → copilot → Environment secrets** and start a new agent session.
- Production prerendering reads Google Sheets, so the service account needs Viewer access to the configured spreadsheet and the environment must allow Google authentication and Sheets API requests.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
