import 'server-only';
import { cache } from 'react';
import { cacheLife } from 'next/cache';
import { getSheetsClient, SPREADSHEET_ID } from './google-sheets';
import { withLastKnownGood } from './last-known-good';
import {
  getYouTubeVideoId,
  octoberSignupPerformerColumns,
  octoberSignupSongColumns,
  projectOctoberSignupPerformers,
  projectOctoberSignupSongs,
  type OctoberSignupPerformer,
  type OctoberSignupSong,
} from './october-signup';

export type October2026Signup = {
  eventTitle: string;
  fetchedAt: string;
  songs: OctoberSignupSong[];
  performers: OctoberSignupPerformer[];
};

const TAB = 'Sign Up (October 2026)';
const PERFORMER_HEADER_ROW = 3;
const FIRST_PERFORMER_ROW = PERFORMER_HEADER_ROW + 1;
const SONG_HEADER_ROW = 17;
const FIRST_SONG_ROW = SONG_HEADER_ROW + 1;

function columnLetter(index: number): string {
  let value = index + 1;
  let column = '';
  while (value > 0) {
    value -= 1;
    column = String.fromCharCode(65 + (value % 26)) + column;
    value = Math.floor(value / 26);
  }
  return column;
}

function valuesByColumn(
  columns: number[],
  values: Array<Array<Array<string | number | boolean>> | undefined>,
  rowCount: number,
  headerLength: number,
): string[][] {
  return Array.from({ length: rowCount }, (_, rowIndex) => {
    const row = Array.from({ length: headerLength }, () => '');
    columns.forEach((column, columnIndex) => {
      row[column] = String(values[columnIndex]?.[rowIndex]?.[0] ?? '');
    });
    return row;
  });
}

async function readOctober2026Signup(): Promise<October2026Signup> {
  'use cache';

  cacheLife('minutes');

  const sheets = getSheetsClient();
  const quotedTab = `'${TAB.replaceAll("'", "''")}'`;
  const [performerHeaderResponse, songHeaderResponse] = await Promise.all([
    sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${quotedTab}!A${PERFORMER_HEADER_ROW}:Z${PERFORMER_HEADER_ROW}`,
      majorDimension: 'ROWS',
      valueRenderOption: 'FORMATTED_VALUE',
    }),
    sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${quotedTab}!A${SONG_HEADER_ROW}:Z${SONG_HEADER_ROW}`,
      majorDimension: 'ROWS',
      valueRenderOption: 'FORMATTED_VALUE',
    }),
  ]);
  const performerHeaders =
    performerHeaderResponse.data.values?.[0]?.map(String) ?? [];
  const songHeaders = songHeaderResponse.data.values?.[0]?.map(String) ?? [];
  const performerColumns = octoberSignupPerformerColumns(performerHeaders);
  const songColumns = octoberSignupSongColumns(songHeaders);
  const performerPublicColumns = [
    ...new Set([
      performerColumns.name,
      performerColumns.initials,
      performerColumns.roles,
      performerColumns.genres,
    ]),
  ];
  const songPublicColumns = [
    ...new Set([
      songColumns.song,
      ...(songColumns.artist === null ? [] : [songColumns.artist]),
      ...songColumns.roles.map(({ column }) => column),
      ...(songColumns.video === null ? [] : [songColumns.video]),
    ]),
  ];
  const performerRanges = performerPublicColumns.map((column) => {
    const letter = columnLetter(column);
    return `${quotedTab}!${letter}${FIRST_PERFORMER_ROW}:${letter}${SONG_HEADER_ROW - 1}`;
  });
  const songRanges = songPublicColumns.map((column) => {
    const letter = columnLetter(column);
    return `${quotedTab}!${letter}${FIRST_SONG_ROW}:${letter}`;
  });
  const [performerRowsResponse, songRowsResponse, videoChipResponse] =
    await Promise.all([
      sheets.spreadsheets.values.batchGet({
        spreadsheetId: SPREADSHEET_ID,
        ranges: performerRanges,
        majorDimension: 'ROWS',
        valueRenderOption: 'FORMATTED_VALUE',
      }),
      sheets.spreadsheets.values.batchGet({
        spreadsheetId: SPREADSHEET_ID,
        ranges: songRanges,
        majorDimension: 'ROWS',
        valueRenderOption: 'FORMATTED_VALUE',
      }),
      songColumns.video === null
        ? Promise.resolve(null)
        : sheets.spreadsheets.get({
            spreadsheetId: SPREADSHEET_ID,
            ranges: [
              `${quotedTab}!${columnLetter(songColumns.video)}${FIRST_SONG_ROW}:${columnLetter(songColumns.video)}`,
            ],
            includeGridData: true,
            fields:
              'sheets(data(rowData(values(chipRuns(chip(richLinkProperties(uri)))))))',
          }),
    ]);

  const performerColumnValues =
    performerRowsResponse.data.valueRanges?.map(({ values }) => values ?? []) ??
    [];
  const performerRows = valuesByColumn(
    performerPublicColumns,
    performerColumnValues,
    SONG_HEADER_ROW - FIRST_PERFORMER_ROW,
    performerHeaders.length,
  );
  const performers = projectOctoberSignupPerformers(
    performerHeaders,
    performerRows,
  );
  const performerNamesByInitials = new Map(
    performers.map(({ initials, name }) => [initials, name]),
  );

  const songColumnValues =
    songRowsResponse.data.valueRanges?.map(({ values }) => values ?? []) ?? [];
  const songRowCount = Math.max(
    0,
    ...songColumnValues.map((values) => values.length),
  );
  const songRows = valuesByColumn(
    songPublicColumns,
    songColumnValues,
    songRowCount,
    songHeaders.length,
  );
  const videoChipRows =
    videoChipResponse?.data.sheets?.[0]?.data?.[0]?.rowData ?? [];
  const chipLinks = videoChipRows.map((row) => {
    const uri = row.values?.[0]?.chipRuns?.[0]?.chip?.richLinkProperties?.uri;
    return uri ? (getYouTubeVideoId(uri) ? uri : null) : null;
  });
  const songs = projectOctoberSignupSongs(
    songHeaders,
    songRows,
    performerNamesByInitials,
    chipLinks,
  );

  return {
    eventTitle: 'ABK Open Mic October 2026',
    fetchedAt: new Date().toISOString(),
    songs,
    performers,
  };
}

export const getOctober2026Signup = cache(
  withLastKnownGood(readOctober2026Signup),
);
