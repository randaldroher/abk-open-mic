import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getYouTubeVideoId,
  octoberSignupPerformerColumns,
  octoberSignupSectionRows,
  octoberSignupSongColumns,
  projectOctoberSignupPerformers,
  projectOctoberSignupSongs,
  songsInterestedByPerformer,
  sortPerformersByInitials,
  sortSongsByOriginalArtist,
} from './october-signup';

test('locates signup sections by their normalized marker cells', () => {
  assert.deepEqual(
    octoberSignupSectionRows([
      '',
      ' Performers ',
      'Name',
      'Added performer row',
      '',
      '  SONGS\n',
      'Song',
    ]),
    { performers: 2, songs: 6 },
  );
});

test('fails closed when signup section markers are missing, duplicated, or reversed', () => {
  for (const firstColumn of [
    ['Performers'],
    ['Performers', 'Songs', 'Songs'],
    ['Songs', 'Performers'],
  ]) {
    assert.throws(
      () => octoberSignupSectionRows(firstColumn),
      /Invalid October signup sections/,
    );
  }
});

test("maps October signup songs from normalized headers, including the sheet's artist typo", () => {
  assert.deepEqual(
    octoberSignupSongColumns([
      ' Song ',
      'Orginal   Artist',
      'Suggested By',
      'Vocals',
    ]),
    {
      song: 0,
      artist: 1,
      video: null,
      roles: [{ column: 3, role: 'Vocal' }],
    },
  );
});

test('projects song interests as names without suggested-by or comments', () => {
  const headers = [
    'Song',
    'Original Artist',
    'Suggested By',
    'Vocals',
    'Comments',
    'YouTube Link',
  ];
  const rows = [
    [
      '  First song  ',
      ' Artist One ',
      'Person One',
      'AB, CD, Known name',
      'Private comment',
      'not a public URL',
    ],
    ['Second song', '', 'Person Two', 'CD', 'Another comment', ''],
    ['', '', '', '', ''],
  ];

  assert.deepEqual(
    projectOctoberSignupSongs(
      headers,
      rows,
      new Map([
        ['AB', 'Alex Brown'],
        ['CD', 'Casey Doe'],
      ]),
    ),
    [
      {
        title: 'First song',
        originalArtist: 'Artist One',
        interestedPerformers: [
          { initials: 'AB', name: 'Alex Brown', roles: ['Vocal'] },
          { initials: 'CD', name: 'Casey Doe', roles: ['Vocal'] },
        ],
        videoId: null,
      },
      {
        title: 'Second song',
        originalArtist: null,
        interestedPerformers: [
          { initials: 'CD', name: 'Casey Doe', roles: ['Vocal'] },
        ],
        videoId: null,
      },
    ],
  );
});

test('fails closed for ambiguous headers and rows without a song title', () => {
  assert.throws(
    () => octoberSignupSongColumns(['Song', 'Title']),
    /Invalid October signup song headers/,
  );
  assert.throws(
    () =>
      projectOctoberSignupSongs(
        ['Song', 'Artist', 'Vocals'],
        [['', 'Artist', 'AB']],
        new Map([['AB', 'Alex Brown']]),
      ),
    /Invalid October signup song rows/,
  );
});

test('projects names, initials, recognized roles, and entered genres only', () => {
  const headers = ['Name', 'Initials', 'Roles', 'Genres', 'Notes'];
  assert.deepEqual(octoberSignupPerformerColumns(headers), {
    name: 0,
    initials: 1,
    roles: 2,
    genres: 3,
  });
  assert.deepEqual(
    projectOctoberSignupPerformers(headers, [
      [
        'Alex Brown',
        'rd',
        'Lead Guitar, Rhythm Guitar, unknown prose',
        'Alt-Rock, K-pop / shoegaze',
        'Private note',
      ],
      [
        'Jamie Young',
        'KL',
        'Vocals and Keyboard',
        'Jazz',
        'Contact information',
      ],
      ['', '', '', '', ''],
    ]),
    [
      {
        name: 'Alex Brown',
        initials: 'RD',
        roles: ['Lead Guitar', 'Rhythm Guitar'],
        genres: 'Alt-Rock, K-pop / shoegaze',
      },
      {
        name: 'Jamie Young',
        initials: 'KL',
        roles: ['Vocal', 'Keyboard'],
        genres: 'Jazz',
      },
    ],
  );
});

test('omits name-like values from the initials column and recognizes only valid YouTube video URLs', () => {
  assert.deepEqual(
    projectOctoberSignupPerformers(
      ['Name', 'Initials', 'Roles', 'Genres'],
      [
        ['Alex Brown', 'RD', 'Guitar', 'Rock'],
        ['alex@example.com', 'AB', 'Vocal', 'Jazz'],
      ],
    ),
    [{ name: 'Alex Brown', initials: 'RD', roles: ['Guitar'], genres: 'Rock' }],
  );
  assert.equal(
    getYouTubeVideoId(
      'https://www.youtube.com/watch?v=EjaQdBcF6K4&list=RDEjaQdBcF6K4',
    ),
    'EjaQdBcF6K4',
  );
  assert.equal(
    getYouTubeVideoId('https://youtu.be/aCdiL5CzHNo'),
    'aCdiL5CzHNo',
  );
  assert.equal(
    getYouTubeVideoId('https://example.com/watch?v=EjaQdBcF6K4'),
    null,
  );
});

