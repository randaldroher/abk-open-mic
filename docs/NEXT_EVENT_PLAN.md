# Next-event homepage and past-event archive

Status: The archive and invitation portions of this plan are implemented.
Next-event signup data is not read or published by the website.

## Delivered

- `/` invites colleagues to join the next ABK Open Mic, with the primary CTA
  linking to the confirmed Future tab in the organizer workbook and a secondary
  CTA to the confirmed Slack channel. No date or venue is invented.
- Responsive event cards and `/past-events` link to the July 2025,
  December 2025, and May 2026 archives without fetching sheet data.
- `/past-events/<event>` provides each event overview and song lineup.
  May 2026 retains its Songs, Schedule, and Gear pages. Legacy `/songs`,
  `/schedule`, and `/gear` routes redirect to those pages.
- July and December adapters read their current header rows, select only
  recognized song, artist, and performer columns, and maintain isolated
  caches, last-known-good fallbacks, and timestamps. July has no artist
  header; unassigned `<Open>` role values are omitted.
- Each event overview has a video placeholder. May 2026 song-reference videos
  remain labeled as references and are not presented as event recordings.
- The May fetcher is event-specific; homepage and archive index do not depend
  on successful Sheets reads.

See [ARCHITECTURE.md](ARCHITECTURE.md) for the live sheet contract, privacy
boundaries, cache behavior, and routes. The May archive remains a live view of
historical ranges, not an immutable snapshot. July and December song-lineup
publication was approved; contact and note columns are not fetched for those
archives.

## Remaining decisions

- Add approved event-video URLs and publication permission in a future change.
- Confirm the next event's title, date, time zone, venue, and other public
  details before adding them to homepage copy.
- Before any website display of Future-tab data, establish and test an explicit
  publication boundary, keep private participant/contact data separate, and
  decide preview isolation. The current site only links to the signup tab.
- Keep refresh/outage behavior and hosting/participant access operational
  assumptions explicit; website links do not grant spreadsheet or Slack access.

## Verification

- Keep tests for normalized-header mapping, source order, missing/invalid rows,
  privacy projection, and isolated event fallback behavior.
- Use the [test-and-build skill](../.github/skills/test-and-build/SKILL.md) for
  lint, typecheck, tests, credentialed build, and browser verification.
- Confirm the homepage CTAs remain available during Sheets outages, old routes
  redirect correctly, archive navigation and timestamps are event-specific,
  and no contacts, credentials, or raw sheet responses reach rendered output.
