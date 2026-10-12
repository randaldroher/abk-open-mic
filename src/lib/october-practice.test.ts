import assert from 'node:assert/strict';
import test from 'node:test';
import { isPracticeDone, octoberAlwaysPresentPerformers, octoberPracticeColumn, projectOctoberPracticeSongs } from './october-practice';
import { projectOctoberSetList } from './october-set-list';

const performers = [{ initials: 'AB', name: 'Alex', roles: ['Vocal'], genres: '' }];

test('October attendance assumptions stay at the event boundary', () => {
  const roster = ['Donald S.', ' Randal ', 'Alex'].map((name, index) => ({
    initials: `P${index}`, name, roles: [], genres: '',
  }));
  assert.deepEqual(octoberAlwaysPresentPerformers(roster).map(({ initials }) => initials), ['P0', 'P1']);
});

test('discovers moved Practice headers and excludes only the normalized Done! marker', () => {
  const headers = ['Comments', ' PRACTICE\n', 'Artist', 'Vocal', 'Song', 'Link'];
  const rows = [
    ['private', ' Done! ', 'Artist', 'AB', 'Completed', 'private'],
    ['private', 'done!', 'Artist', 'AB', 'Also completed', 'private'],
    ['private', 'private rehearsal notes', 'Artist', 'AB', 'Pending', 'private'],
    ['private', '', 'Artist', 'AB', 'Blank status', 'private'],
    ['private', 'Not Done!', 'Artist', 'AB', 'Not completed', 'private'],
    [],
    ['private', '', 'Artist', 'AB', 'Beyond table', 'private'],
  ];
  assert.equal(octoberPracticeColumn(headers), 1);
  const songs = projectOctoberPracticeSongs(headers, rows, performers);
  assert.deepEqual(songs?.map(({ title }) => title), ['Pending', 'Blank status', 'Not completed']);
  assert.deepEqual(songs?.[0].roles[0].performers, [{ initials: 'AB', name: 'Alex' }]);
  assert.ok(!JSON.stringify(songs).includes('private'));
  assert.equal(projectOctoberSetList(headers, rows, performers).songs.length, 5);
});

test('missing or ambiguous Practice headers make practice unavailable without hiding Set List', () => {
  for (const headers of [
    ['Song', 'Artist', 'Vocal'],
    ['Song', 'Artist', 'Vocal', 'Practice', ' practice '],
  ]) {
    assert.equal(octoberPracticeColumn(headers), null);
    assert.equal(projectOctoberPracticeSongs(headers, [['Song', 'Artist', 'AB']], performers), null);
    assert.equal(projectOctoberSetList(headers, [['Song', 'Artist', 'AB']], performers).songs.length, 1);
  }
});

test('completed duplicate songs are excluded together while different artists remain eligible', () => {
  const songs = projectOctoberPracticeSongs(
    ['Song', 'Artist', 'Vocal', 'Practice'],
    [
      ['Same song', 'Artist', 'AB', ''],
      [' same SONG ', 'ARTIST', 'AB', 'Done!'],
      ['Same song', 'Other artist', 'AB', ''],
    ],
    performers,
  );
  assert.equal(songs?.length, 1);
  assert.equal(songs?.[0].originalArtist, 'Other artist');
});

test('all completed songs produce an empty eligible list and notes never match completion', () => {
  assert.deepEqual(projectOctoberPracticeSongs(
    ['Song', 'Artist', 'Vocal', 'Practice'],
    [['Song', 'Artist', 'AB', 'DONE!']],
    performers,
  ), []);
  for (const value of ['Done', 'Done! call someone', 'contact@example.com', '']) {
    assert.equal(isPracticeDone(value), false);
  }
});
