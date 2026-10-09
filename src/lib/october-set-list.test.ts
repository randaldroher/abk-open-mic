import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getRoleCandidates,
  getSongAnchor,
  getSongRoleNeeds,
  mergeDuplicateSignupSongs,
  octoberSetListColumns,
  projectOctoberSetList,
  setListSongsByPerformer,
} from './october-set-list';
import type { OctoberSignupPerformer } from './october-signup';

const performers: OctoberSignupPerformer[] = [
  { name: 'Alex', initials: 'AB', roles: ['Vocal', 'Guitar'], genres: '' },
  { name: 'Sam', initials: 'CD', roles: ['Bass'], genres: '' },
  { name: 'Jamie', initials: 'EF', roles: ['Guitar'], genres: '' },
];

test('discovers moved headers and ignores private columns', () => {
  const result = projectOctoberSetList(
    ['Comments', ' Bass ', ' SONG\n', 'Practice', 'Original Artist', 'Vocal', 'Link'],
    [['private', 'Needed!', 'A song', 'private', 'An artist', 'ab', 'private']],
    performers,
  );
  assert.deepEqual(result, {
    roles: ['Bass', 'Vocal'],
    songs: [{
      title: 'A song', originalArtist: 'An artist',
      roles: [
        { role: 'Bass', performers: [], status: 'needed', detail: null },
        { role: 'Vocal', performers: [{ initials: 'AB', name: 'Alex' }], status: null, detail: null },
      ],
    }],
  });
  assert.ok(!JSON.stringify(result).includes('private'));
});

test('resolves multiple initials, blanks, n/a and known role-need markers only', () => {
  const result = projectOctoberSetList(
    ['Song', 'Original Artist', 'Vocal', 'Lead Guitar', 'Bass', 'Drum', 'Additional Instruments'],
    [
      ['First', 'Artist', 'ab + AB / CD', 'Nice to have', 'NEEDED!', 'n/a', 'Nice to have (strings)'],
      ['Second', '', 'Unknown initials / note@example.com', '', '', '', 'Nice to have (private note)'],
    ],
    performers,
  );
  assert.deepEqual(result.songs[0].roles[0].performers, [
    { initials: 'AB', name: 'Alex' }, { initials: 'CD', name: 'Sam' },
  ]);
  assert.equal(result.songs[0].roles[1].status, 'nice-to-have');
  assert.equal(result.songs[0].roles[2].status, 'needed');
  assert.equal(result.songs[0].roles[4].detail, 'strings');
  assert.ok(result.songs[1].roles.every(({ performers, status, detail }) =>
    performers.length === 0 && status === null && detail === null,
  ));
});

test('stops at the song-table boundary and rejects invalid or ambiguous headers', () => {
  const headers = ['Song', 'Original Artist', 'Vocal'];
  assert.equal(projectOctoberSetList(headers, [
    ['Public song', 'Artist', 'AB'], [], ['Private schedule', 'Notes', 'AB'],
  ], performers).songs.length, 1);
  for (const invalid of [
    ['Song', 'Vocal'],
    ['Song', 'Artist', 'Original Artist', 'Vocal'],
    ['Song', 'Artist', 'Drum', 'Drums'],
    ['Song', 'Artist', 'Comments'],
    ['Song', 'Title', 'Artist', 'Vocal'],
  ]) {
    assert.throws(() => octoberSetListColumns(invalid));
  }
  assert.throws(() => projectOctoberSetList(headers, [], performers));
  assert.throws(() => projectOctoberSetList(headers, [['contact@example.com']], performers));
});

test('n/a never resolves as single-letter performer initials', () => {
  const { songs } = projectOctoberSetList(
    ['Song', 'Artist', 'Vocal'],
    [['Song', 'Artist', 'N/A']],
    [
      { name: 'Nora', initials: 'N', roles: ['Vocal'], genres: '' },
      { name: 'Alex', initials: 'A', roles: ['Vocal'], genres: '' },
    ],
  );
  assert.deepEqual(songs[0].roles[0].performers, []);
});

test('counts unique songs across roles and matches identities, not display names', () => {
  const { songs } = projectOctoberSetList(
    ['Song', 'Artist', 'Vocal', 'Lead Guitar', 'Bass'],
    [
      ['One', 'Artist', 'AB', 'AB', 'CD'],
      ['One', 'Artist', 'AB', '', ''],
      ['Two', 'Artist', 'AB', '', ''],
    ],
    performers,
  );
  assert.deepEqual(setListSongsByPerformer(songs, 'AB'), [
    { title: 'One', originalArtist: 'Artist', roles: ['Vocal', 'Lead Guitar'] },
    { title: 'Two', originalArtist: 'Artist', roles: ['Vocal'] },
  ]);
  assert.deepEqual(getRoleCandidates('Rhythm Guitar', performers, songs), [
    { initials: 'EF', name: 'Jamie', count: 0 },
    { initials: 'AB', name: 'Alex', count: 2 },
  ]);
  assert.deepEqual(getRoleCandidates('Bass', performers, songs), [
    { initials: 'CD', name: 'Sam', count: 1 },
  ]);
  assert.deepEqual(getRoleCandidates('Keyboard', performers, songs), []);
});

test('merges duplicate signup songs by anchor, performer initials, roles and available video', () => {
  const songs = [
    {
      title: ' A Song ',
      originalArtist: 'Artist',
      interestedPerformers: [
        { initials: 'AB', name: 'Alex', roles: ['Vocal'] },
      ],
      videoId: null,
    },
    {
      title: 'a song',
      originalArtist: ' ARTIST ',
      interestedPerformers: [
        { initials: 'AB', name: 'Alex', roles: ['Bass'] },
        { initials: 'CD', name: 'Alex', roles: ['Vocal'] },
      ],
      videoId: 'first-video',
    },
    {
      title: 'A Song',
      originalArtist: 'artist',
      interestedPerformers: [],
      videoId: 'later-video',
    },
    {
      title: 'A Song',
      originalArtist: 'Other Artist',
      interestedPerformers: [],
      videoId: null,
    },
  ];

  assert.deepEqual(mergeDuplicateSignupSongs(songs), [
    {
      title: ' A Song ',
      originalArtist: 'Artist',
      interestedPerformers: [
        { initials: 'AB', name: 'Alex', roles: ['Vocal', 'Bass'] },
        { initials: 'CD', name: 'Alex', roles: ['Vocal'] },
      ],
      videoId: 'first-video',
    },
    {
      title: 'A Song',
      originalArtist: 'Other Artist',
      interestedPerformers: [],
      videoId: null,
    },
  ]);
});

test('anchors are stable, distinguish artist credits and match role needs', () => {
  assert.equal(getSongAnchor(' A Song ', 'ARTIST'), getSongAnchor('a song', 'artist'));
  assert.notEqual(getSongAnchor('A Song', null), getSongAnchor('A Song', 'Artist'));
  assert.notEqual(getSongAnchor('A | B', 'C'), getSongAnchor('A', 'B | C'));
  const { songs } = projectOctoberSetList(
    ['Song', 'Artist', 'Vocal', 'Bass'],
    [['A Song', 'Artist', 'AB', 'Needed!'], ['A Song', 'Other Artist', '', 'Nice to have']],
    performers,
  );
  assert.deepEqual(getSongRoleNeeds({ title: 'a song', originalArtist: 'artist' }, songs), [
    { role: 'Bass', performers: [], status: 'needed', detail: null },
  ]);
});
