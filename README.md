# ABK Open Mic Night

A public, read-only Next.js site for ABK Open Mic. It invites people to join
the next event and archives the July 2025, December 2025, and May 2026 events
from approved fields in a private Google Sheet. The signup link points to the
Future tab, but the website does not read or publish that tab.

## Pages and documentation

- `/`: next-event invitation with signup and Slack calls to action, plus archive cards.
- `/past-events`: archive index.
- `/past-events/july-2025`, `/past-events/december-2025`, `/past-events/may-2026`: redirect to each event's Videos tab.
- `/past-events/<event>/videos` and `/past-events/<event>/songs`: archive tabs sharing an event header; May songs follow performance order.
- `/songs`: redirects to the May 2026 Songs tab. Schedule and gear pages have been removed.

Read the [current architecture](docs/ARCHITECTURE.md) for data, publication, and
cache boundaries, and the [website update status](docs/WEBSITE_UPDATE_PLAN.md)
for next-event decisions. The existing application should not be regenerated.
Synthetic data is confined to tests.

## Run locally

Use Node.js 22 or later and npm. Configure the credentials below before
starting the site.

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

The site reads approved archive fields live from the private spreadsheet and
caches validated public results. May 2026 still uses selected historical ranges
for songs, schedule, and gear; July and December 2025 discover approved song
columns from the header row and then request only those public columns. None of
these adapters read the Future tab, and there are no draft/publication flags:
the projected cells must already be approved for public display. The parsers
omit whole-cell email addresses but are not general privacy scrubbers. Keep
contacts and private notes out of all projected columns, including gear notes.
Performer-name consent is confirmed for the historical site.