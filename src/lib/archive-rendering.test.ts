import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import robots from '../app/robots';
import PastEventCards from "../components/past-event-cards";
import EventPlanningCards from '../components/event-planning-cards';
import SiteNavigation from "../components/site-navigation";
import EventPlanningNavigation from '../components/event-planning-navigation';
import PerformersTable from '../components/performers-table';
import SongCardsSkeleton from "../components/song-cards-skeleton";
import SiteFrame from "../components/site-frame";
import ThemeProvider from '../app/theme-provider';
import RoleNeedChip from '../components/role-need-chip';
import SetListTable from '../components/set-list-table';
import PracticeOptions from '../components/practice-options';
import { getSongRoleNeeds, projectOctoberSetList } from './october-set-list';
import { buildPracticeSchedule } from './practice-groups';
import {
  PAST_EVENTS,
  PAST_EVENT_VIDEOS,
  getPastEventVideos,
} from './past-events';
import { SIGNUP_URL } from "./site-links";

test('set list combines guitar parts into one column without losing assignments or needs', () => {
  const performers = [
    { initials: 'AB', name: 'Alex', roles: ['Guitar'], genres: '' },
    { initials: 'CD', name: 'Casey', roles: ['Guitar'], genres: '' },
  ];
  const setList = {
    ...projectOctoberSetList(
      ['Song', 'Artist', 'Lead Guitar', 'Bass', 'Rhythm Guitar'],
      [
        ['Both assigned', 'Artist', 'AB', '', 'CD'],
        ['Both needed', 'Artist', 'Needed!', '', 'Nice to have'],
        ['Mixed', 'Artist', 'AB', '', 'Needed!'],
      ],
      performers,
    ),
    fetchedAt: '2026-10-09T00:00:00Z',
  };
  const original = JSON.stringify(setList);
  const html = renderToStaticMarkup(createElement(SetListTable, { setList, performers }));
  const table = html.slice(html.indexOf('<table'));
  assert.match(html, /\.MuiTableCell-root\{vertical-align:middle;\}/);
  assert.ok(!html.includes('vertical-align:top'));
  const header = html.match(/<thead[\s\S]*?<\/thead>/)?.[0] ?? '';
  assert.equal((header.match(/scope="col"/g) ?? []).length, 4);
  assert.ok(header.includes('Guitar'));
  assert.ok(!header.includes('Lead Guitar'));
  assert.ok(!header.includes('Rhythm Guitar'));
  const rows = html.match(/<tbody[\s\S]*?<\/tbody>/)?.[0].match(/<tr[\s\S]*?<\/tr>/g) ?? [];
  assert.equal(rows.length, 3);
  for (const row of rows) {
    const cells = row.match(/<td[\s\S]*?<\/td>/g) ?? [];
    assert.equal(cells.length, 3);
    const guitar = cells[1];
    assert.ok(guitar.includes('Lead:'));
    assert.ok(guitar.includes('Rhythm:'));
    assert.ok(!guitar.includes('>Lead Guitar<'));
    assert.ok(!guitar.includes('>Rhythm Guitar<'));
  }
  assert.ok(rows[0].includes('Lead: Alex'));
  assert.ok(rows[0].includes('Rhythm: Casey'));
  assert.ok(rows[1].includes('>Lead: Needed!</span>'));
  assert.ok(rows[1].includes('>Rhythm: Nice to have</span>'));
  assert.ok(rows[1].includes('aria-label="Lead Guitar: Needed!"'));
  assert.ok(rows[2].includes('Lead: Alex'));
  assert.ok(rows[2].includes('>Rhythm: Needed!</span>'));
  assert.ok(!table.includes('MuiChip-root'));
  assert.ok(rows[1].includes('MuiLink-root'));
  assert.ok(html.includes('font-weight:700'));
  assert.equal(JSON.stringify(setList), original);
});

