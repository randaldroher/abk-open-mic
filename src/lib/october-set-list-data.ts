import 'server-only';
import { cacheLife } from 'next/cache';
import { getSheetsClient, SPREADSHEET_ID } from './google-sheets';
import { withLastKnownGood } from './last-known-good';
import { columnLetter, quoteSheetTab, sheetHeaderRange } from './sheet-layout';
import { octoberSetListColumns, projectOctoberSetList } from './october-set-list';
import type { OctoberSignupPerformer } from './october-signup';
import {
  octoberPracticeColumn,
  projectOctoberPracticeSessions,
  projectOctoberPracticeSongs,
  sanitizeOctoberPracticeValue,
} from './october-practice';

const TAB = 'Time Table (October 2026)';

async function readTimetable() {
  'use cache';
  cacheLife('minutes');
  try {
    const sheets = getSheetsClient();
    const headerResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: sheetHeaderRange(TAB, 1),
      valueRenderOption: 'FORMATTED_VALUE',
    });
    const headers = headerResponse.data.values?.[0]?.map(String) ?? [];
    const mapping = octoberSetListColumns(headers);
    const practiceColumn = octoberPracticeColumn(headers);
    const columns = [
      mapping.song,
      mapping.artist,
      ...mapping.roles.map(({ column }) => column),
      ...(practiceColumn === null ? [] : [practiceColumn]),
    ];
    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: SPREADSHEET_ID,
      ranges: columns.map((column) => `${quoteSheetTab(TAB)}!${columnLetter(column)}2:${columnLetter(column)}`),
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
        const value = String(values[index]?.values?.[rowIndex]?.[0] ?? '');
        row[column] =
          column === practiceColumn
            ? sanitizeOctoberPracticeValue(value)
            : value;
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
    practiceSongs: projectOctoberPracticeSongs(
      data.headers,
      data.rows,
      performers,
    ),
    practiceSessions: projectOctoberPracticeSessions(
      data.headers,
      data.rows,
      performers,
    ),
    fetchedAt: data.fetchedAt,
  };
}