test('accepts long alphabetic initials and resolves them in song interests', () => {
  const performers = projectOctoberSignupPerformers(
    ['Name', 'Initials', 'Roles', 'Genres'],
    [['Occkyoung', 'OCKYOUNG', 'Vocal', 'Rock']],
  );
  assert.deepEqual(performers, [
    {
      name: 'Occkyoung',
      initials: 'OCKYOUNG',
      roles: ['Vocal'],
      genres: 'Rock',
    },
  ]);
  assert.deepEqual(
    projectOctoberSignupSongs(
      ['Song', 'Artist', 'Vocals'],
      [['A song', 'An artist', 'OCKYOUNG']],
      new Map(performers.map(({ initials, name }) => [initials, name])),
    )[0].interestedPerformers,
    [{ initials: 'OCKYOUNG', name: 'Occkyoung', roles: ['Vocal'] }],
  );
});

test('uses rich-link YouTube URLs for song references', () => {
  const headers = ['Song', 'Orginal Artist', 'Vocals', 'YouTube Link'];
  const rows = [['Song One', 'Artist', 'AB', 'Video title']];
  assert.deepEqual(
    projectOctoberSignupSongs(headers, rows, new Map([['AB', 'Alex Brown']]), [
      'https://www.youtube.com/watch?v=tKjZuykKY1I',
    ]),
    [
      {
        title: 'Song One',
        originalArtist: 'Artist',
        interestedPerformers: [
          { initials: 'AB', name: 'Alex Brown', roles: ['Vocal'] },
        ],
        videoId: 'tKjZuykKY1I',
      },
    ],
  );
});

test('resolves initials and combines role interests under each consented name', () => {
  assert.deepEqual(
    projectOctoberSignupSongs(
      ['Song', 'Original Artist', 'Vocals', 'Lead Guitar', 'Rhythm Guitar'],
      [['The Song', 'Artist', 'RD', 'RD', 'YM']],
      new Map([
        ['RD', 'Alex Brown'],
        ['YM', 'Jamie Young'],
      ]),
    )[0].interestedPerformers,
    [
      {
        initials: 'RD',
        name: 'Alex Brown',
        roles: ['Vocal', 'Lead Guitar'],
      },
      { initials: 'YM', name: 'Jamie Young', roles: ['Rhythm Guitar'] },
    ],
  );
});

test('matches proposed song interests by initials, even when names overlap', () => {
  const songs = projectOctoberSignupSongs(
    ['Song', 'Artist', 'Vocals', 'Guitar'],
    [
      ['First song', 'Artist One', 'AB', 'CD'],
      ['Second song', '', 'CD', 'CD'],
      ['Unclaimed song', 'Artist Two', '', ''],
    ],
    new Map([
      ['AB', 'Same Name'],
      ['CD', 'Same Name'],
    ]),
  );

  assert.deepEqual(songsInterestedByPerformer(songs, 'AB'), [
    { title: 'First song', originalArtist: 'Artist One', roles: ['Vocal'] },
  ]);
  assert.deepEqual(songsInterestedByPerformer(songs, 'CD'), [
    { title: 'First song', originalArtist: 'Artist One', roles: ['Guitar'] },
    {
      title: 'Second song',
      originalArtist: null,
      roles: ['Vocal', 'Guitar'],
    },
  ]);
  assert.deepEqual(songsInterestedByPerformer(songs, 'EF'), []);
});

test('sorts songs by original artist, then title, and puts missing artists last', () => {
  const songs = [
    {
      title: 'Untitled credit',
      originalArtist: null,
      interestedPerformers: [],
      videoId: null,
    },
    {
      title: 'Second A song',
      originalArtist: 'Artist A',
      interestedPerformers: [],
      videoId: null,
    },
    {
      title: 'Artist B song',
      originalArtist: 'Artist B',
      interestedPerformers: [],
      videoId: null,
    },
    {
      title: 'First A song',
      originalArtist: 'Artist A',
      interestedPerformers: [],
      videoId: null,
    },
  ];

  assert.deepEqual(
    sortSongsByOriginalArtist(songs).map(({ title }) => title),
    ['First A song', 'Second A song', 'Artist B song', 'Untitled credit'],
  );
  assert.equal(songs[0].title, 'Untitled credit');
});

test('sorts performers alphabetically by initials without mutating the source array', () => {
  const performers = [
    { name: 'Jamie Young', initials: 'YM', roles: ['Vocal'], genres: 'Pop' },
    { name: 'Casey Lee', initials: 'KL', roles: ['Vocal'], genres: 'Jazz' },
    { name: 'Alex Brown', initials: 'RD', roles: ['Guitar'], genres: 'Rock' },
  ];

  assert.deepEqual(
    sortPerformersByInitials(performers).map(({ name }) => name),
    ['Casey Lee', 'Alex Brown', 'Jamie Young'],
  );
  assert.equal(performers[0].initials, 'YM');
});