test('set list combines keyboard and additional instruments in the final column', () => {
  const performers = [
    { initials: 'AB', name: 'Alex', roles: ['Keyboard'], genres: '' },
    { initials: 'CD', name: 'Casey', roles: ['Other Role'], genres: '' },
  ];
  const setList = {
    ...projectOctoberSetList(
      ['Song', 'Artist', 'Additional Instruments', 'Keyboard', 'Bass'],
      [
        ['Assigned', 'Artist', 'CD', 'AB', ''],
        ['Needed', 'Artist', 'Needed!', 'Nice to have', ''],
        ['Qualified', 'Artist', 'Nice to have (Strings)', 'Needed!', ''],
        ['Unassigned', 'Artist', '', '', 'AB'],
      ],
      performers,
    ),
    fetchedAt: '2026-10-09T00:00:00Z',
  };
  const original = JSON.stringify(setList);
  const html = renderToStaticMarkup(createElement(SetListTable, { setList, performers }));
  const table = html.slice(html.indexOf('<table'));
  const headers = html.match(/<thead[\s\S]*?<\/thead>/)?.[0].match(/<th\b[\s\S]*?<\/th>/g) ?? [];
  assert.equal(headers.length, 4);
  assert.ok(headers[2].includes('Bass'));
  assert.ok(headers[3].includes('Additional Instruments'));
  assert.ok(!headers.some((header) => header.includes('Keyboard')));
  const rows = html.match(/<tbody[\s\S]*?<\/tbody>/)?.[0].match(/<tr[\s\S]*?<\/tr>/g) ?? [];
  const combined = rows.map((row) => {
    const cells = row.match(/<td\b[\s\S]*?<\/td>/g) ?? [];
    assert.equal(cells.length, 3);
    return cells[2];
  });
  assert.ok(combined[0].includes('Keyboard: Alex'));
  assert.ok(combined[0].includes('Additional Instruments: Casey'));
  assert.ok(combined[0].indexOf('Keyboard: Alex') < combined[0].indexOf('Additional Instruments: Casey'));
  assert.ok(combined[1].includes('Keyboard: Nice to have'));
  assert.ok(combined[1].includes('Additional Instruments: Needed!'));
  assert.ok(combined[2].includes('Keyboard: Needed!'));
  assert.ok(combined[2].includes('Strings: Nice to have'));
  assert.ok(!combined[3].includes('Keyboard:'));
  assert.ok(!combined[3].includes('Additional Instruments:'));
  assert.ok(!table.includes('MuiChip-root'));
  assert.equal(JSON.stringify(setList), original);
});

test('set list highlights only roles marked Needed! above the table', () => {
  const performers = [
    { initials: 'AB', name: 'Alex', roles: ['Guitar'], genres: '' },
  ];
  const setList = {
    ...projectOctoberSetList(
      ['Song', 'Artist', 'Lead Guitar', 'Bass', 'Vocal'],
      [
        ['Opening song', 'Artist', 'Needed!', 'Nice to have', ''],
        ['Second song', '', '', 'Needed!', ''],
      ],
      performers,
    ),
    fetchedAt: '2026-10-09T00:00:00Z',
  };
  const html = renderToStaticMarkup(createElement(SetListTable, { setList, performers }));
  const highlight = html.match(
    /<section\b[^>]*aria-labelledby="critical-openings-heading"[^>]*>[\s\S]*?<\/section>/,
  )?.[0] ?? '';

  assert.ok(highlight);
  assert.ok(html.indexOf(highlight) < html.indexOf('<table'));
  assert.ok(highlight.includes('2 roles marked Needed!'));
  assert.ok(highlight.includes('Opening song'));
  assert.ok(highlight.includes('Lead Guitar: Needed!'));
  assert.ok(highlight.includes('Second song'));
  assert.ok(highlight.includes('Bass: Needed!'));
  assert.ok(!highlight.includes('Nice to have'));
});

test('set list reports when there are no critical openings', () => {
  const setList = {
    ...projectOctoberSetList(
      ['Song', 'Artist', 'Lead Guitar', 'Bass'],
      [['Song without critical openings', 'Artist', 'Nice to have', '']],
      [],
    ),
    fetchedAt: '2026-10-09T00:00:00Z',
  };
  const html = renderToStaticMarkup(createElement(SetListTable, { setList, performers: [] }));
  const highlight = html.match(
    /<section\b[^>]*aria-labelledby="critical-openings-heading"[^>]*>[\s\S]*?<\/section>/,
  )?.[0] ?? '';

  assert.ok(highlight);
  assert.ok(highlight.includes('0 roles marked Needed!'));
  assert.ok(highlight.includes('No critical openings are marked Needed!'));
});

