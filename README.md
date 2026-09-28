# ABK Open Mic Night

A public, read-only Next.js site for an open mic night. It presents a sanitized
historical preview of the May 2026 performance using a private Google Sheet.
The site is implemented and reads that sheet live; the next event is not
configured yet.

## Pages and documentation

- `/`: historical overview (also reached through the ABK Open Mic brand).
- `/schedule`, `/songs`, `/gear`: running order, song credits/videos, and equipment.
- `/acts`: redirect to `/songs`.

Read the [current architecture](docs/ARCHITECTURE.md) for data, publication, and
cache boundaries, and the [website update status](docs/WEBSITE_UPDATE_PLAN.md)
for next-event decisions. The [scaffold plan](docs/SCAFFOLD_PLAN.md) is archived,
not an instruction to regenerate the application. `docs/palette-options.svg`
is an earlier design reference, not the source of the active theme.

## Run locally

Use Node.js 22 or later and npm; the gear page uses `Map.groupBy`, which is
not available in Node.js 20. Configure the credentials below before starting
the site.

```bash
npm ci
npm run dev
```

The site is built with Next.js App Router, TypeScript, Cache Components, and
MUI. Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`
to verify changes.
Unit tests use synthetic inputs and need no Google credentials. Typecheck
includes generated Next.js types; on a clean checkout, run
`npx --no-install next typegen` before `npm run typecheck`.

Agents should use the [test-and-build skill](.github/skills/test-and-build/SKILL.md)
and [read-only spreadsheet inspection skill](.github/skills/inspect-spreadsheet/SKILL.md).
In the Copilot environment, map the provided secret for each build or dev command:

```bash
SHEETS_SERVICE_ACCOUNT="${SHEETS:?SHEETS agent secret is required}" npm run build
SHEETS_SERVICE_ACCOUNT="${SHEETS:?SHEETS agent secret is required}" npm run dev
```

Never print the secret or write agent credentials to disk. If `SHEETS` is
missing, a maintainer must configure **Settings → Environments → copilot →
Environment secrets** and start a new agent session.

## Configure Google Sheets access

Create a service account, enable the Google Sheets API, and grant its
`client_email` **Viewer** access to the private spreadsheet. Add the complete
service-account JSON to `.env.local` as `SHEETS_SERVICE_ACCOUNT`; do not put
this value in a committed file.

For Vercel, open the project’s **Settings → Environment Variables**, add
`SHEETS_SERVICE_ACCOUNT` with the complete JSON value, select the required
environments, and redeploy. The spreadsheet ID is intentionally stored in the
server-only adapter; the secret is not.

The adapter only reads selected May 2026 timetable and gear ranges and caches
the validated public projection. These ranges have no draft/publication flags;
their projected cells must already be approved for public display. The parser
omits whole-cell email addresses but is not a general privacy scrubber.
Keep contacts and private notes out of all projected columns, including gear
notes. Performer-name consent is confirmed for the historical site.
The historical
program is prerendered and refreshed with Next.js ISR using the `minutes`
profile (one-minute server revalidation, five-minute client stale time,
one-hour expiry). The first request after
one minute can still receive the previous version while regeneration runs in
the background; browser navigation checks the server after its stale time.
On a failed Sheets read or invalid spreadsheet data, a running server instance serves
its last successfully validated public program. This fallback is in memory
only: after a restart, on another instance, or before the first successful
read, the unavailable state is shown instead. There is no maximum age for
that fallback or last-updated indicator. Production builds need Sheets access
to prerender real content; a build can still succeed with unavailable pages,
so check the rendered result. Validation rejects malformed required fields
rather than publishing a partially parsed program.
The agenda reader skips its column-heading row and reads through the end of
the schedule, so adding a performance does not require updating a row limit.
Song and gear ranges are still bounded. Do not switch ranges to next-event
drafts until the architecture's publication decisions are resolved.