import "server-only";
import { cache } from "react";
import { cacheLife } from "next/cache";
import { getSheetsClient, SPREADSHEET_ID } from "./google-sheets";
import { withLastKnownGood } from "./last-known-good";
import {
  pastEventSongColumns,
  projectPastEventSongs,
  type PastEventSong,
} from "./past-event-songs";

export type PastEventSongs = {
  eventTitle: string;
  fetchedAt: string;
  songs: PastEventSong[];
};

const EVENT_SHEETS = {
  july2025: { tab: "Time Table (Jul 2025)", title: "ABK Open Mic — July 2025" },
  december2025: { tab: "Time Table (Dec 2025)", title: "ABK Open Mic — December 2025" },
} as const;

function columnLetter(index: number): string {
  let value = index + 1;
  let column = "";
  while (value > 0) {
    value -= 1;
    column = String.fromCharCode(65 + value % 26) + column;
    value = Math.floor(value / 26);
  }
  return column;
}

async function readPastEventSongs(eventKey: keyof typeof EVENT_SHEETS): Promise<PastEventSongs> {
  "use cache";

  cacheLife("minutes");

  const { tab, title } = EVENT_SHEETS[eventKey];
  const quotedTab = `'${tab.replaceAll("'", "''")}'`;
  const sheets = getSheetsClient();
  const headerResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${quotedTab}!A1:ZZ1`,
    majorDimension: "ROWS",
    valueRenderOption: "FORMATTED_VALUE",
  });
  const headers = headerResponse.data.values?.[0]?.map((value) => String(value)) ?? [];
  const columns = pastEventSongColumns(headers);
  const rowsResponse = await sheets.spreadsheets.values.batchGet({
    spreadsheetId: SPREADSHEET_ID,
    ranges: columns.map((column) => `${quotedTab}!${columnLetter(column)}2:${columnLetter(column)}`),
    majorDimension: "ROWS",
    valueRenderOption: "FORMATTED_VALUE",
  });
  const columnValues = rowsResponse.data.valueRanges?.map(({ values }) => values ?? []) ?? [];
  const rowCount = Math.max(0, ...columnValues.map((values) => values.length));
  const rows = Array.from({ length: rowCount }, (_, rowIndex) => {
    const row = Array.from({ length: headers.length }, () => "");
    columns.forEach((column, columnIndex) => {
      row[column] = String(columnValues[columnIndex]?.[rowIndex]?.[0] ?? "");
    });
    return row;
  });
  const songs = projectPastEventSongs(headers, rows);
  return { eventTitle: title, fetchedAt: new Date().toISOString(), songs };
}

function createLoader(eventKey: keyof typeof EVENT_SHEETS) {
  return cache(withLastKnownGood(() => readPastEventSongs(eventKey)));
}

export const getJuly2025Songs = createLoader("july2025");
export const getDecember2025Songs = createLoader("december2025");
