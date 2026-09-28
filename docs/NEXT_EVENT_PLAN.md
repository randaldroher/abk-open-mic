# Next-event homepage and past-event archive plan

Status: proposed; no application changes are implemented by this document.

This plan builds on the [current architecture](ARCHITECTURE.md) and
[delivered website work](WEBSITE_UPDATE_PLAN.md). Preserve the May 2026 content
while making the homepage an invitation to participate in the next event.

## 1. Create the past-events archive

- Add `/past-events` as the archive index, starting with May 2026.
- Add `/past-events/may-2026` as the May 2026 overview. Move the historical
  homepage content here, with a section for one or more event recordings and
  the song lineup in source order.
- Add `/past-events/may-2026/songs`, `/past-events/may-2026/schedule`, and
  `/past-events/may-2026/gear` to preserve the existing detailed views.
  The overview should link to these pages as well as show the lineup.
- Redirect `/songs`, `/schedule`, and `/gear` to their May 2026 equivalents
  so existing bookmarks continue to work.
- Keep the ABK Open Mic brand linked to `/`, without a separate Overview
  menu item. Make Past events global navigation; keep Songs, Schedule, and
  Gear within the May 2026 event navigation.
- Update page titles, descriptions, historical labels, and internal links
  so the archive and next-event homepage cannot be confused.

### May 2026 recordings

- Obtain organizer-approved recording URLs and permission to publish them.
  Performer-name consent alone does not establish recording permission.
- Support a full-event recording and/or multiple labeled recordings on the
  overview. Do not treat the current songs' YouTube reference links as
  recordings of the ABK performance without confirmation.
- Render approved media with descriptive titles, accessible links, and
  privacy-conscious embeds where supported. Validate allowed providers and
  URLs rather than accepting arbitrary embed markup.
- Until approved recordings are available, show an honest unavailable message;
  do not invent media URLs or let missing recordings hide the song lineup.

## 2. Make the May 2026 fetcher event-specific

- Rename `getHistoricalProgram` to `getMay2026Program` and its module from
  `historical-program-data.ts` to `may-2026-program-data.ts`. Rename the internal
  read/load functions consistently and update all consumers.
- Preserve the May 2026 spreadsheet, selected ranges, public projection,
  validation, read-only scope, and server-only credentials boundary. This is
  a naming and routing change, not a switch to next-event data.
- Preserve Cache Components caching, request memoization, and the
  instance-local last-known-good result, including its successful `fetchedAt`
  timestamp. Keep the existing unavailable state when no result is available.
- Remove the unconditional May 2026 fetch and historical footer from the
  root template. Scope historical freshness reporting to the relevant event
  routes, retaining alignment between each page and its fetched timestamp.
  The homepage and archive index must not depend on a successful Sheets read.
- Reuse presentation and parsing only where the data contracts genuinely match;
  do not assume the current parser's fixed May 2026 title or required
  schedule/gear collections apply to other events.

## 3. Add the two earlier events

- Confirm the identities, dates, titles, and source tabs of the two events
  preceding May 2026; their names and dates are not established here.
- Inspect each source read-only using the spreadsheet inspection skill.
  Rediscover normalized column headers rather than copying May 2026 column
  positions. Record the approved song fields and source order for each event.
- Add an overview and song-lineup page under `/past-events/<event-slug>` for
  each confirmed event, using the May 2026 presentation where appropriate.
  Add both events to the archive index and homepage cards once their public
  content is approved and their pages are available.
- Give each event its own explicitly named server-only song-list fetcher and
  source mapping. Keep caches, fallback data, and freshness timestamps isolated
  by event so one event's failure cannot display another event's songs.
- Require only the data each event actually has: missing schedule, gear, or
  recordings must not prevent publication of an approved song list.
- Confirm consent and public fields separately for these archives. Do not
  publish contacts, private notes, or unapproved recordings. Do not populate
  pages with synthetic events or guessed dates.

## 4. Turn the homepage into a next-event invitation

- Replace the May 2026 historical hero and counts with an invitation to sign
  up for the next ABK Open Mic. Publish date, venue, and other details only
  after organizers confirm them.
- Make **Sign up in the spreadsheet** the primary CTA. The existing workbook
  provides this candidate Google Sheets link:
  <https://docs.google.com/spreadsheets/d/17jHvnjnWp5x6lne5SrOMFQBtISrYMeo7o0jethdRKHA/edit>.
  Confirm that it is also the intended next-event signup workbook before
  shipping the CTA; obtain the correct workbook URL otherwise. Add a tab-specific
  link only after the signup tab's identifier is verified.
- Keep the workbook private with organizer-managed participant access. A link
  does not grant access; confirm the intended participants can sign up without
  changing the website service account's Viewer permissions.
- Add **Join ABK Open Mic on Slack** as the secondary CTA, using the confirmed
  channel destination: <https://abk.slack.com/archives/C091Y02RLJC>.
  Verify access for intended participants; the channel link does not grant
  workspace membership.
- Place a responsive Past events card section directly beneath the homepage
  signup and Slack CTAs. Start with May 2026, then include the two earlier
  events as their approved pages become available. Each card should show the
  confirmed event title/date label and link to its overview, without invented
  details or links to unpublished pages.
- Keep these cards available without a live Sheets read, and include a less
  prominent link to the full Past events archive.
- Keep signup entirely in Google Sheets and discussion in Slack. Add no
  website forms, authentication, database, write endpoints, or Sheets writes.
- Keep the homepage usable during historical Sheets outages. Linking to the
  signup sheet does not authorize fetching or publishing its draft contents.

## 5. Publication decisions and release checks

Before implementation is released, confirm:

- The next-event signup destination, participant access, and approved homepage
  copy; access to the confirmed Slack channel and CTA wording.
- May 2026 recording URLs and publication permissions.
- The two earlier events' identities, source contracts, and public fields.
- Existing May 2026 ranges remain suitable for public display. The archive
  remains a live view of historical ranges, not an immutable snapshot.
- Any later website display of next-event data has an explicit, tested
  draft/publication boundary and preview-isolation decision as required by
  the architecture. This plan does not enable those reads.

Implementation verification:

- Consult the installed Next.js documentation before modifying App Router
  code; retain the existing TypeScript, Cache Components, and MUI integration.
- Add focused regression tests for each event's approved song projection,
  source order, missing/invalid data, privacy boundaries, and isolated fallback
  behavior. Keep synthetic data confined to tests.
- Verify the May 2026 rename preserves existing songs, schedule, gear, and
  successful-fetch timestamps, including fallback behavior.
- Use the test-and-build skill to run the existing lint, typecheck, tests,
  and credentialed production build; confirm actual content renders rather
  than relying on build success alone.
- Browser-check the homepage CTAs and past-event cards beneath them, including
  card destinations and availability during Sheets outages, plus the archive
  index, event pages, old-route
  redirects, recording availability, event-specific navigation and freshness,
  mobile layout, keyboard access, and unavailable states.
- Confirm that historical data failures do not block either homepage CTA and
  that no draft rows, contacts, credentials, or raw Sheets responses reach
  rendered output.
- Update the architecture and delivered-work status when implementation lands,
  distinguishing shipped behavior from the remaining earlier-event work.
