# Next-event homepage and past-event archive

Status: The archive and invitation portions of this plan are implemented. The
October 2026 Songs page reads a narrow public projection of proposed song
titles, original-artist credits, resolved performer names, and YouTube references.
The Performers page displays consented names, entered genres, and recognized
self-reported roles; contacts and other private fields remain private.

## Delivered

- `/` invites colleagues to join the next ABK Open Mic, with the primary CTA
  linking to the confirmed October 2026 signup tab in the organizer workbook and a secondary
  CTA to the confirmed Slack channel. The homepage lists the show as the evening
  of Sunday, October 25; no venue is claimed.
- Responsive event cards and `/past-events` link to the July 2025,
  December 2025, and May 2026 archives without fetching sheet data.
- `/past-events/<event>` provides each event overview and song lineup.
  Event root URLs redirect to Videos by default, and May 2026 keeps Songs
  and Videos tabs. May Songs remains at `/past-events/may-2026/songs`; legacy
  `/schedule` and `/gear` now return not found.
- July and December adapters read their current header rows, select only
  recognized song, artist, and performer columns, and maintain isolated
  caches, last-known-good fallbacks, and timestamps. July has no artist
  header; unassigned `<Open>` role values are omitted.
- Each event overview has a video placeholder. May 2026 song-reference videos
  remain labeled as references and are not presented as event recordings.
- The May fetcher is event-specific; homepage and archive index do not depend
  on successful Sheets reads.
- `/event-planning/songs` lists October 2026 song suggestions, matched
  interested-performer names by role, and validated YouTube references, sorted
  by original artist and then title. These are proposals, not a finalized
  program or performance order.
- `/event-planning/performers` lists consented names, entered genres, and
  recognized self-reported role interests; contacts, notes, and other signup
  details are not fetched. Rows remain sorted by initials.
- `/event-planning` redirects to Songs. Legacy `/songs` and `/performers` URLs
  redirect to their corresponding Event Planning tabs.
- The homepage's Event Planning section has separate Songs and Performers
  cards below the hero; the hero focuses on signup and Slack actions.
- `/robots.txt` disallows all paths for compliant crawlers; already-known URLs
  may remain in search results until removed by the search engine.

See [ARCHITECTURE.md](ARCHITECTURE.md) for the live sheet contract, privacy
boundaries, cache behavior, and routes. The May archive remains a live view of
historical ranges, not an immutable snapshot. July and December song-lineup
publication was approved; contact and note columns are not fetched for those
archives.

## Remaining decisions

- Add approved event-video URLs and publication permission in a future change.
- Confirm the next event's title, time zone, venue, and other public details
  before adding them to homepage copy.
- Keep notes, comments, suggested-by fields, practice availability, and contact
  data private. The public names/roles/genres projection is not a confirmed
  performance lineup. Decide preview isolation before connecting other data.
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
