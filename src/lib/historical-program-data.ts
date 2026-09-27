import "server-only";
import { cacheLife } from "next/cache";
import { google } from "googleapis";
import { buildHistoricalProgram } from "./historical-program";

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

export async function getHistoricalProgram() {
  "use cache";

  cacheLife("hours");

  const auth = new google.auth.GoogleAuth({
    credentials: serviceAccountCredentials(),
    scopes: [READ_ONLY_SCOPE],
  });
  const sheets = google.sheets({ version: "v4", auth });
  const response = await sheets.spreadsheets.values.batchGet({
    spreadsheetId: SPREADSHEET_ID,
    ranges: [
      "'Time Table (May 2026)'!A2:I15",
      "'Time Table (May 2026)'!M95:W114",
      "'Gear (May 2026)'!B3:G67",
    ],
    majorDimension: "ROWS",
    valueRenderOption: "FORMATTED_VALUE",
  });
  const [songs, schedule, gear] = response.data.valueRanges ?? [];

  return buildHistoricalProgram({
    songsRows: songs?.values ?? [],
    scheduleRows: schedule?.values ?? [],
    gearRows: gear?.values ?? [],
  });
}
