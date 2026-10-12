# ABK Open Mic architecture

## Current scope

The public, read-only site invites colleagues from Activision, Blizzard, and
King to participate in the October 2026 ABK Open Mic and archives the July
2025, December 2025, and May 2026 events. Archive data is read live from
approved fields in a private Google Sheet; it is not a frozen snapshot. The
October 2026 Songs page reads proposed song titles, original-artist credits,
interested-performer names, and YouTube song references. The Performers page
shows participant names, recognized self-reported role interests, entered
genre text, and expandable proposed songs of interest and set-list assignments.
The Set List page publishes song titles, artist credits, recognized role
assignments, and the reviewed “Nice to have” / “Needed!” markers from the October
timetable. Practice suggests two balanced sessions using these assignments,
excluding songs marked `Done!`; other private signup
fields remain unpublished.

There are no website accounts, authentication, authorization, database, write
endpoints, Server Actions, or sign-up forms. Organizers edit Google Sheets
outside the site. Everything rendered is visible to anyone on the internet.

## System boundaries

```text
Public browser (MUI presentation)
  -> Next.js App Router Server Components
    -> server-only, event-specific Google Sheets adapters
      -> Google Sheets API (viewer service account, read-only scope)
      -> event-specific validation and public projection
    -> event-isolated cache / instance-local last-known-good fallback
```

The application uses TypeScript, Cache Components (`cacheComponents: true`,
which enables Partial Prerendering in Next.js 16),
and MUI's App Router cache provider, shared theme, and baseline. Check
`package.json`, the lockfile, and installed documentation before changing
framework APIs. Server Components own the reads; credentials and raw responses
must never reach client components.

## Current spreadsheet contract

`src/lib/google-sheets.ts` owns the spreadsheet ID and read-only service-account
client. The May 2026 adapter at `src/lib/may-2026-program-data.ts` reads:

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

The July and December 2025 adapters read the first row of each confirmed
timetable tab to locate normalized song, artist, and performer-role headers.
Header reads span the whole row, so approved columns can move beyond Z or ZZ.
They then request only those selected public columns, stopping at the first
blank row in the song table. July has no artist column; December does. The
projection excludes other columns and treats the `<Open>` performer marker as
unassigned. Missing or malformed song tables are unavailable rather than
partially published. These event-specific reads and their last-known-good
fallbacks are isolated from one another and from May 2026.
Public song lineups show performers by first name, adding the last initial when
multiple performers in the event share that first name.

The October 2026 signup adapter scans only column A for the normalized
`Performers` and `Songs` section markers. The header row follows each marker;
performer entries run from below the Performers header up to the Songs marker,
and song entries run from below the Songs header to the end of the tab. It reads
the participant `Name`, `Initials`, `Roles`, and `Genres` columns and, when
present, one uniquely mapped `Practice Availability` or `Weeknight Availability`
column. Only recognized Monday–Friday selections and explicit general-flexibility
responses are projected; raw availability prose is discarded immediately.
Blank, qualified, or unrecognized responses remain unknown. It reads the
song table's `Song`, `Orginal Artist` (the current spelling), recognized
role-interest, and `YouTube Link` columns. It never fetches contact fields,
notes, song `Suggested By`, or comments. Song
role-interest cells are projected only when their tokens match participant
initials, then display the corresponding consented name. Performer-page roles
are limited to recognized role labels; initials must match a short ASCII
format. Genre text is displayed as entered, without taxonomy normalization.
YouTube video IDs are accepted only from recognized YouTube URLs;
rich-link chips are read only from the selected YouTube column and embedded
with `youtube-nocookie.com`. Proposed songs and interest are not a confirmed
lineup or performance order. The Songs tab sorts by original artist, then song
title, with missing artist credits last; the Performers tab sorts initials
alphabetically and matches song interests by initials. Missing, duplicated,
reversed, or malformed section markers or headers fail closed. The adapter uses
the same duplicate-role-alias rejection as the timetable: `Drum` and `Drums`,
for example, cannot both map to one role. Header rows have no fixed column limit;
only the discovered approved data columns are fetched.
The adapter uses
the `minutes` cache profile and
instance-local last-known-good fallback pattern.

