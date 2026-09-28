# ABK Open Mic Night

A public, read-only Next.js site for an open mic night. It presents a sanitized
historical preview of the May 2026 performance using a private Google Sheet.

## Run locally

```bash
npm ci
npm run dev
```

The site is built with Next.js App Router, TypeScript, Cache Components, and
MUI. Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`
to verify changes.

## Configure Google Sheets access

Create a service account, enable the Google Sheets API, and grant its
`client_email` **Viewer** access to the private spreadsheet. Add the complete
service-account JSON to `.env.local` as `SHEETS_SERVICE_ACCOUNT`; do not put
this value in a committed file.

For Vercel, open the project’s **Settings → Environment Variables**, add
`SHEETS_SERVICE_ACCOUNT` with the complete JSON value, select the required
environments, and redeploy. The spreadsheet ID is intentionally stored in the
server-only adapter; the secret is not.

The adapter only reads the May 2026 timetable and gear tabs, caches the
validated public projection, and excludes email addresses, contact details,
spreadsheet-only calculations, and private planning notes. The historical
program is prerendered and refreshed with Next.js ISR (one-minute server
revalidation and client stale time, one-hour expiry). The first request after
one minute can still receive the previous version while regeneration runs in
the background; browser navigation checks the server after its stale time.
On a failed
Sheets read or invalid spreadsheet data, a running server instance serves
its last successfully validated public program. This fallback is in memory
only: after a restart, on another instance, or before the first successful
read, the unavailable state is shown instead. Production builds require
Sheets access to prerender the pages; validation still rejects malformed
rows rather than publishing partial data.
The agenda reader skips its column-heading row and reads through the end of
the schedule, so adding a performance does not require updating a row limit.