# Site scaffolding — completed

This is an archived milestone, not a setup checklist. The application exists;
do not rerun `create-next-app` or overwrite it with generator output.
Use the [README](../README.md) to run it and the
[architecture](ARCHITECTURE.md) for its current behavior.

## Delivered baseline

- Next.js App Router with TypeScript, npm lockfile, and ESLint.
- MUI App Router integration, shared theme, responsive navigation, and Cache
  Components.
- Public, read-only pages and loading/unavailable states.
- Synthetic Events/Acts/Schedule parsing and publication-filtering tests.
- Lint, typecheck, unit-test, and production-build commands.

## Superseded assumptions

The initial Events/Acts/Schedule schema is not the live spreadsheet contract.
The original synthetic adapter and fixtures remain in `src/lib/program-data.ts`,
`src/lib/program.ts`, and `src/lib/synthetic-sheet.ts` with their tests, but the
public pages now use `src/lib/historical-program-data.ts`.

The historical site reads the private May 2026 timetable and gear tabs directly.
Songs replaced Acts, with `/acts` redirecting to `/songs`. Spreadsheet selection
is in the server-only adapter rather than an environment variable. No committed
credential example or browser-test runner was added.

See [the website update status](WEBSITE_UPDATE_PLAN.md) for the historical
milestone and remaining next-event decisions. Deployment settings and access
must be verified in their hosting environments; source code alone does not
establish that they are configured.
