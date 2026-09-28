# ABK Open Mic architecture

## Current scope

The implemented site is a public, read-only historical preview of the May 2026
performance for colleagues from Activision, Blizzard, and King. It reads live
data from selected ranges of a private Google Sheet; it is not a frozen
snapshot or a next-event registration system.

There are no website accounts, authentication, authorization, database, write
endpoints, Server Actions, or sign-up forms. Organizers edit Google Sheets
outside the site. Everything rendered is visible to anyone on the internet.

## System boundaries

```text
Public browser (MUI presentation)
  -> Next.js App Router Server Components
    -> server-only historical-program-data.ts
      -> Google Sheets API (viewer service account, read-only scope)
      -> historical-program.ts validation and public projection
    -> cached HistoricalProgram / instance-local last-known-good fallback
```

The application uses TypeScript, Cache Components (`cacheComponents: true`),
and MUI's App Router cache provider, shared theme, and baseline. Check
`package.json`, the lockfile, and installed documentation before changing
framework APIs. Server Components own the reads; credentials and raw responses
must never reach client components.

## Current spreadsheet contract

`src/lib/historical-program-data.ts` owns the spreadsheet ID and these ranges:

| Range | Use |
| --- | --- |
| `'Time Table (May 2026)'!A2:I15` | Song titles, original artists, and performers by role |
| `'Time Table (May 2026)'!J2:J15` | Rich-link chips used for YouTube references |
| `'Time Table (May 2026)'!M95:W` | Running order, including operational entries |
| `'Gear (May 2026)'!B3:G67` | Gear category, item, details, owner, sharing, and notes |

Values are read as formatted rows; rich-link metadata is read separately.
The agenda starts at a recognized header row and deliberately has no end-row
limit so appended performances are included. Song and gear ranges are still
bounded. These positional mappings describe only the historical source;
the adapter does not auto-discover columns. New signup data may change shape
frequently. Inspect normalized headers afresh rather than assuming any column
stays put, and review the adapter before changing its source layout.

`buildHistoricalProgram` in `src/lib/historical-program.ts` returns songs,
schedule entries, and grouped gear. It skips recognized schedule headings and
the song signup-closed marker, validates required text, clock-time shapes,
duration bounds, and gear categories, and rejects an empty songs/schedule/gear
collection. It preserves source order; it does not validate chronological
ordering or overlaps. Times are historical clock strings,
with the program labeled `America/Los_Angeles`, not full dated timestamps.
The title and time zone are currently fixed in the parser.

Only recognized YouTube video IDs become `youtube-nocookie.com` embed URLs.
Gear retains sharing availability and tentative/open items.

## Publication and privacy

Performer-name consent has been confirmed for the historical site. This is not
permission to publish contact details, private planning notes, or new photos.

**The live historical adapter has no `published` flag.** Its
publication boundary is the selected historical ranges and projected columns.
Organizers must keep those cells suitable for public display, including gear
details and notes. Text validation rejects whole-cell email addresses; it is
not a general detector for embedded emails, phone numbers, or private prose.
Do not describe inspection or parsing as automatic anonymization.

Keep the spreadsheet private and grant the service account Viewer access.
Use only `https://www.googleapis.com/auth/spreadsheets.readonly`. Store
`SHEETS_SERVICE_ACCOUNT` in local/hosting secrets; agents map the `SHEETS`
secret per command as described in [AGENTS.md](../AGENTS.md). No credentials,
raw sheet exports, contact lists, or drafts belong in Git, build artifacts
intended for sharing, public logs, or client bundles.

## Rendering, caching, and failures

The server adapter caches the validated public program with `use cache` and
`cacheLife("minutes")`: one-minute server revalidation, five-minute client
stale time, and one-hour expiry. Refresh is request-driven; the first request
after the revalidation interval may receive the previous result while a
background refresh runs. This is not an immediate-publishing guarantee.

`withLastKnownGood` keeps a best-effort in-memory copy per running instance.
If a read or validation fails, that instance can return its last successful
program. There is no durable/shared fallback or maximum fallback age; a new
instance without successful data returns `null` and the pages show an
unavailable state. Do not promise freshness during an outage.

The cached public result includes `fetchedAt`, assigned only after a successful
Sheets read and validation. The last-known-good fallback retains this timestamp.
React request memoization shares the same result between the page and footer.
The server template passes only the timestamp to the footer's client component;
using a template rather than the persistent layout keeps it aligned with route
navigation. “Last updated” means last successful data fetch, not a sheet edit.
The initial HTML contains an ISO time; after hydration, the client shows
relative minutes/hours/days and refreshes that label every 30 seconds. This
timer does not poll Sheets or refresh page data. Without a successful result,
the footer shows “Last updated: unavailable”.

Production prerendering attempts Sheets reads, so a meaningful release build
needs working credentials, Viewer access, and network access to Google auth
and Sheets. A successful build alone does not prove the data loaded: errors
can render the unavailable state. Verify rendered content as well.

## Routes and UI

| Route | Current behavior |
| --- | --- |
| `/` | Historical overview, summary counts, links to the other pages |
| `/schedule` | Source-order running order with time, duration, and performer roles |
| `/songs` | Song credits, performer roles, and available video embeds |
| `/gear` | Equipment grouped by category, ownership, sharing, and open needs |

The ABK Open Mic brand links home; navigation lists Schedule, Songs, and Gear,
not a separate Overview item. MUI handles responsive layout and presentation.
No exact event date or venue is invented.

## Verification and operations

Use the [test-and-build skill](../.github/skills/test-and-build/SKILL.md).
Existing unit tests cover historical projection, selected invalid inputs,
YouTube references, agenda headers/appended entries, last-known-good timestamp
preservation, and relative-time formatting. Synthetic data exists only in tests.
There is no automated browser
suite or end-to-end live Sheets/cache-refresh test.

For releases, run lint, typecheck, tests, and a credentialed build; manually
verify routes, mobile layout, keyboard navigation, footer freshness, unavailable
states, and that private fields do not reach rendered output. Hosting secrets,
preview isolation, API access, and quota monitoring are operational settings,
not guarantees provided by this repository. Preview builds currently use the
same hard-coded historical sheet; separate preview data is not implemented.

## Decisions before using next-event data

1. Confirm the event title, date, time zone, venue, organizers, and source tabs.
2. Agree on public fields, performer consent, approved media, and retention.
   Keep contacts and private planning separate from public inputs.
3. Choose an explicit draft/publication boundary and test it before connecting
   any next-event ranges.
4. Decide whether to retain the historical view and how event selection and
   preview isolation should work.
5. Agree on refresh delay and outage/stale-data handling; the current footer
   reports fetch age, not the source's edit time.
6. Confirm production/preview access and browser checks before switching.

Use the [spreadsheet inspection skill](../.github/skills/inspect-spreadsheet/SKILL.md)
to gather facts read-only. Discovery never authorizes publication or a sheet
write. See [the update status](WEBSITE_UPDATE_PLAN.md) for the next planning pass.
