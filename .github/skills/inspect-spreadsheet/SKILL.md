---
name: inspect-spreadsheet
description: Fetch Google Sheets metadata and selected ranges read-only to inspect the ABK Open Mic source or plan the next event. Use for tab discovery, spreadsheet layout questions, and data-contract investigation without publishing drafts.
---

# Inspect the organizer spreadsheet

## Boundaries

- Read `AGENTS.md`, `docs/ARCHITECTURE.md`, `src/lib/google-sheets.ts`, and
  the relevant event adapter first. `google-sheets.ts` owns the current
  spreadsheet ID; `src/lib/may-2026-program-data.ts` owns the May ranges and
  `src/lib/historical-program.ts` owns its positional mappings and validation.
  These are not
  a contract for signup data: new and existing planning tabs may change shape
  frequently as organizers iterate. Never assume any column will stay put.
- Inspection is read-only and does not authorize publishing new data. Never
  change sharing, write cells, change the website's ranges, or add a public
  debug endpoint for inspection.
- Use the existing `googleapis` dependency after `npm ci`, the Viewer service
  account, and only `https://www.googleapis.com/auth/spreadsheets.readonly`.
  Do not import the Next.js `server-only` adapter into a standalone script.
- Credentials stay in memory. Never print credentials, tokens, auth objects,
  raw Google errors, environment dumps, or full sheet responses. Do not save
  raw exports in the repository, fixtures, artifacts, PRs, or issue comments.
- Historical performer-name consent does not make contacts, private notes,
  or next-event drafts public. The parser's email check is not a privacy
  scrubber. Default to metadata and structural summaries.

## Discover tabs first

From the repository root, set `SPREADSHEET_ID` to the exact ID read from the
adapter (or a different source explicitly supplied by the organizer). Do not
search Drive or guess spreadsheet IDs. Then run this inline Node command:

```bash
SPREADSHEET_ID='<ID from the server adapter>' \
SHEETS_SERVICE_ACCOUNT="${SHEETS:?SHEETS agent secret is required}" \
node --input-type=module <<'NODE'
import { google } from 'googleapis';

try {
  const { client_email, private_key } = JSON.parse(process.env.SHEETS_SERVICE_ACCOUNT);
  if (!client_email || !private_key || !process.env.SPREADSHEET_ID) {
    throw new Error('Missing configuration');
  }
  const auth = new google.auth.GoogleAuth({
    credentials: { client_email, private_key },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const { data } = await sheets.spreadsheets.get({
    spreadsheetId: process.env.SPREADSHEET_ID,
    includeGridData: false,
    fields: 'sheets(properties(sheetId,title,gridProperties(rowCount,columnCount)))',
  });
  console.log(JSON.stringify(data.sheets?.map(({ properties }) => properties), null, 2));
} catch {
  console.error('Read-only Sheets inspection failed; check configuration, Viewer access, and Google API connectivity.');
  process.exitCode = 1;
}
NODE
```

This fetches tab names, IDs, and allocated dimensions, not cell values.
Dimensions are not populated-row counts. Treat even draft tab titles as
internal planning context, not content to copy verbatim into public reports.

If `SHEETS` is absent, ask a maintainer to set **Settings → Environments →
copilot → Environment secrets** and start a new session. Do not create a
credential file. Local maintainers may supply `SHEETS_SERVICE_ACCOUNT`
directly; standalone Node does not automatically load Next.js `.env.local`.

## Fetch the smallest relevant range

Confirm the tab and locate the current header row/section before requesting
data cells. Use bounded A1 ranges for exploratory reads (only the likely
header area first), quote tab names, and escape embedded apostrophes by doubling
them. Do not fetch entire tabs or unrelated contact/planning columns.

Locate columns primarily by **normalized header names**, not remembered A1
letters or offsets. Normalize Unicode, trim leading/trailing whitespace,
collapse whitespace/newlines, and compare case-insensitively. Map reviewed
aliases explicitly; do not guess that two similarly named fields mean the
same thing. Rebuild the header-to-index mapping on each inspection, retaining
original cell positions even when headers are blank. Check for moved or added
columns, repeated tables, merged headings, duplicates, and missing required
headers. If the mapping is ambiguous or a section has no headers, inspect a
small relevant area or ask the organizer rather than silently using historical
positions. Limit subsequent reads and public projections to reviewed fields.

Reuse the authentication above and replace the metadata request/output with
the following, passing a reviewed, bounded `SHEETS_RANGE` alongside
`SPREADSHEET_ID` in the command environment:

```javascript
if (!process.env.SHEETS_RANGE) throw new Error('Missing range');
const { data } = await sheets.spreadsheets.values.get({
  spreadsheetId: process.env.SPREADSHEET_ID,
  range: process.env.SHEETS_RANGE,
  majorDimension: 'ROWS',
  valueRenderOption: 'FORMATTED_VALUE',
});
const rows = data.values ?? [];
console.log(JSON.stringify({
  returnedRows: rows.length,
  populatedCellsPerRow: rows.map(row => row.filter(value => String(value).trim()).length),
}, null, 2));
```

This fetches cells into memory but prints only structural counts. Google omits
trailing empty cells/rows; keep positional indexes and pad sparse rows when
comparing columns. For approved headers or public values needed by the task,
replace the summary with an explicit projection of only the reviewed columns.
Do not print `data`, `rows`, or a whole workbook indiscriminately. Summarize
private planning findings without reproducing personal/contact details.

Historical implementation reference only (rediscover headers before using any
of these positions for planning data):

- Compare the exact May ranges in `may-2026-program-data.ts` with the positional
  mappings in `historical-program.ts`. The production agenda's open-ended `M95:W` range
  includes a heading row; do not reintroduce a fixed production end row.
- `values.get` does not expose the rich-link chip URI used for video references.
  If needed, use `spreadsheets.get` on only the reviewed J-column cells with
  grid data and a field mask selecting `chipRuns`, following the adapter's
  `chip.richLinkProperties.uri` extraction. Do not dump grid data.
- Reuse the pure `buildHistoricalProgram` projection through installed tsx
  when checking compatibility of approved historical inputs; preserve nine
  song columns before attaching a video URI. Do not apply this parser to
  unknown next-event layouts as if it established publication approval.

## Report and stop

Report source structure, relevant column/range differences, validation gaps,
and questions for organizers. Distinguish observed data from assumptions;
never infer next-event date, venue, consent, or publication approval.

Do not commit fetched data or switch the live adapter during a planning task.
If writes or broader access seem necessary, stop and ask the organizer rather
than expanding scope. For failures, report only a sanitized category (missing
configuration, access, network, or layout); never log the API error object,
which may contain request credentials.
