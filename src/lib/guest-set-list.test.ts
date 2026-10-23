import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import GuestSetList from '../components/guest-set-list';
import { buildGuestSetList } from './guest-set-list';
import { projectOctoberSetList } from './october-set-list';
import type { OctoberSignupSong } from './october-signup';

const performers = [
  { initials: 'AB', name: 'Alex B.', roles: ['Vocals'], genres: '' },
  { initials: 'AC', name: 'Alex C.', roles: ['Guitar'], genres: '' },
];
const setList = projectOctoberSetList(
  ['Song', 'Artist', 'Vocals', 'Guitar', 'Bass'],
  [
    ['Zulu Song', 'Z Artist', 'AB', 'AB AC', 'Needed!'],
    ['Alpha Song', 'A Artist', '', '', 'Nice to have'],
    ['Zulu Song', 'Z Artist', 'AC', '', ''],
    ['Zulu Song', 'Other Artist', '', '', ''],
  ],
  performers,
).songs;
const references: OctoberSignupSong[] = [
  { title: 'Signup only', originalArtist: 'Artist', videoId: 'abcdefghijk', interestedPerformers: [] },
  { title: ' zulu song ', originalArtist: 'z artist', videoId: null, interestedPerformers: [] },
  {
    title: 'Zulu Song', originalArtist: 'Z Artist', videoId: 'abcdefghijk',
    interestedPerformers: [{ initials: 'ZZ', name: 'Interested only', roles: ['Bass'] }],
  },
];

test('guest set list preserves timetable order and repeats without exposing roles or interests', () => {
  const before = JSON.stringify({ setList, references });
  const songs = buildGuestSetList(setList, references);
  assert.deepEqual(songs, [
    { title: 'Zulu Song', originalArtist: 'Z Artist', performers: ['Alex B.', 'Alex C.'], videoId: 'abcdefghijk' },
    { title: 'Alpha Song', originalArtist: 'A Artist', performers: [], videoId: null },
    { title: 'Zulu Song', originalArtist: 'Z Artist', performers: ['Alex C.'], videoId: 'abcdefghijk' },
    { title: 'Zulu Song', originalArtist: 'Other Artist', performers: [], videoId: null },
  ]);
  assert.equal(JSON.stringify({ setList, references }), before);
  assert.deepEqual(buildGuestSetList([], references), []);
  assert.equal(buildGuestSetList(setList, [])[0].videoId, null);
});

test('guest set list initially renders an ordered, collapsed mobile list without video requests', () => {
  const html = renderToStaticMarkup(createElement(GuestSetList, {
    songs: buildGuestSetList(setList, references),
  }));
  assert.match(html, /<ol[^>]+aria-label="Set list in performance order"/);
  assert.equal((html.match(/<li\b/g) ?? []).length, 4);
  assert.equal((html.match(/aria-expanded="false"/g) ?? []).length, 4);
  assert.match(html, /aria-controls="guest-song-0-video"/);
  assert.match(html, /id="guest-song-0-video"/);
  assert.ok(html.indexOf('Zulu Song') < html.indexOf('Alpha Song'));
  assert.match(html, /Alex B., Alex C./);
  assert.match(html, /Performers to be announced/);
  assert.match(html, /No video reference yet/);
  assert.doesNotMatch(html, /<iframe|youtube-nocookie|Needed!|Nice to have|Interested only|Vocals|Guitar|<table/);
});

test('guest set list handles empty lists and missing artist credits', () => {
  const empty = renderToStaticMarkup(createElement(GuestSetList, { songs: [] }));
  assert.match(empty, /The set list is coming soon/);
  const html = renderToStaticMarkup(createElement(GuestSetList, {
    songs: [{ title: 'Song', originalArtist: null, performers: [], videoId: null }],
  }));
  assert.match(html, /Artist not listed/);
});

test('concert bill uses hero typography and large decorative expand controls', () => {
  const html = renderToStaticMarkup(createElement(GuestSetList, {
    songs: buildGuestSetList(setList, references),
  }));
  assert.match(html, /var\(--font-hero-marker\)/);
  assert.match(html, /var\(--font-hero-serif\)/);
  assert.match(html, /width:44px;height:44px/);
  assert.match(html, /width:28px;height:28px/);
  assert.equal((html.match(/<svg[^>]+viewBox="0 0 24 24"[^>]+focusable="false"/g) ?? []).length, 4);
  assert.match(html, /aria-hidden="true"/);
  assert.match(html, />01<\/span>/);
  assert.match(html, />04<\/span>/);
  assert.match(html, /Mui-focusVisible/);
  assert.match(html, /prefers-reduced-motion:\s*reduce/);
  assert.doesNotMatch(html, /⌄/);
});
