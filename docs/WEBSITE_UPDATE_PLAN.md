# Historical performance website update plan

## Goal

Update the public, read-only website to present four pages—overview, schedule,
songs, and gear—using a sanitized snapshot of the May 2026 performance data so
the site can be evaluated with representative historical content.

## Data and publication boundaries

- Treat the May 2026 timetable and gear tabs as the source for the historical
  preview.
- Publish performer names because participant consent has been confirmed.
- Exclude email addresses, contact details, spreadsheet-only calculations, and
  private planning notes.
- Do not invent an exact event date, venue, or other details that are absent
  from the spreadsheet.
- Label the content clearly as a May 2026 historical preview.
- Keep the curated snapshot behind the server-only data adapter so it can later
  be replaced by validated, read-only Google Sheets access.

## Data model

- Replace the acts-oriented preview model with typed event, song,
  schedule-entry, performer-role, and gear-item models.
- Use the May 2026 running-order section as the authoritative schedule,
  including setup, rehearsal, opening, closing, and teardown.
- Represent song credits, original artists, performers by role, durations, and
  approved reference links.
- Group gear by category and retain only owner, availability, and notes that
  are appropriate for public display.
- Validate required values, schedule ordering, durations, performer roles, and
  gear categories before returning public view models.

## Pages

### Overview (`/`)

- Introduce the May 2026 historical performance.
- Summarize the performance window, song count, participants, and equipment.
- Link prominently to schedule, songs, and gear.
- Avoid presenting unavailable event details as facts.

### Schedule (`/schedule`)

- Show the chronological running order in the event's
  `America/Los_Angeles` time zone.
- Distinguish operational entries such as setup and rehearsal from performed
  songs.
- Display song duration and changeover information where suitable.

### Songs (`/songs`)

- List each performed song with its original artist.
- Show consenting performers grouped by instrument or role.
- Include only approved reference links and public notes.
- Provide accessible empty states if no songs are available.

### Gear (`/gear`)

- Group equipment into backline, microphones, amplifiers, drums, instruments,
  and other support items.
- Show ownership and sharing availability without exposing private contact
  information.
- Clearly mark open or tentative equipment needs.

## Navigation and migration

- Replace the Acts navigation item and `/acts` page with Songs and `/songs`.
- Update overview calls to action and site copy for the four-page structure.
- Redirect `/acts` to `/songs` so existing links continue to work.
- Replace synthetic-content notices with historical-preview language.

## Verification

- Add tests for data projection, contact-detail exclusion, malformed records,
  schedule ordering, performer roles, and gear grouping.
- Verify all four pages at mobile and desktop widths and with keyboard
  navigation.
- Confirm raw spreadsheet rows and credentials never reach rendered HTML or
  client bundles.
- Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`.
- Keep the architecture and README aligned with the implemented routes and
  publication policy.
