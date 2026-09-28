---
name: test-and-build
description: Test, typecheck, lint, build, and browser-check the ABK Open Mic site. Use when validating changes, reproducing build problems, or preparing a release with the Copilot Sheets secret.
---

# Test and build the site

## Preparation

1. Work from the repository root; read `AGENTS.md`, `package.json`, and the
   affected architecture before changing behavior. Use absolute repository
   paths when referring to files.
2. Use Node.js 22 or later and `npm ci` to install the lockfile. The gear page
   uses `Map.groupBy`, which Node.js 20 lacks. Do not upgrade dependencies or
   introduce a new test runner just to run checks.
3. Before editing Next.js code, read the relevant installed docs under
   `node_modules/next/dist/docs/`. Check installed Next.js/MUI versions before
   changing providers or cache APIs.

## Fast checks (no Sheets credentials needed)

Run the existing scripts:

```bash
npm run lint
npx --no-install next typegen
npm run typecheck
npm test
```

`next typegen` creates the route types referenced by TypeScript on a fresh
checkout; run it before typecheck, not concurrently. Do not commit generated
`next-env.d.ts`, `.next`, or TypeScript build information.

For a focused change, use the existing Node test runner through installed tsx:

```bash
npx --no-install tsx --test src/lib/historical-program.test.ts
npx --no-install tsx --test src/lib/last-known-good.test.ts
```

`npm test` covers historical parsing, last-known-good timestamp preservation,
and relative-time formatting. Synthetic data belongs only in tests. The tests
do not exercise live Sheets access or full Next.js cache regeneration.

## Production build

The Copilot environment supplies JSON in `SHEETS`; the application expects
`SHEETS_SERVICE_ACCOUNT`. Map it for each command, without printing it or
writing a credential file:

```bash
SHEETS_SERVICE_ACCOUNT="${SHEETS:?SHEETS agent secret is required}" npm run build
```

If `SHEETS` is missing, stop the credential-dependent checks and ask a maintainer
to configure **Settings → Environments → copilot → Environment secrets**, then
start a new agent session. Report other checks independently. Do not fake data
or change application credential handling to make a build pass.

Local maintainers and Vercel use `SHEETS_SERVICE_ACCOUNT` directly through
their environment or local ignored `.env.local`, as described in the README.
The service account must have Viewer access, with Google auth and Sheets API
network access available. Never use `NEXT_PUBLIC_` credentials, `set -x`, or
print environment variables, raw Google error objects, or private sheet rows.

## Browser verification

For development in the agent environment:

```bash
SHEETS_SERVICE_ACCOUNT="${SHEETS:?SHEETS agent secret is required}" npm run dev
```

To inspect the production result after building:

```bash
SHEETS_SERVICE_ACCOUNT="${SHEETS:?SHEETS agent secret is required}" npm run start
```

Run only one server per port and stop it when finished. With the available
browser tooling, check `/`, `/past-events`, all three event overview and song
routes, `/past-events/may-2026/schedule`, `/past-events/may-2026/gear`, and
the legacy `/schedule`, `/songs`, and `/gear` redirects.
Check the home brand link, both CTAs, narrow and wide layouts, keyboard
navigation, and relevant loading/unavailable states. Check event pages'
server timestamp, client-relative text, timer updates, and freshness after
navigation; failures must not advance a last-known-good timestamp. Do not add
browser dependencies: no automated browser suite is configured.

A successful build is not proof that Sheets data loaded: failures can produce
the unavailable state. Confirm that approved event content actually renders.
Check that no credentials, contacts, or draft fields appear in rendered HTML,
client payloads, console output, or screenshots intended for sharing. Inspect
only approved public content; do not copy raw responses into reports.

For cache changes, verify the `minutes` profile against installed docs and
account for request-driven regeneration and per-instance fallback. Do not
edit the live spreadsheet to test refresh; use synthetic fixtures or a
maintainer-approved test source.

Report commands and pass/fail results, browser coverage, and blockers
separately. Never claim checks ran if they were skipped or network-blocked.