test('combined additional instruments column supports either source role alone', () => {
  for (const role of ['Keyboard', 'Additional Instruments']) {
    const setList = {
      ...projectOctoberSetList(
        ['Song', 'Artist', role, 'Bass'],
        [['Song', 'Artist', 'Needed!', '']],
        [],
      ),
      fetchedAt: '2026-10-09T00:00:00Z',
    };
    const html = renderToStaticMarkup(createElement(SetListTable, { setList, performers: [] }));
    const headers = html.match(/<thead[\s\S]*?<\/thead>/)?.[0].match(/<th\b[\s\S]*?<\/th>/g) ?? [];
    assert.equal(headers.length, 4);
    assert.ok(headers[3].includes('Additional Instruments'));
    assert.ok(html.includes(`${role}: Needed!`));
  }
});

test('instrument-qualified needs use the same label in Set List links and Songs chips', () => {
  const setList = {
    ...projectOctoberSetList(
      ['Song', 'Artist', 'Additional Instruments'],
      [['A song', 'An artist', 'Nice to have (Strings)']],
      [],
    ),
    fetchedAt: '2026-10-09T00:00:00Z',
  };
  const table = renderToStaticMarkup(
    createElement(SetListTable, { setList, performers: [] }),
  );
  const tableGrid = table.slice(table.indexOf('<table'));
  const [need] = getSongRoleNeeds(setList.songs[0], setList.songs);
  const songChip = renderToStaticMarkup(
    createElement(RoleNeedChip, { ...need, status: 'nice-to-have', includeRole: true, candidates: [] }),
  );

  for (const html of [table, songChip]) {
    assert.ok(html.includes('Strings: Nice to have'));
    assert.ok(!html.includes('Additional Instruments: Nice to have'));
  }
  assert.ok(!tableGrid.includes('MuiChip-root'));
  assert.ok(songChip.includes('MuiChip-root'));
});

test('role-need link and chip variants preserve colors, labels, and keyboard focus', () => {
  for (const variant of ['link', 'chip'] as const) {
    for (const status of ['nice-to-have', 'needed'] as const) {
      const html = renderToStaticMarkup(
        ThemeProvider({
          children: createElement(RoleNeedChip, { variant, role: 'Vocal', status, candidates: [] }),
        }),
      );
      const label = status === 'needed' ? 'Needed!' : 'Nice to have';
      const color = status === 'needed' ? 'secondary' : 'primary';
      assert.ok(html.includes(`aria-label="Vocal: ${label}"`));
      assert.ok(html.includes('tabindex="0"'));
      assert.ok(html.includes(':focus-visible'));
      if (variant === 'link') {
        assert.ok(html.includes('MuiLink-root'));
        assert.ok(!html.includes('MuiChip-root'));
        assert.ok(html.includes(`color:var(--mui-palette-${color}-main)`));
        assert.ok(html.includes('font-weight:700'));
        assert.ok(html.includes('text-decoration:none'));
        assert.ok(!html.includes('<a'));
      } else {
        assert.ok(html.includes('MuiChip-root'));
        assert.ok(html.includes(`MuiChip-color${color[0].toUpperCase()}${color.slice(1)}`));
      }
    }
  }
});

test('unqualified and other-role need chips retain their labels', () => {
  for (const includeRole of [false, true]) {
    for (const status of ['nice-to-have', 'needed'] as const) {
      const html = renderToStaticMarkup(
        createElement(RoleNeedChip, { role: 'Additional Instruments', status, includeRole, candidates: [] }),
      );
      const label = status === 'needed' ? 'Needed!' : 'Nice to have';
      assert.ok(html.includes(includeRole ? `Additional Instruments: ${label}` : label));
    }
  }
  const html = renderToStaticMarkup(
    createElement(RoleNeedChip, {
      role: 'Vocal', status: 'nice-to-have', detail: 'Strings', includeRole: true, candidates: [],
    }),
  );
  assert.ok(html.includes('Vocal: Nice to have'));
  assert.ok(!html.includes('Strings: Nice to have'));
});

