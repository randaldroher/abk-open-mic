import "server-only";
import { cache } from "react";
import { cacheLife } from "next/cache";
import { buildHistoricalProgram } from "./historical-program";
import { getSheetsClient, SPREADSHEET_ID } from "./google-sheets";
import { withLastKnownGood } from "./last-known-good";

async function readMay2026Program() {
  "use cache";

  cacheLife("minutes");

  const sheets = getSheetsClient();
  const [rowsResponse, linksResponse] = await Promise.all([
    sheets.spreadsheets.values.batchGet({
      spreadsheetId: SPREADSHEET_ID,
      ranges: [
        "'Time Table (May 2026)'!A2:I15",
        "'Time Table (May 2026)'!M95:W",
        "'Gear (May 2026)'!B3:G67",
      ],
      majorDimension: "ROWS",
      valueRenderOption: "FORMATTED_VALUE",
    }),
    sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
      ranges: ["'Time Table (May 2026)'!J2:J15"],
      includeGridData: true,
    }),
  ]);
  const [songs, schedule, gear] = rowsResponse.data.valueRanges ?? [];
  const videoCells = linksResponse.data.sheets?.[0]?.data?.[0]?.rowData ?? [];
  const songsRows = (songs?.values ?? []).map((row, index) => [
    ...Array.from({ length: 9 }, (_, column) => row[column] ?? ""),
    videoCells[index]?.values?.[0]?.chipRuns?.[0]?.chip?.richLinkProperties?.uri ?? "",
  ]);

  const program = buildHistoricalProgram({
    songsRows,
    scheduleRows: schedule?.values ?? [],
    gearRows: gear?.values ?? [],
  });
  return { ...program, fetchedAt: new Date().toISOString() };
}

const loadMay2026Program = withLastKnownGood(readMay2026Program);

export const getMay2026Program = cache(loadMay2026Program);
