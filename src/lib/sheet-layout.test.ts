import assert from 'node:assert/strict';
import test from 'node:test';
import { columnLetter, quoteSheetTab, sheetHeaderRange } from './sheet-layout';
import { octoberSignupSongColumns } from './october-signup';
import { octoberSetListColumns } from './october-set-list';
import { octoberPracticeColumn } from './october-practice';

test('header reads cover the whole row and escape event tab names', () => {
  assert.equal(sheetHeaderRange("Next event's signup", 12), "'Next event''s signup'!12:12");
  assert.equal(quoteSheetTab('Future event'), "'Future event'");
  for (const row of [0, -1, 1.5, NaN]) {
    assert.throws(() => sheetHeaderRange('Event', row));
  }
});

test('public columns moved beyond Z remain discoverable', () => {
  const headers = [
    ...Array<string>(27).fill('Private field'),
    ' SONG ', ' Original\nArtist ', ' Vocal ', ' PRACTICE ', 'YouTube Link',
  ];
  assert.equal(octoberSignupSongColumns(headers).song, 27);
  assert.equal(octoberSetListColumns(headers).artist, 28);
  assert.equal(octoberPracticeColumn(headers), 30);
  assert.deepEqual([0, 25, 26, 27, 51, 52, 701, 702].map(columnLetter),
    ['A', 'Z', 'AA', 'AB', 'AZ', 'BA', 'ZZ', 'AAA']);
  for (const column of [-1, 0.5, Infinity]) {
    assert.throws(() => columnLetter(column));
  }
});

test('signup rejects duplicate role aliases instead of merging ambiguous columns', () => {
  for (const roles of [['Vocal', 'Vocals'], ['Drum', 'Drums'], ['Keys', 'Keyboard']]) {
    assert.throws(() => octoberSignupSongColumns(['Song', 'Artist', ...roles]));
  }
  assert.doesNotThrow(() => octoberSignupSongColumns(
    ['Song', 'Artist', 'Lead Guitar', 'Rhythm Guitar'],
  ));
});
