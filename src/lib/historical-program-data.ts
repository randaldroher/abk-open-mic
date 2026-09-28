import "server-only";
import { cacheLife, io } from "next/cache";
import { google } from "googleapis";
import { buildHistoricalProgram } from "./historical-program";
import { withLastKnownGood } from "./last-known-good";

const SPREADSHEET_ID = "17jHvnjnWp5x6lne5SrOMFQBtISrYMeo7o0jethdRKHA";
const READ_ONLY_SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly";

function serviceAccountCredentials() {
  const rawCredentials = process.env.SHEETS_SERVICE_ACCOUNT;
  if (!rawCredentials) {
    throw new Error("Sheets service account is not configured");
  }

  try {
    const credentials: unknown = JSON.parse(rawCredentials);
    if (
      typeof credentials !== "object" ||
      credentials === null ||
      !("client_email" in credentials) ||
      !("private_key" in credentials) ||
      typeof credentials.client_email !== "string" ||
      typeof credentials.private_key !== "string"
    ) {
      throw new Error("Invalid credentials");
    }
    return {
      client_email: credentials.client_email,
      private_key: credentials.private_key,
    };
  } catch {
    throw new Error("Sheets service account is not configured");
  }
}

async function readHistoricalProgram() {
  "use cache";

  cacheLife("minutes");

  const auth = new google.auth.GoogleAuth({
    credentials: serviceAccountCredentials(),
    scopes: [READ_ONLY_SCOPE],
  });
  const sheets = google.sheets({ version: "v4", auth });
  const [rowsResponse, linksResponse] = await Promise.all([
    sheets.spreadsheets.values.batchGet({
      spreadsheetId: SPREADSHEET_ID,
      ranges: [
        "'Time Table (May 2026)'!A2:I15",
        "'Time Table (May 2026)'!M95:W114",
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

  return buildHistoricalProgram({
    songsRows,
    scheduleRows: schedule?.values ?? [],
    gearRows: gear?.values ?? [],
  });
}

const loadHistoricalProgram = withLastKnownGood(readHistoricalProgram);

export async function getHistoricalProgram() {
  await io();
  return loadHistoricalProgram();
}