The October timetable adapter discovers normalized headers in row 1 of
`Time Table (October 2026)` and reads only Song, Original Artist, and recognized
performer-role columns, plus a uniquely header-mapped Practice column for
completion filtering. The song table ends at its first blank song row.
Practice values are reduced immediately to the normalized `Done!` marker or an
empty value before caching; raw practice prose is never retained or published.
Link and Comments columns are not fetched. Assignments resolve
against signup initials to the same public first-name roster. Only recognized
need markers are published; Additional Instruments also accepts parenthesized
instrument qualifiers after `Nice to have`, preserving their capitalization.
For example, `Nice to have (Strings)` displays as `Strings: Nice to have`
in both Set List and Songs. Qualifiers containing email addresses are excluded;
unmatched initials and other role-cell prose are not displayed.
Set List sorts by original artist by default, with sortable song and role
headers; sorting does not indicate performance order. The Set List table groups
guitar parts into one sortable Guitar column, retaining each part's assignments
and need markers. Parts use compact inline labels such as `Lead: Name` or
`Rhythm: Nice to have` in bold colored text, without parentheses or separate label rows. All table cells vertically
center their content, including multiline assignments.
Roles marked `Needed!` are also highlighted in a Critical openings section above
the table, linked to their song entries; the section reports when none remain.
Keyboard and Additional Instruments share the final sortable Additional
Instruments column, with Keyboard first and compact labels such as
`Keyboard: Name` and `Strings: Nice to have`. Instrument qualifiers are retained;
unqualified entries use `Additional Instruments` as their label.
This display grouping does not change the underlying roles.
The shared role-need component supports `link` and `chip` variants, using
bold blue/magenta MUI Link text on Set List and chips on Songs. Both show eligible role-interest performers and their
unique assigned-song counts in tooltips. Guitar role interests are considered
across guitar parts, and Additional Instruments uses Other Role interests.
Songs uses stable title/artist anchors and includes timetable-only songs so
set-list links have destinations. Performer expansion distinguishes assignments
from proposed interests; its count includes only unique set-list songs.
Song status chips aggregate all timetable entries with the same normalized
title/artist anchor. A song with no matching timetable entry is labeled `Not on
set list`; `All roles filled` is shown only when at least one role has an
assigned performer and every matching role has no need marker. Other matched
songs have no status chip. Status chips are suppressed when timetable data is
unavailable; signup songs remain visible.
The timetable has its own `minutes` cache and instance-local fallback. An
unavailable timetable does not hide signup data, and the planning freshness
timestamp is the older successful fetch when both sources are available.

Practice excludes completed songs by normalized title/artist, including duplicate
rows of the same song, and merges remaining duplicates and their assignments.
The optimizer counts distinct assigned performer initials in both sessions,
not roles or signup interests. The reusable optimizer accepts an event-specific
set of always-present performer initials, defaulting to no exclusions. October's
adapter resolves Donald and Randal by first name into that set; names are not
special-cased in the optimizer or presentation. These performers are assumed
present throughout and excluded from overlap and availability conflict counts.
The presentation accepts the event's song-link destination and always-present
roster, so future events can reuse it without inheriting October's assumptions.
When recognized weeknight availability exists for assigned
performers, it chooses
two distinct weeknights by minimizing known unavailable performer/session
assignments first, then shared-attendee count. Unknown availability is ignored.
Both weekday orderings are evaluated for each song grouping, so spreadsheet
row order does not restrict which group can use an earlier weekday.
Session song counts differ by at most one. It returns up to five distinct
best-score pairs, without counting swapped sessions as different options. Small
tables are searched exactly; large tables use bounded deterministic search and
explicitly warn when optimality is not proven. The page shows each session's
songs, chosen weeknight, known unavailable attendees, assigned attendees, shared
attendees, and links to song references. Each suggested session is independently
split into balanced early and late blocks using the same overlap optimizer.
This preserves the original two-group membership and minimizes other assigned
performers needing both halves within each group; it is not joint four-way
optimization. One best block split is shown per group, with its own bounded-search
warning if optimality is unproven. The page identifies early-only attendees who
can leave after that block, late-only attendees who can arrive later, and those
needed for both halves. A single-song group uses only its early block.
The optimizer also checks up to 100 individual Bass or Drums assignment exchanges
between different songs (with a 20,000-pair scan bound), re-optimizes sessions for
each candidate, and suggests up to five exchanges that reduce known availability
conflicts first or, without increasing those conflicts, reduce the shared-attendee
count. These are proposals only; published assignments are
unchanged. A notice indicates when the candidate search was bounded.
These are suggestions, not confirmed session dates; reported availability is
self-reported and unknown values are ignored. Missing or ambiguous Practice
headers make Practice unavailable without hiding Set List. All-completed tables show an
empty state; one remaining song has an empty second session.
Practice uses a short introduction, expandable planning assumptions and swap
suggestions, and responsive session columns with nested early/late headings.
The first session-pair option is expanded by default.

