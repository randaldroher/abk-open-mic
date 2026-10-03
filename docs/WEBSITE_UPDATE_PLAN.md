# ABK Open Mic website status

## May 2026 archive — implemented

The site presents the May 2026 performance through Videos and Songs tabs under
a persistent event header. It reads selected ranges from the private Google Sheet live,
not a frozen snapshot.

Delivered in the current source:

- Typed historical songs, performer roles, schedule entries, and gear.
- Server-only, read-only Sheets access; validated public projection and cached
  rendering with an instance-local last-known-good fallback.
- Historical labeling without inventing an exact event date or venue.
- Songs in performance order with credits and separately labeled YouTube
  reference embeds. Schedule and gear pages have been removed; the existing
  adapter still validates those ranges.
- Brand-link home navigation without a separate Overview item.
- Event-scoped reporting of the last successful fetch as client-relative time,
  with the original timestamp preserved during read failures.
- Unit tests for historical parsing, selected invalid inputs, agenda headers
  and appended entries, video links, fallback timestamp preservation, and
  relative-time formatting. Synthetic data is confined to tests.

See [ARCHITECTURE.md](ARCHITECTURE.md) for exact ranges, validation limits, and
cache semantics. Do not treat the original plan as evidence that chronological
validation, browser automation, or general contact-detail
redaction exist. Live historical publication is range-based, not flag-based.

## Next-event invitation and past events — implemented

- The homepage links to the signup tab in the organizer spreadsheet and the
  confirmed ABK Open Mic Slack channel. It lists the show as the evening of
  Sunday, October 25, and invites interested people to sign up before choosing
  a song.
- `/event-planning/songs` lists proposed song titles, artist credits, matched
  performer names by role, and validated YouTube references from the October
  signup tab. Header names are normalized on read.
- `/event-planning/performers` lists consented performer names, recognized
  self-reported role interests, and entered Genres text as written. Contacts,
  availability, notes, comments, and suggested-by fields are not fetched.
  Signup interest is not a confirmed lineup.
- `/robots.txt` disallows crawling by compliant search bots; already-known URLs
  may remain indexed until the search engine removes them.
- The homepage has a dedicated Event Planning section with one card for each
  tab; these links are outside the hero. `/event-planning` opens Songs by
  default, and legacy `/songs` and `/performers` redirect to the new tabs. The
  May archive remains available at `/past-events/may-2026/songs`.
- The responsive homepage cards and `/past-events` index show each event's
  month, year, and theme and link to the July 2025, December 2025, and May 2026
  Videos tabs without depending on Sheets.
- Each archive has shared breadcrumbs, a dash-free title, a subtitle, and
  URL-based Videos/Songs tabs. Event root URLs redirect to Videos by default.
- July and December song pages read only the approved song, artist (when
  present), and performer-role columns, located by normalized headers on each
  read. Private notes and contact columns are not fetched.
- Event reads have isolated caches, last-known-good fallbacks, and freshness
  timestamps.
- July and December Videos tabs embed each individual video from the public
  playlists. The legacy site swapped their playlist links, so the videos are
  assigned by the playlists' own titles and contents. May remains a placeholder
  pending an organizer-approved playlist.
- The May 2026 adapter is named specifically for that event. May Songs remains at
  `/past-events/may-2026/songs`. Former schedule and gear routes return not
  found.

The May archive remains a live view of its historical source, not an immutable
snapshot. The homepage and archive index remain available through Sheets
outages. There is no website signup form; organizers continue to manage signup
in Google Sheets. No venue is claimed on the site.

## Remaining planning and operations

1. Confirm next-event title, date, time zone, venue, and other details before
   adding them to public homepage copy.
2. Supply an organizer-approved May 2026 event playlist before adding it.
  Song-reference links remain separately labeled and are not represented as
  recordings of the performances.
3. Keep contacts, notes, comments, suggested-by values, and other unapproved
  signup fields private. Names are public only with the participant consent
  confirmed for this October projection. Names/roles/genres are interests, not
  a confirmed lineup. Keep preview isolation explicit before connecting any
  additional planning data.
4. Use the [test-and-build skill](../.github/skills/test-and-build/SKILL.md)
   for release checks and browser verification. Hosting and participant access
   remain operational settings.
