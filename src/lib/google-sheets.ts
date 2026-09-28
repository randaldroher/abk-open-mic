import "server-only";
import { google } from "googleapis";

export const SPREADSHEET_ID = "17jHvnjnWp5x6lne5SrOMFQBtISrYMeo7o0jethdRKHA";

const READ_ONLY_SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly";

export function getSheetsClient() {
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
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: credentials.client_email,
        private_key: credentials.private_key,
      },
      scopes: [READ_ONLY_SCOPE],
    });
    return google.sheets({ version: "v4", auth });
  } catch {
    throw new Error("Sheets service account is not configured");
  }
}