`buildHistoricalProgram` in `src/lib/historical-program.ts` returns songs,
schedule entries, and grouped gear. It skips recognized schedule headings and
the song signup-closed marker, validates required text, clock-time shapes,
duration bounds, and gear categories, and rejects an empty songs/schedule/gear
collection. Songs follow the schedule's source order by normalized title,
using artist credits to disambiguate matches; unmatched songs remain at the
end in signup order. Operational entries are not added to the song list.
Schedule and gear preserve source order; the parser does not validate
chronological ordering or overlaps. Times are historical clock strings,
with the program labeled `America/Los_Angeles`, not full dated timestamps.
The title and time zone are currently fixed in the parser.

Only recognized YouTube video IDs become `youtube-nocookie.com` embed URLs.
Gear retains sharing availability and tentative/open items.

## Publication and privacy

Publication of the July and December 2025 event song lineups has been approved,
as has the existing May 2026 historical site. The October 2026 request confirms
participant consent for public display of names and authorizes a limited
projection of self-reported role interests and entered genre text, proposed
song titles and original-artist credits, resolved interested-performer names
on songs, and recognized YouTube song references. Contacts, private planning
notes, and new photos are not authorized. The Set List request additionally
authorizes the narrow October timetable projection described above. The Practice
request additionally authorizes using the completion marker to exclude songs
and publishing suggested song groups with their already-approved assignments.
The subsequent weeknight-availability request authorizes only the normalized
weekday projection for October performer display and practice planning; raw
availability prose, notes, links, and comments remain private.

**The May 2026 adapter has no `published` flag.** Its
publication boundary is the selected historical ranges and projected columns.
Organizers must keep those cells suitable for public display, including gear
details and notes. Text validation rejects whole-cell email addresses; it is
not a general detector for embedded emails, phone numbers, or private prose.
Do not describe inspection or parsing as automatic anonymization.

The 2025 adapters publish only song titles, available original-artist credits,
and assigned performers in recognized role columns. Contact and note columns
are not fetched for those archives. The October signup link opens the signup
tab. The website reads names, initials, role preferences, genres, and normalized
weekday availability for
the performers page, song titles, original-artist credits, recognized
role-interest columns, and YouTube links for the songs page, plus the selected
October timetable song/artist/role columns and the narrow Practice completion
projection. Contact data, raw availability prose, suggested-by values, and all
notes/comments remain private and are not fetched.
Public performer names use first names, adding the last initial only when the
event roster contains multiple performers with the same first name.

Keep the spreadsheet private and grant the service account Viewer access.
Use only `https://www.googleapis.com/auth/spreadsheets.readonly`. On a local
computer, provide `SHEETS_SERVICE_ACCOUNT` through the shell environment or
the ignored `.env.local`. Hosting uses its server-side secret configuration.
GitHub-hosted agents map the `SHEETS` secret per command as described in
[AGENTS.md](../AGENTS.md). No credentials, raw sheet exports, contact lists, or
drafts belong in Git, build artifacts intended for sharing, public logs, or
client bundles.

## Rendering, caching, and failures

The May server adapter caches the validated public program with `use cache` and
`cacheLife("minutes")`: one-minute server revalidation, five-minute client
stale time, and one-hour expiry. Refresh is request-driven; the first request
after the revalidation interval may receive the previous result while a
background refresh runs. This is not an immediate-publishing guarantee.
Both October adapters use the same `cacheLife("minutes")` profile, so planning
content and its successful-fetch timestamp can be included in prerendered HTML
and prefetched navigation. The `seconds` profile expires after one minute;
Next.js excludes caches with expiry under five minutes from prerenders, leaving
request-time holes that display the Suspense skeletons on visits. Keep both the
signup and nested timetable caches prerender-compatible. Suspense boundaries
remain for streaming when needed, not as the normal static page content.
Historical event adapters also remain on the `minutes` profile.

Each event uses `withLastKnownGood` to keep a best-effort in-memory copy per running instance.
If a read or validation fails, that instance can return its last successful
program. There is no durable/shared fallback or maximum fallback age; a new
instance without successful data returns `null` and the pages show an
unavailable state. Do not promise freshness during an outage.

