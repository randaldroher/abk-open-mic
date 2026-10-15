import assert from 'node:assert/strict';
import test from 'node:test';
import {
  isPracticeDone,
  octoberAlwaysPresentPerformers,
  octoberPracticeCalendarIcs,
  octoberPracticeCalendarUrl,
  octoberPracticeColumn,
  projectOctoberPracticeSessions,
  projectOctoberPracticeSongs,
  sanitizeOctoberPracticeValue,
} from './october-practice';
import { projectOctoberSetList } from './october-set-list';

const performers = [{ initials: 'AB', name: 'Alex', roles: ['Vocal'], genres: '' }];

test('practice calendar links serve provider-neutral iCalendar events', () => {
  assert.equal(
    octoberPracticeCalendarUrl('Monday', 'Early'),
    '/event-planning/practice/calendar/monday-early.ics',
  );
  const early = octoberPracticeCalendarIcs('Monday', 'Early');
  assert.ok(early.includes('DTSTART;TZID=America/Los_Angeles:20261019T193000'));
  assert.ok(early.includes('DTEND;TZID=America/Los_Angeles:20261019T200000'));
  assert.ok(early.includes('SUMMARY:ABK Open Mic Practice - Monday Early'));
  assert.ok(
    early.includes(
      'LOCATION:Stage One Studios\\, 23092 Terra Dr\\, Laguna Hills\\, CA 92653',
    ),
  );
  assert.ok(early.startsWith('BEGIN:VCALENDAR\r\n'));
  assert.ok(early.endsWith('END:VCALENDAR\r\n'));

  const late = octoberPracticeCalendarIcs('Thursday', 'Late');
  assert.ok(late.includes('DTSTART;TZID=America/Los_Angeles:20261022T200000'));
  assert.ok(late.includes('DTEND;TZID=America/Los_Angeles:20261022T223000'));
});

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

test('sanitizes Practice values to completion markers or recognized assignments', () => {
  assert.equal(
    sanitizeOctoberPracticeValue(' Thu Early - HIgh '),
    'Thursday Early - High',
  );
  assert.equal(
    sanitizeOctoberPracticeValue('Mon Late - low'),
    'Monday Late - Low',
  );
  assert.equal(sanitizeOctoberPracticeValue('DONE!'), 'Done!');
  assert.equal(sanitizeOctoberPracticeValue('private rehearsal notes'), '');
});

test('projects incomplete songs into four Practice-column day, slot, and difficulty groups', () => {
  const headers = ['Comments', 'Song', 'Artist', 'Vocal', 'Practice'];
  const rows = [
    ['private', 'Monday early', 'Artist', 'AB', 'Mon Early - High'],
    ['private', 'Monday late', 'Artist', 'AB', 'Monday Late - Medium'],
    ['private', 'Thursday done', 'Artist', 'AB', 'Done!'],
    ['private', 'Thursday early', 'Artist', 'AB', 'Thu Early - HIgh'],
    ['private', 'Thursday late', 'Artist', 'AB', 'Thursday Late - Low'],
  ];

  assert.deepEqual(
    projectOctoberPracticeSessions(headers, rows, performers)?.map(
      ({ day, slot, songs }) => ({
        day,
        slot,
        titles: songs.map(({ title, difficulty }) => ({ title, difficulty })),
      }),
    ),
    [
      {
        day: 'Monday',
        slot: 'Early',
        titles: [{ title: 'Monday early', difficulty: 'High' }],
      },
      {
        day: 'Monday',
        slot: 'Late',
        titles: [{ title: 'Monday late', difficulty: 'Medium' }],
      },
      {
        day: 'Thursday',
        slot: 'Early',
        titles: [{ title: 'Thursday early', difficulty: 'High' }],
      },
      {
        day: 'Thursday',
        slot: 'Late',
        titles: [{ title: 'Thursday late', difficulty: 'Low' }],
      },
    ],
  );
});

test('missing, ambiguous, or unrecognized Practice assignments are unavailable', () => {
  assert.equal(
    projectOctoberPracticeSessions(
      ['Song', 'Artist', 'Vocal'],
      [['Song', 'Artist', 'AB']],
      performers,
    ),
    null,
  );
  assert.equal(
    projectOctoberPracticeSessions(
      ['Song', 'Artist', 'Vocal', 'Practice', ' practice '],
      [['Song', 'Artist', 'AB', 'Thu Early - High', 'Thu Late - Low']],
      performers,
    ),
    null,
  );
  for (const assignment of ['', 'Friday Early - High', 'Thu Early - Urgent']) {
    assert.equal(
      projectOctoberPracticeSessions(
        ['Song', 'Artist', 'Vocal', 'Practice'],
        [['Song', 'Artist', 'AB', assignment]],
        performers,
      ),
      null,
    );
  }
});
