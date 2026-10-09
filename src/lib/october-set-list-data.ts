import 'server-only';
import { cacheLife } from 'next/cache';
import { getSheetsClient, SPREADSHEET_ID } from './google-sheets';
import { withLastKnownGood } from './last-known-good';
import { octoberSetListColumns, projectOctoberSetList } from './october-set-list';
import type { OctoberSignupPerformer } from './october-signup';

const TAB = "'Time Table (October 2026)'";

function columnLetter(index: number): string {
  let value = index + 1;
  let result = '';
  while (value > 0) {
    value -= 1;
    result = String.fromCharCode(65 + value % 26) + result;
    value = Math.floor(value / 26);
  }
  return result;
}

async function readTimetable() {
  'use cache';
  cacheLife('minutes');
  try {
    const sheets = getSheetsClient();
    const headerResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${TAB}!A1:Z1`,
      valueRenderOption: 'FORMATTED_VALUE',
    });
    const headers = headerResponse.data.values?.[0]?.map(String) ?? [];
    const mapping = octoberSetListColumns(headers);
    const columns = [
      mapping.song,
      mapping.artist,
      ...mapping.roles.map(({ column }) => column),
    ];
    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: SPREADSHEET_ID,
      ranges: columns.map((column) => `${TAB}!${columnLetter(column)}2:${columnLetter(column)}`),
      valueRenderOption: 'FORMATTED_VALUE',
      majorDimension: 'ROWS',
    });
    const values = response.data.valueRanges ?? [];
    const songValues = values[0]?.values ?? [];
    const blank = songValues.findIndex((row) => !String(row[0] ?? '').trim());
    const length = blank === -1 ? songValues.length : blank;
    const rows = Array.from({ length }, (_, rowIndex) => {
      const row = Array<string>(headers.length).fill('');
      columns.forEach((column, index) => {
        row[column] = String(values[index]?.values?.[rowIndex]?.[0] ?? '');
      });
      return row;
    });
    // Validate before retaining a last-known-good public timetable.
    projectOctoberSetList(headers, rows, []);
    return { headers, rows, fetchedAt: new Date().toISOString() };
  } catch {
    return null;
  }
}

const getTimetable = withLastKnownGood(readTimetable);

export async function getOctoberSetList(performers: OctoberSignupPerformer[]) {
  const data = await getTimetable();
  if (!data) return null;
  return {
    ...projectOctoberSetList(data.headers, data.rows, performers),
    fetchedAt: data.fetchedAt,
  };
}