test('shared site containers use the xl breakpoint with a 1600px maximum', () => {
  const html = renderToStaticMarkup(
    ThemeProvider({
      children: SiteFrame({ children: 'Content' }),
    }),
  );

  assert.match(html, /MuiContainer-maxWidthXl/);
  assert.match(html, /@media \(min-width:1600px\)\{[^}]*max-width:1600px/);
  assert.match(html, /width:100%/);
  assert.doesNotMatch(html, /max-width:1200px/);
});

test("event cards render every archive with decorative Material SVG arrows", () => {
  const html = renderToStaticMarkup(createElement(PastEventCards));

  for (const { slug, label, theme } of PAST_EVENTS) {
    assert.ok(html.includes(`href="/past-events/${slug}/videos"`));
    assert.ok(html.includes(`aria-label="ABK Open Mic ${label}"`));
    assert.ok(html.includes(label));
    assert.ok(html.includes(theme));
  }
  for (const image of [
    'abk-open-mic-may-2026.png',
    'abk-open-mic-december-2025.png',
    'abk-open-mic-july-2025.png',
  ]) {
    assert.ok(html.includes(image));
  }
  assert.equal((html.match(/alt=""/g) ?? []).length, 3);
  assert.equal((html.match(/<svg /g) ?? []).length, 3);
  assert.equal((html.match(/aria-hidden="true"/g) ?? []).length, 3);
  assert.ok(!html.includes("↗"));
});

test('homepage event planning cards link to each October planning tab', () => {
  const html = renderToStaticMarkup(createElement(EventPlanningCards));

  assert.ok(html.includes('href="/event-planning/songs"'));
  assert.ok(html.includes('href="/event-planning/practice"'));
  assert.ok(html.includes('aria-label="October 2026 Practice"'));
  assert.ok(html.includes('href="/event-planning/performers"'));
  assert.ok(html.includes('aria-label="October 2026 Songs"'));
  assert.ok(html.includes('aria-label="October 2026 Performers"'));
});

test('past event videos match their actual YouTube playlist contents', () => {
  assert.deepEqual(PAST_EVENT_VIDEOS, [
    {
      eventSlug: 'july-2025',
      videos: [{ videoId: 'nWf3AunfcRU', title: 'Open Mic Jul 2025' }],
    },
    {
      eventSlug: 'december-2025',
      videos: [
        { videoId: 'NEzyw08Ax78', title: 'Astrud Gilberto - Fly to the Moon' },
        { videoId: 'UQZbVKRi-M0', title: 'Rush - Witch Hunt' },
        {
          videoId: 'WhQHlQLAU8k',
          title: 'Vince Guaraldi - Christmas Time is Here',
        },
        { videoId: 's6aCWR8zHTk', title: 'What a Mario World - RRThiel' },
      ],
    },
  ]);
  assert.deepEqual(getPastEventVideos('may-2026'), []);
});