The cached public result includes `fetchedAt`, assigned only after a successful
Sheets read and validation. The last-known-good fallback retains this timestamp.
Failed refreshes return a cached unavailable result, so an outage does not cause
every page request to retry Google Sheets before the configured revalidation
interval. The October adapter batches its two header reads and all selected public
value ranges to minimize API requests without fetching private columns.
React request memoization shares the same event result between a page and its
event layout. The homepage and archive index make no Sheets read and have no
historical freshness indicator. Event pages and the October proposed-songs page
show their own successful-fetch timestamp; “Last updated” means last successful
data fetch, not a sheet edit.
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
| `/` | October 2026 invitation with signup and Slack links, Event Planning cards for Set List, Practice, Songs, and Performers, and past-event cards |
| `/past-events` | Static archive index, independent of Sheets availability |
| `/event-planning` | Redirects to the first/default Set List tab |
| `/event-planning/set-list` | Sortable October timetable song/artist/role table with resolved names and bold colored role-need text |
| `/event-planning/practice` | Up to five balanced two-session suggestions minimizing known weeknight conflicts then shared assigned performers, excluding Done! songs |
| `/event-planning/songs` | October 2026 signup and timetable songs, original-artist credits, assigned performers, role needs, and validated YouTube references; signup interests are not displayed as assignments |
| `/event-planning/performers` | October signup names, recognized role interests, entered genres, normalized weeknight availability, expandable set-list assignments and proposed song interests; no contact fields or raw availability prose |
| `/songs`, `/performers` | Legacy redirects to their corresponding Event Planning tabs |
| `/robots.txt` | Disallows crawling of all paths for compliant crawlers |
| `/past-events/<event>` | Redirects to that event's Videos tab |
| `/past-events/<event>/videos` | Individual July and December 2025 videos; May 2026 placeholder |
| `/past-events/<event>/songs` | Event song lineup; May is in performance order and retains approved song-reference embeds |

Supported event slugs are `july-2025`, `december-2025`, and `may-2026`.
The schedule and gear pages, including their legacy redirects, have been removed
and return not found. The May adapter still reads and validates its existing
schedule and gear ranges; removing these pages does not change that data contract.

The ABK Open Mic brand links home; the footer says “ABK Open Mic” and places an
event's successful-fetch metadata directly below the site name. Global
navigation includes Past events.
The Event Planning layout keeps its shared heading, subtitle, Set List/Practice/Songs/Performers
tabs, and last-successful-fetch metadata above all four child pages. Its tab bar
uses the same MUI Tabs/Tab interaction and selected-segment behavior as the
past-event Videos/Songs tabs.
Each event's App Router layout keeps breadcrumbs, an event title without a dash,
a subtitle, and Videos/Songs tabs above the child page. Next.js links switch tabs
without replacing the shared layout, and the selected tab follows the URL.
The event layout supplies `generateStaticParams` for all three known slugs.
Titles, breadcrumbs, tabs, and the Videos placeholder are prerendered, not loading
UI. Sheets reads are isolated behind Suspense in the song cards and footer
freshness metadata; their fallbacks match the responsive card grid (including
May's reference-video aspect ratio) and timestamp line, respectively. There is
no whole-page loading boundary replacing the event shell. Tab links prefetch
their destination content while the existing data-cache lifetimes remain intact.
July and December event pages embed each individual video from their publicly
listed playlists using privacy-enhanced `youtube-nocookie.com` embeds. The
legacy page swapped the two playlist links, so videos are associated using the
playlist titles and contents. May event videos remain a placeholder until a
playlist is supplied; song-reference videos remain separately labeled on Songs.
Home and archive-index cards share a compact month/year title and event-theme
subtitle with one link per event. The homepage lists the next show as the evening
of Sunday, October 25; no venue is claimed. MUI handles responsive layout and
presentation.

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

## Next-event publication boundary and remaining decisions

1. The October pages use a narrow, header-mapped projection of consented names,
   initials, entered genres, recognized role interests, proposed songs, and
   validated YouTube references. The timetable's selected song, artist, role
   assignment, and need-marker columns are also approved by the Set List request;
   the Practice request adds completion filtering and suggested session groups.
   Signup interest remains distinct from timetable assignments; no venue is claimed.
2. Keep contacts and all other private signup fields out of the public
   projection. Any expansion beyond the approved name, initials, roles, genres,
   songs, and video fields needs a separate publication decision.
3. Decide whether to retain the historical view and how event selection and
   preview isolation should work.
4. Agree on refresh delay and outage/stale-data handling; event freshness
   reports fetch age, not the source's edit time.
5. Confirm production/preview access and browser checks before connecting any
   additional next-event data.

The root `robots.txt` disallows crawling by compliant bots. This is a crawl
preference, not access control or a guarantee that URLs already known to a
search engine will disappear from its index.

Use the [spreadsheet inspection skill](../.github/skills/inspect-spreadsheet/SKILL.md)
to gather facts read-only. Discovery never authorizes publication or a sheet
write. See [the update status](WEBSITE_UPDATE_PLAN.md) for delivered work and
remaining next-event data decisions.
