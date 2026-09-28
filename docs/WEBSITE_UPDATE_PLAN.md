# Historical website status and next-event planning

## Historical milestone — implemented

The site now presents the May 2026 performance on Overview, Schedule, Songs,
and Gear pages. It reads selected ranges from the private Google Sheet live,
not a curated snapshot waiting for a Sheets integration.

Delivered in the current source:

- Typed historical songs, performer roles, schedule entries, and gear.
- Server-only, read-only Sheets access; validated public projection and cached
  rendering with an instance-local last-known-good fallback.
- Historical labeling without inventing an exact event date or venue.
- Running order including operational entries, song credits and YouTube
  embeds, and categorized gear with ownership/sharing/open needs.
- Brand-link home navigation without a separate Overview item.
- A footer reporting the last successful fetch as client-relative time, with
  the original timestamp preserved during read failures.
- Unit tests for historical parsing, selected invalid inputs, agenda headers
  and appended entries, video links, fallback timestamp preservation, and
  relative-time formatting. Synthetic data is confined to tests.

See [ARCHITECTURE.md](ARCHITECTURE.md) for exact ranges, validation limits, and
cache semantics. Do not treat the original plan as evidence that chronological
validation, browser automation, or general contact-detail
redaction exist. Live historical publication is range-based, not flag-based.

## Next planning pass — not implemented

1. **Inspect, do not publish.** Use the
   [spreadsheet inspection skill](../.github/skills/inspect-spreadsheet/SKILL.md)
   to rediscover relevant normalized column headers; signup layouts can change
   frequently, so do not rely on fixed positions. Summarize structure and gaps, not
   private rows; do not change the sheet or application ranges.
2. **Confirm the event.** Ask organizers for title, date, time zone, venue,
   ownership, and which tabs are intended for the next event. Do not infer
   these from the historical clock times or newly discovered draft tabs.
3. **Agree on publication.** Identify public fields and consent, separate
   contacts/private notes, choose how drafts stay unpublished, and decide
   whether history remains available.
4. **Define the migration.** Plan adapter/model/UI changes, event selection,
   preview isolation, schedule validation, and acceptable
   refresh/outage behavior after the source contract is agreed.
5. **Verify before switching.** Add focused synthetic regression cases for the
   agreed contract and privacy boundaries; use the
   [test-and-build skill](../.github/skills/test-and-build/SKILL.md) for release
   checks and browser verification. Confirm the intended data actually renders.

The next-event implementation and operational deployment checks remain future
work. This document does not authorize importing or publishing planning data.