test('song skeletons match the card grid and can reserve space for reference videos', () => {
  for (const showReferences of [false, true]) {
    const html = renderToStaticMarkup(
      createElement(SongCardsSkeleton, { showReferences }),
    );

    assert.ok(html.includes('role="status"'));
    assert.ok(html.includes('aria-label="Loading songs"'));
    assert.equal(
      (html.match(/<div class="MuiCardContent-root /g) ?? []).length,
      4,
    );
    assert.ok(html.includes('repeat(2, 1fr)'));
    assert.equal(/aspect-ratio:16\s*\/\s*9/.test(html), showReferences);
  }
});

test("site frame renders content independently of optional freshness metadata", () => {
  const content = createElement("h1", null, "Archive title");
  const html = renderToStaticMarkup(SiteFrame({
    children: content,
    freshness: createElement("span", null, "Last updated: unavailable"),
  }));
  assert.ok(html.includes("Archive title"));
  assert.ok(html.indexOf("Last updated: unavailable") > html.indexOf("<footer"));

  const home = renderToStaticMarkup(SiteFrame({ children: content }));
  assert.ok(!home.includes("Last updated"));
});

test('site navigation links to event planning and past events without Slack', () => {
  const html = renderToStaticMarkup(createElement(SiteNavigation));

  assert.ok(html.includes('href="/event-planning"'));
  assert.ok(html.includes('aria-label="Event planning"'));
  assert.ok(html.includes('Event </span>Planning</a>'));
  assert.ok(html.includes('href="/past-events"'));
  assert.ok(!html.includes('>Slack</a>'));
  assert.ok(html.includes(`href="${SIGNUP_URL.replaceAll('&', '&amp;')}"`));
  assert.ok(html.includes('>Sign up</a>'));
});

test('event planning navigation uses tabs for songs and performers', () => {
  const html = renderToStaticMarkup(createElement(EventPlanningNavigation));

  assert.ok(html.includes('href="/event-planning/songs"'));
  assert.ok(html.includes('href="/event-planning/performers"'));
  assert.ok(html.includes('role="tab"'));
  assert.ok(html.includes('aria-label="Event planning sections"'));
  const tabs = [...html.matchAll(/href="\/event-planning\/([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(tabs, ['set-list', 'practice', 'songs', 'performers']);
});

test('practice options show both groups, shared attendees, song links and search caveats', () => {
  const { songs } = projectOctoberSetList(
    ['Song', 'Artist', 'Vocal'],
    [['First song', 'Artist', 'AB'], ['Second song', 'Artist', 'AB']],
    [{ initials: 'AB', name: 'Alex', roles: ['Vocal'], genres: '' }],
  );
  for (const optimal of [true, false]) {
    const html = renderToStaticMarkup(createElement(PracticeOptions, {
      result: {
        optimal,
        suggestedSwaps: [],
        swapSearchComplete: true,
        options: [{
          groups: [[songs[0]], [songs[1]]],
          sharedPerformers: [{ initials: 'AB', name: 'Alex' }],
          sessions: [
            { blocks: [[songs[0]], []], sharedPerformers: [], optimal: true },
            { blocks: [[songs[1]], []], sharedPerformers: [], optimal: true },
          ],
        }],
      },
    }));
    assert.match(html, /<h2\b[^>]*class="[^"]*MuiTypography-h5[^"]*"[^>]*>Option 1<\/h2>/);
    assert.ok(html.includes('· 1 shared performer'));
    for (const session of [0, 1]) {
      assert.match(html, new RegExp(`<section[^>]*aria-labelledby="practice-0-${session}-heading"`));
      assert.match(html, new RegExp(`<h3[^>]*class="[^"]*MuiTypography-h6[^"]*"[^>]*id="practice-0-${session}-heading"[^>]*>Session ${session + 1}</h3>`));
      for (const block of [0, 1]) {
        assert.match(html, new RegExp(`<section[^>]*aria-labelledby="practice-0-${session}-${block}-heading"`));
        assert.match(html, new RegExp(`<h4[^>]*class="[^"]*MuiTypography-subtitle1[^"]*"[^>]*id="practice-0-${session}-${block}-heading"[^>]*>${block === 0 ? 'Early' : 'Late'} block</h4>`));
      }
    }
    assert.ok(html.includes('Needed at both sessions: Alex'));
    assert.ok(html.includes('How these suggestions work'));
    assert.ok(!html.includes('Donald and Randal'));
    assert.ok(html.includes('Session 1'));
    assert.ok(html.includes('Session 2'));
    assert.ok(html.includes('First song'));
    assert.ok(html.includes('Second song'));
    assert.ok(html.includes('href="/event-planning/songs#song-'));
    assert.equal(html.includes('a lower-overlap split may exist'), !optimal);
  }
});

test('practice options handle all-done and one-song states', () => {
  const empty = renderToStaticMarkup(createElement(PracticeOptions, {
    result: { options: [], optimal: true, suggestedSwaps: [], swapSearchComplete: true },
  }));
  assert.ok(empty.includes('No songs remain to practice'));
  const { songs } = projectOctoberSetList(['Song', 'Artist', 'Vocal'], [['Only song', '', '']], []);
  const single = renderToStaticMarkup(createElement(PracticeOptions, {
    result: {
      options: [{
        groups: [songs, []], sharedPerformers: [],
        sessions: [
          { blocks: [songs, []], sharedPerformers: [], optimal: true },
          { blocks: [[], []], sharedPerformers: [], optimal: true },
        ],
      }],
      optimal: true,
      suggestedSwaps: [],
      swapSearchComplete: true,
    },
  }));
  assert.ok(single.includes('Needed at both sessions: None'));
  assert.ok(single.includes('No songs in this session'));
  assert.ok(single.includes('No assigned performers'));
  assert.ok(single.includes('No songs in this late block'));
  assert.ok(single.includes('No songs in this early block'));
});

test('practice presentation supports another event without October names or links', () => {
  const performers = [
    { initials: 'HOST', name: 'Casey', roles: ['Vocal'], genres: '' },
    { initials: 'GUEST', name: 'Donald', roles: ['Vocal'], genres: '' },
  ];
  const { songs } = projectOctoberSetList(
    ['Song', 'Artist', 'Vocal'],
    [['First', 'Artist', 'HOST,GUEST'], ['Second', 'Artist', 'HOST,GUEST']],
    performers,
  );
  const html = renderToStaticMarkup(createElement(PracticeOptions, {
    result: buildPracticeSchedule(songs, undefined, new Set(['HOST'])),
    alwaysPresentPerformers: [performers[0]],
    songsHref: '/future-event/songs',
  }));
  assert.ok(html.includes('Casey is assumed present'));
  assert.ok(html.includes('Needed at both sessions: Donald'));
  assert.ok(html.includes('href="/future-event/songs#song-'));
  assert.ok(!html.includes('/event-planning/songs'));
  assert.ok(!html.includes('Randal'));
});

test('practice options show individual song-assignment swap suggestions', () => {
  const { songs } = projectOctoberSetList(
    ['Song', 'Artist', 'Vocal', 'Bass'],
    [
      ['Bass song one', 'Artist', 'E,F', 'B'],
      ['Bass song two', 'Artist', 'F', 'B'],
      ['Bass song three', 'Artist', 'F', 'C'],
      ['Bass song four', 'Artist', 'E,F,G', 'C'],
    ],
    [
      { initials: 'B', name: 'Blair', roles: ['Bass'], genres: '' },
      { initials: 'C', name: 'Casey', roles: ['Bass'], genres: '' },
      { initials: 'E', name: 'Eli', roles: ['Vocal'], genres: '' },
      { initials: 'F', name: 'Finn', roles: ['Vocal'], genres: '' },
      { initials: 'G', name: 'Gale', roles: ['Vocal'], genres: '' },
    ],
  );
  const result = buildPracticeSchedule(songs);
  assert.ok(result.suggestedSwaps.length > 0);
  const html = renderToStaticMarkup(createElement(PracticeOptions, {
    result,
  }));

  assert.ok(html.includes('Assignment swap suggestions'));
  assert.ok(html.includes('Each suggestion exchanges one Bass or Drums song assignment'));
  assert.ok(html.includes(`${result.suggestedSwaps[0].exchanges[0].performer.name} swaps “`));
  assert.ok(html.includes(`reduces shared attendance by ${result.suggestedSwaps[0].overlapReduction}`));
  assert.ok(html.includes('The suggested sessions are re-optimized'));
  const suggestions = html.slice(html.indexOf('Assignment swap suggestions'), html.indexOf('>Option 1</h2>'));
  assert.match(suggestions, /<h2[^>]*class="[^"]*MuiTypography-h5[^"]*"[^>]*>Suggestion 1:/);
  assert.match(suggestions, /<h3[^>]*class="[^"]*MuiTypography-h6[^"]*"[^>]*>Session 1/);
  for (const label of ['Early', 'Late']) {
    assert.match(suggestions, new RegExp(`<h4[^>]*class="[^"]*MuiTypography-subtitle1[^"]*"[^>]*>${label} block</h4>`));
  }
  assert.equal(html.includes('additional improving assignment exchanges may exist'), !result.swapSearchComplete);
});

test('practice blocks distinguish early-only, late-only and whole-practice attendees by initials', () => {
  const { songs } = projectOctoberSetList(
    ['Song', 'Artist', 'Vocal', 'Bass'],
    [
      ['Early song', 'Artist', 'AB,DON', 'EF'],
      ['Late song', 'Artist', 'CD,RAN', 'EF'],
    ],
    [
      { initials: 'AB', name: 'Alex', roles: ['Vocal'], genres: '' },
      { initials: 'CD', name: 'Casey', roles: ['Vocal'], genres: '' },
      { initials: 'EF', name: 'Sam', roles: ['Bass'], genres: '' },
      { initials: 'DON', name: 'Donald Smith', roles: ['Vocal'], genres: '' },
      { initials: 'RAN', name: 'Randal Jones', roles: ['Vocal'], genres: '' },
    ],
  );
  for (const optimal of [true, false]) {
    const html = renderToStaticMarkup(createElement(PracticeOptions, {
      alwaysPresentPerformers: [
        { initials: 'DON', name: 'Donald Smith' },
        { initials: 'RAN', name: 'Randal Jones' },
      ],
      result: {
        optimal: true,
        suggestedSwaps: [],
        swapSearchComplete: true,
        options: [{
          groups: [songs, []],
          sharedPerformers: [],
          sessions: [
            {
              blocks: [[songs[0]], [songs[1]]],
              sharedPerformers: [{ initials: 'EF', name: 'Sam' }],
              optimal,
            },
            { blocks: [[], []], sharedPerformers: [], optimal: true },
          ],
        }],
      },
    }));
    assert.ok(html.includes('Needed for both blocks (1): Sam'));
    assert.ok(html.includes('Early only (can leave after this block): Alex'));
    assert.ok(html.includes('Late only (can arrive later): Casey'));
    assert.ok(!html.includes('Early only (can leave after this block): Donald'));
    assert.ok(!html.includes('Late only (can arrive later): Randal'));
    assert.ok(html.includes('>Early block</h4>'));
    assert.ok(html.includes('>Late block</h4>'));
    assert.equal((html.match(/href="\/event-planning\/songs#song-/g) ?? []).length, 2);
    assert.ok(html.indexOf('>Early block</h4>') < html.indexOf('Early song'));
    assert.ok(html.indexOf('Early song') < html.indexOf('>Late block</h4>'));
    assert.ok(html.indexOf('>Late block</h4>') < html.indexOf('Late song'));
    assert.equal(html.includes('fewer performers may need both halves'), !optimal);
    assert.ok(!html.includes('a lower-overlap split may exist'));
  }
});

test('performer interests render in one card with expandable song rows', () => {
  const html = renderToStaticMarkup(
    createElement(PerformersTable, {
      performers: [
        {
          name: 'Alex Brown',
          roles: ['Lead Guitar', 'Keyboard'],
          genres: 'Alt-Rock, K-pop',
          practiceAvailability: ['Monday', 'Friday'],
          songs: [
            {
              title: 'Proposed song',
              originalArtist: 'Original artist',
              roles: ['Lead Guitar'],
            },
          ],
        },
        {
          name: 'Jamie Young',
          roles: ['Vocal'],
          genres: 'Jazz',
          songs: [],
        },
      ],
    }),
  );

  assert.ok(
    html.includes(
      'aria-label="Performer names, role interests, genres, weeknight availability, proposed songs, and set-list assignments in expandable rows"',
    ),
  );
  assert.ok(html.includes('Alex Brown'));
  assert.ok(html.includes('Jamie Young'));
  assert.ok(html.includes('Lead Guitar'));
  assert.ok(html.includes('Keyboard'));
  assert.ok(html.includes('Genres'));
  assert.ok(html.includes('Weeknight availability'));
  assert.ok(html.includes('Mon, Fri'));
  assert.ok(html.includes('Not specified'));
  assert.ok(html.indexOf('Role interests') < html.indexOf('Genres'));
  assert.ok(html.includes('Alt-Rock, K-pop'));
  assert.equal((html.match(/<section\b/g) ?? []).length, 1);
  assert.ok(html.includes('aria-controls="performer-songs-0"'));
  assert.ok(html.includes('id="performer-songs-0"'));
  assert.ok(html.includes('aria-expanded="false"'));
  assert.ok(html.includes('aria-label="Show songs for Alex Brown"'));
  assert.ok(html.includes('Show songs'));
  assert.ok(!html.includes('Proposed song'));
  assert.equal((html.match(/<tr/g) ?? []).length, 5);
});

test('robots excludes all paths from compliant crawlers', () => {
  assert.deepEqual(robots(), {
    rules: { userAgent: '*', disallow: '/' },
  });
});
