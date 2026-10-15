import assert from 'node:assert/strict';
import test from 'node:test';
import { getSongAnchor, type SetListSong } from './october-set-list';
import { PRACTICE_WEEKDAYS, type PracticeWeekday } from './october-signup';
import { buildPracticeGroups, buildPracticeSchedule } from './practice-groups';

function song(title: string, initials: string[] = []): SetListSong {
  return {
    title,
    originalArtist: 'Artist',
    roles: [{
      role: 'Vocal',
      performers: initials.map((initials) => ({ initials, name: `Name ${initials}` })),
      status: null,
      detail: null,
    }],
  };
}

function identities(songs: SetListSong[], alwaysPresent: ReadonlySet<string> = new Set()): Set<string> {
  return new Set(songs.flatMap(({ roles }) =>
    roles.flatMap(({ performers }) => performers
      .filter(({ initials }) => !alwaysPresent.has(initials))
      .map(({ initials }) => initials)),
  ));
}

function shared(groups: [SetListSong[], SetListSong[]], alwaysPresent: ReadonlySet<string> = new Set()): string[] {
  const second = identities(groups[1], alwaysPresent);
  return [...identities(groups[0], alwaysPresent)].filter((initials) => second.has(initials)).sort();
}

function pairKey(groups: [SetListSong[], SetListSong[]]): string {
  return groups.map((group) => JSON.stringify(group.map(({ title, originalArtist }) =>
    getSongAnchor(title, originalArtist),
  ).sort())).sort().join('|');
}

function oracle(songs: SetListSong[]) {
  let best = Infinity;
  const keys = new Set<string>();
  for (let mask = 0; mask < 2 ** songs.length; mask++) {
    const first = songs.filter((_, index) => mask & (1 << index));
    if (first.length !== Math.floor(songs.length / 2)) continue;
    const second = songs.filter((_, index) => !(mask & (1 << index)));
    const score = shared([first, second]).length;
    if (score < best) {
      best = score;
      keys.clear();
    }
    if (score === best) keys.add(pairKey([first, second]));
  }
  return { best, keys };
}

function check(songs: SetListSong[], alwaysPresent: ReadonlySet<string> = new Set()) {
  const result = buildPracticeGroups(songs, alwaysPresent);
  assert.ok(result.options.length > 0 && result.options.length <= 5);
  const uniqueSongs = new Set(songs.map(({ title, originalArtist }) =>
    getSongAnchor(title, originalArtist),
  ));
  const keys = new Set<string>();
  for (const { groups, sharedPerformers } of result.options) {
    const lengths = groups.map((group) => group.length).sort((a, b) => a - b);
    assert.deepEqual(lengths, [
      Math.floor(uniqueSongs.size / 2), Math.ceil(uniqueSongs.size / 2),
    ]);
    const anchors = groups.flat().map(({ title, originalArtist }) =>
      getSongAnchor(title, originalArtist),
    );
    assert.equal(new Set(anchors).size, anchors.length);
    assert.deepEqual(new Set(anchors), uniqueSongs);
    assert.deepEqual(sharedPerformers.map(({ initials }) => initials), shared(groups, alwaysPresent));
    keys.add(pairKey(groups));
  }
  assert.equal(keys.size, result.options.length);
  assert.equal(new Set(result.options.map(({ sharedPerformers }) =>
    sharedPerformers.length,
  )).size, 1);
  return result;
}

test('empty and single-song inputs have explicit results', () => {
  assert.deepEqual(buildPracticeGroups([]), { options: [], optimal: true });
  const only = song('Only', ['AB']);
  assert.deepEqual(buildPracticeGroups([only]), {
    options: [{ groups: [[only], []], sharedPerformers: [] }],
    optimal: true,
  });
});

test('returns all small ties, caps at five, and never repeats mirrored pairs', () => {
  for (const size of [2, 3, 4, 5, 6, 7]) {
    const songs = Array.from({ length: size }, (_, index) => song(`Song ${index}`));
    const result = check(songs);
    assert.equal(result.optimal, true);
    assert.equal(result.options.length, Math.min(5, oracle(songs).keys.size));
    assert.ok(result.options.every(({ sharedPerformers }) => !sharedPerformers.length));
  }
});

test('exact results agree with exhaustive oracle on varied tiny tables', () => {
  let state = 12345;
  function random() {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state;
  }
  for (let sample = 0; sample < 100; sample++) {
    const size = 2 + random() % 8;
    const songs = Array.from({ length: size }, (_, index) =>
      song(`Song ${index}`, ['A', 'B', 'C', 'D', 'E'].filter(() => random() % 3 === 0)),
    );
    const expected = oracle(songs);
    const actual = check(songs);
    assert.equal(actual.optimal, true);
    assert.equal(actual.options[0].sharedPerformers.length, expected.best);
    assert.equal(actual.options.length, Math.min(5, expected.keys.size));
    for (const { groups } of actual.options) assert.ok(expected.keys.has(pairKey(groups)));
    assert.deepEqual(buildPracticeGroups(songs), actual);
  }
});

test('minimizes shared initials, not attendance or duplicate role assignments', () => {
  const songs = [
    song('One', ['A', 'B', 'C']),
    song('Two', ['A', 'B', 'C']),
    song('Three', ['D', 'E']),
    song('Four', ['D', 'E']),
  ];
  songs[0].roles.push({
    ...songs[0].roles[0], role: 'Guitar',
    performers: [...songs[0].roles[0].performers, { initials: 'A', name: 'Other name' }],
  });
  const result = check(songs);
  assert.equal(result.options.length, 1);
  assert.deepEqual(result.options[0].sharedPerformers, []);
  assert.deepEqual(result.options[0].groups.map((group) => group.map(({ title }) => title)), [
    ['One', 'Two'], ['Three', 'Four'],
  ]);
});

test('uses initials as identities even with identical or conflicting display names', () => {
  const first = song('One', ['AB', 'CD', 'AB']);
  first.roles[0].performers.forEach((performer) => { performer.name = 'Alex'; });
  first.roles.push({ ...first.roles[0], role: 'Bass' });
  const second = song('Two', ['CD', 'AB']);
  second.roles[0].performers[1].name = 'Different';
  const result = check([first, second]);
  assert.deepEqual(result.options[0].sharedPerformers, [
    { initials: 'AB', name: 'Alex' }, { initials: 'CD', name: 'Alex' },
  ]);
});

test('uses event-configured always-present identities in sessions and early/late blocks', () => {
  const songs = [
    song('One', ['DON', 'RAN', 'A']),
    song('Two', ['DON', 'RAN', 'A']),
    song('Three', ['DON', 'RAN', 'B']),
    song('Four', ['DON', 'RAN', 'B']),
  ];
  for (const entry of songs) {
    entry.roles[0].performers.forEach((performer) => {
      performer.name = performer.initials === 'DON'
        ? 'Donald Smith'
        : performer.initials === 'RAN'
          ? 'Randal Jones'
          : `Name ${performer.initials}`;
    });
  }

  const alwaysPresent = new Set(['DON', 'RAN']);
  const result = check(songs, alwaysPresent);
  assert.equal(result.options.length, 1);
  assert.deepEqual(result.options[0].sharedPerformers, []);
  assert.deepEqual(result.options[0].groups.map((group) => group.map(({ title }) => title)), [
    ['One', 'Two'], ['Three', 'Four'],
  ]);
  const schedule = buildPracticeSchedule(songs, undefined, alwaysPresent);
  assert.deepEqual(schedule.options[0].sessions.map(({ sharedPerformers }) =>
    sharedPerformers.map(({ initials }) => initials),
  ), [['A'], ['B']]);
  assert.deepEqual(buildPracticeGroups(songs).options[0].sharedPerformers.map(({ initials }) => initials),
    ['DON', 'RAN']);
});

test('always-present policy is identity-based, event-isolated and applied to availability', () => {
  const songs = [song('One', ['HOST', 'GUEST']), song('Two', ['HOST', 'GUEST'])];
  for (const entry of songs) {
    for (const performer of entry.roles[0].performers) performer.name = 'Donald';
  }
  const availability = new Map<string, PracticeWeekday[]>([
    ['HOST', ['Friday']], ['GUEST', ['Monday']],
  ]);
  const original = JSON.stringify(songs);
  const schedule = buildPracticeSchedule(songs, availability, new Set(['HOST']));
  assert.deepEqual(schedule.options[0].sharedPerformers.map(({ initials }) => initials), ['GUEST']);
  assert.ok(schedule.options.every(({ sessions }) =>
    sessions.flatMap(({ unavailablePerformers }) => unavailablePerformers ?? [])
      .every(({ initials }) => initials !== 'HOST'),
  ));
  assert.equal(buildPracticeSchedule(songs).options[0].sharedPerformers.length, 2);
  assert.equal(JSON.stringify(songs), original);
});

test('uses known weekday availability to choose lower-conflict practice groups and nights', () => {
  const songs = [
    song('Monday one', ['MON']),
    song('Monday two', ['MON']),
    song('Tuesday one', ['TUE']),
    song('Tuesday two', ['TUE']),
  ];
  const availability = new Map<string, PracticeWeekday[] | null>([
    ['MON', ['Monday']],
    ['TUE', ['Tuesday']],
  ]);
  const schedule = buildPracticeSchedule(songs, availability);

  assert.equal(schedule.availabilitySearchComplete, true);
  assert.deepEqual(schedule.options[0].groups.map((group) =>
    group.map(({ title }) => title),
  ), [['Monday one', 'Monday two'], ['Tuesday one', 'Tuesday two']]);
  assert.deepEqual(schedule.options[0].sessions.map(({ weeknight }) => weeknight), [
    'Monday', 'Tuesday',
  ]);
  assert.ok(schedule.options.every(({ sessions }) =>
    sessions.every(({ unavailablePerformers }) => unavailablePerformers?.length === 0),
  ));
  assert.equal(schedule.options[0].sharedPerformers.length, 0);

  const flexible = [...PRACTICE_WEEKDAYS];
  const ties = buildPracticeSchedule(songs, new Map([
    ['MON', flexible],
    ['TUE', flexible],
  ]));
  assert.equal(new Set(ties.options.map(({ groups }) => pairKey(groups))).size, ties.options.length);

  const unknown = buildPracticeSchedule(songs, new Map([
    ['MON', null],
    ['TUE', null],
  ]));
  assert.equal(unknown.availabilitySearchComplete, undefined);
  assert.ok(unknown.options[0].sessions.every(({ weeknight }) => weeknight === undefined));
});

test('configured practice nights stay Monday and Thursday regardless of reported availability', () => {
  const songs = [
    song('One', ['MON']), song('Two', ['MON']),
    song('Three', ['THU']), song('Four', ['THU']),
  ];
  const availability = new Map<string, PracticeWeekday[]>([
    ['MON', ['Monday', 'Tuesday']], ['THU', ['Thursday', 'Tuesday']],
  ]);
  const settings = {
    sessionWeeknights: ['Monday', 'Thursday'] as const,
    suggestSwaps: false,
  };
  for (const entries of [songs, [...songs].reverse(), [songs[0]]]) {
    for (const reported of [availability, undefined, new Map<string, PracticeWeekday[]>()]) {
      const result = buildPracticeSchedule(entries, reported, new Set(), settings);
      assert.ok(result.options.length > 0);
      assert.deepEqual(result.suggestedSwaps, []);
      for (const { sessions } of result.options) {
        assert.deepEqual(sessions.map(({ weeknight }) => weeknight).sort(), ['Monday', 'Thursday']);
        if (reported === availability) {
          assert.ok(sessions.every(({ unavailablePerformers }) => unavailablePerformers?.length === 0));
        }
      }
    }
  }
  const conflicts = buildPracticeSchedule(songs, new Map([
    ['MON', ['Tuesday'] as PracticeWeekday[]], ['THU', ['Tuesday'] as PracticeWeekday[]],
  ]), new Set(), settings);
  assert.ok(conflicts.options.every(({ sessions }) =>
    sessions.every(({ unavailablePerformers }) => unavailablePerformers!.length > 0),
  ));
  assert.deepEqual(buildPracticeSchedule([], availability, new Set(), settings).options, []);
  assert.throws(() => buildPracticeSchedule(songs, availability, new Set(), {
    sessionWeeknights: ['Monday', 'Monday'],
  }), /distinct weeknights/);
});

test('weeknight planning can put the first group on a later weekday without depending on row order', () => {
  const songs = [
    song('Friday one', ['FRI']), song('Friday two', ['FRI']),
    song('Monday one', ['MON']), song('Monday two', ['MON']),
  ];
  const availability = new Map<string, PracticeWeekday[]>([
    ['FRI', ['Friday']], ['MON', ['Monday']],
  ]);
  for (const entries of [songs, [...songs].reverse(), songs.slice(1)]) {
    const result = buildPracticeSchedule(entries, availability);
    assert.equal(result.optimal, true);
    assert.ok(result.options.every(({ sessions }) =>
      sessions.every(({ unavailablePerformers }) => unavailablePerformers?.length === 0),
    ));
    assert.equal(new Set(result.options.map(({ groups }) => pairKey(groups))).size, result.options.length);
  }
});

test('uses a deterministic bounded availability search above the exact song limit', () => {
  const songs = Array.from({ length: 23 }, (_, index) =>
    song(`Song ${index}`, [`P${index}`]),
  );
  const availability = new Map<string, PracticeWeekday[]>(
    songs.map((entry) => [entry.roles[0].performers[0].initials, [...PRACTICE_WEEKDAYS]]),
  );
  const result = buildPracticeSchedule(songs, availability);

  assert.equal(result.availabilitySearchComplete, false);
  assert.equal(result.optimal, false);
  assert.ok(result.options.length > 0 && result.options.length <= 5);
  assert.ok(result.options.every(({ sessions }) =>
    sessions[0].weeknight !== sessions[1].weeknight,
  ));
});

test('suggests individual Bass song exchanges that improve the optimized session split', () => {
  for (const role of ['Bass', 'Drums']) {
    const songs = [
      song('One', ['E', 'F']),
      song('Two', ['F']),
      song('Three', ['F']),
      song('Four', ['E', 'F', 'G']),
    ];
    const assignments = ['B', 'B', 'C', 'C'];
    songs.forEach((entry, index) => {
      entry.roles.push({
        role,
        performers: [{ initials: assignments[index], name: `${role} player ${assignments[index]}` }],
        status: null,
        detail: null,
      });
    });
    const before = structuredClone(songs);
    const schedule = buildPracticeSchedule(songs);

    assert.equal(schedule.options[0].sharedPerformers.length, 2);
    assert.ok(schedule.suggestedSwaps.length > 0);
    assert.ok(schedule.suggestedSwaps[0].sharedPerformers.length < 2);
    assert.ok(schedule.suggestedSwaps.some((suggestion) =>
      suggestion.role === role &&
      suggestion.exchanges.some(({ performer }) => performer.initials === 'B') &&
      suggestion.exchanges.some(({ performer }) => performer.initials === 'C'),
    ));
    const suggestion = schedule.suggestedSwaps[0];
    assert.equal(suggestion.sessions.length, 2);
    const plannedSongs = suggestion.sessions.flatMap(({ blocks }) => blocks.flat());
    for (const [from, to] of [
      [suggestion.exchanges[0], suggestion.exchanges[1]],
      [suggestion.exchanges[1], suggestion.exchanges[0]],
    ] as const) {
      const plannedSong = plannedSongs.find(({ title, originalArtist }) =>
        getSongAnchor(title, originalArtist) ===
          getSongAnchor(from.song.title, from.song.originalArtist),
      )!;
      assert.ok(plannedSong.roles.find((entry) => entry.role === role)?.performers.some(
        ({ initials }) => initials === to.performer.initials,
      ));
    }
    assert.deepEqual(songs, before);
  }
});

test('prefers fewer shared identities even when they hold many more roles', () => {
  const songs = [
    song('One', ['X', 'Y', 'Z']),
    song('Two', ['X', 'W', 'V']),
    song('Three', ['Y', 'W']),
    song('Four', ['Z', 'V']),
  ];
  for (const entry of songs.slice(0, 2)) {
    for (let role = 0; role < 20; role++) {
      entry.roles.push({
        role: `Part ${role}`, status: null, detail: null,
        performers: [{ initials: 'X', name: 'Name X' }],
      });
    }
  }
  const result = check(songs);
  assert.equal(result.options.length, 2);
  for (const { sharedPerformers } of result.options) {
    assert.equal(sharedPerformers.length, 3);
    assert.ok(sharedPerformers.some(({ initials }) => initials === 'X'));
  }
});

test('merges normalized duplicate anchors and roles without losing performers or mutating input', () => {
  const first = song(' A Song ', ['AB', 'AB']);
  const duplicate = song('a song', ['CD', 'AB']);
  duplicate.originalArtist = ' ARTIST ';
  duplicate.roles.push({
    role: 'Additional Instruments', performers: [{ initials: 'EF', name: 'Name EF' }],
    status: 'nice-to-have', detail: 'Strings',
  });
  duplicate.roles.push({
    role: 'Vocal', performers: [], status: 'needed', detail: null,
  });
  const songs = [first, duplicate, song('Other', ['CD', 'EF'])];
  const before = structuredClone(songs);
  const result = check(songs);
  assert.equal(result.optimal, true);
  assert.equal(result.options.length, 1);
  const merged = result.options[0].groups.flat().find(({ title }) => title === first.title)!;
  assert.deepEqual(merged.roles, [
    { ...first.roles[0], performers: [
      { initials: 'AB', name: 'Name AB' }, { initials: 'CD', name: 'Name CD' },
    ] },
    duplicate.roles[1], duplicate.roles[2],
  ]);
  assert.deepEqual(result.options[0].sharedPerformers.map(({ initials }) => initials), ['CD', 'EF']);
  assert.deepEqual(songs, before);
});

test('different artists remain distinct; eligibility and Done! filtering belong to the caller', () => {
  const first = song('Done!', ['AB']);
  const second = { ...song('Done!', ['CD']), originalArtist: 'Other artist' };
  check([first, second, song('Third')]);
  const duplicate = { ...first, title: ' DONE! ' };
  const result = buildPracticeGroups([first, duplicate]);
  assert.deepEqual(result.options[0].groups.map((group) => group.length), [1, 0]);
});

test('22 songs still receive an exact balanced optimum', () => {
  const songs = Array.from({ length: 22 }, (_, index) =>
    song(`Song ${index}`, [index < 11 ? 'AB' : 'CD']),
  );
  const result = check(songs);
  assert.equal(result.optimal, true);
  assert.equal(result.options.length, 1);
  assert.equal(result.options[0].sharedPerformers.length, 0);
});

test('larger fallback is deterministic, balanced, bounded, and explicitly non-optimal', { timeout: 10_000 }, () => {
  for (const size of [23, 100, 1_000]) {
    const songs = Array.from({ length: size }, (_, index) =>
      song(`Song ${index}`, [`P${index % 13}`, `Q${index % 7}`]),
    );
    const before = structuredClone(songs);
    const result = check(songs);
    assert.equal(result.optimal, false);
    assert.deepEqual(buildPracticeGroups(songs), result);
    assert.deepEqual(songs, before);
  }
});

function checkSchedule(songs: SetListSong[]) {
  const groups = buildPracticeGroups(songs);
  const schedule = buildPracticeSchedule(songs);
  assert.equal(schedule.optimal, groups.optimal);
  assert.deepEqual(schedule.options.map(({ groups, sharedPerformers }) => ({
    groups, sharedPerformers,
  })), groups.options);
  assert.ok(schedule.options.length <= 5);
  for (const option of schedule.options) {
    assert.equal(option.sessions.length, 2);
    for (let index = 0; index < 2; index++) {
      const group = option.groups[index];
      const session = option.sessions[index];
      const split = buildPracticeGroups(group);
      assert.deepEqual(session, group.length ? {
        blocks: split.options[0].groups,
        sharedPerformers: split.options[0].sharedPerformers,
        optimal: split.optimal,
      } : { blocks: [[], []], sharedPerformers: [], optimal: true });
      assert.deepEqual(session.blocks.map((block) => block.length).sort((a, b) => a - b), [
        Math.floor(group.length / 2), Math.ceil(group.length / 2),
      ]);
      const anchors = session.blocks.flat().map(({ title, originalArtist }) =>
        getSongAnchor(title, originalArtist),
      );
      assert.equal(new Set(anchors).size, anchors.length);
      assert.deepEqual(new Set(anchors), new Set(group.map(({ title, originalArtist }) =>
        getSongAnchor(title, originalArtist),
      )));
      assert.deepEqual(
        session.sharedPerformers.map(({ initials }) => initials), shared(session.blocks),
      );
    }
    const anchors = option.sessions.flatMap(({ blocks }) => blocks.flat())
      .map(({ title, originalArtist }) => getSongAnchor(title, originalArtist));
    assert.equal(new Set(anchors).size, anchors.length);
    assert.deepEqual(new Set(anchors), new Set(songs.map(({ title, originalArtist }) =>
      getSongAnchor(title, originalArtist),
    )));
  }
  assert.deepEqual(buildPracticeSchedule(songs), schedule);
  return schedule;
}

test('hierarchical schedules handle empty, single, two, and odd song counts', () => {
  assert.deepEqual(checkSchedule([]), {
    options: [], optimal: true, suggestedSwaps: [], swapSearchComplete: true,
  });
  const only = song('Only', ['AB']);
  assert.deepEqual(checkSchedule([only]), {
    options: [{
      groups: [[only], []],
      sharedPerformers: [],
      sessions: [
        { blocks: [[only], []], sharedPerformers: [], optimal: true },
        { blocks: [[], []], sharedPerformers: [], optimal: true },
      ],
    }],
    optimal: true,
    suggestedSwaps: [],
    swapSearchComplete: true,
  });
  const two = checkSchedule([only, song('Second', ['AB'])]);
  assert.deepEqual(two.options[0].sharedPerformers, [{ initials: 'AB', name: 'Name AB' }]);
  assert.ok(two.options[0].sessions.every(({ blocks, sharedPerformers, optimal }) =>
    blocks[0].length === 1 && blocks[1].length === 0 && !sharedPerformers.length && optimal,
  ));
  for (const size of [3, 5, 7, 9]) {
    const result = checkSchedule(Array.from({ length: size }, (_, index) =>
      song(`Song ${index}`, [`P${index % 3}`]),
    ));
    assert.equal(result.optimal, true);
    assert.ok(result.options.every(({ sessions }) => sessions.every(({ optimal }) => optimal)));
  }
});

test('each exact session chooses the first optimal balanced split without changing outer options', () => {
  let state = 98765;
  function random() {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state;
  }
  for (let sample = 0; sample < 50; sample++) {
    const songs = Array.from({ length: 4 + random() % 9 }, (_, index) =>
      song(`Song ${index}`, ['A', 'B', 'C', 'D', 'E'].filter(() => random() % 3 === 0)),
    );
    const schedule = checkSchedule(songs);
    const outerOracle = oracle(songs);
    assert.equal(schedule.optimal, true);
    assert.equal(schedule.options[0].sharedPerformers.length, outerOracle.best);
    for (const { groups, sessions } of schedule.options) {
      for (let index = 0; index < 2; index++) {
        const expected = oracle(groups[index]);
        assert.equal(sessions[index].optimal, true);
        assert.equal(sessions[index].sharedPerformers.length, expected.best);
        assert.ok(expected.keys.has(pairKey(sessions[index].blocks)));
      }
    }
  }
  const ties = checkSchedule(Array.from({ length: 8 }, (_, index) => song(`Tie ${index}`)));
  assert.equal(ties.options.length, 5);
  assert.ok(ties.options.every(({ sessions }) => sessions.every(({ blocks }) =>
    blocks[0].length === 2 && blocks[1].length === 2,
  )));
});

test('inner splits count unique initials across roles, not display names or role assignments', () => {
  const songs = Array.from({ length: 8 }, (_, index) =>
    song(`Song ${index}`, [index < 4 ? 'A' : 'B', index % 2 ? 'Y' : 'X']),
  );
  for (const entry of songs) {
    entry.roles[0].performers.forEach((performer) => { performer.name = 'Alex'; });
    entry.roles.push({
      role: 'Guitar', status: null, detail: null,
      performers: [
        { initials: entry.roles[0].performers[0].initials, name: 'Different name' },
        ...Array.from({ length: 10 }, () => ({ ...entry.roles[0].performers[1] })),
      ],
    });
  }
  const schedule = checkSchedule(songs);
  assert.equal(schedule.options[0].sharedPerformers.length, 2);
  for (const { sessions } of schedule.options) {
    for (const session of sessions) {
      assert.equal(session.sharedPerformers.length, 1);
      assert.equal(session.sharedPerformers[0].name, 'Alex');
      assert.equal(session.sharedPerformers.length, oracle(session.blocks.flat()).best);
    }
  }
});

test('schedule preserves duplicate merging, distinct artists, caller filtering, and input immutability', () => {
  const first = song(' A Song ', ['AB']);
  const duplicate = song('a song', ['CD']);
  duplicate.originalArtist = ' ARTIST ';
  duplicate.roles.push({
    role: 'Additional Instruments', status: 'nice-to-have', detail: 'Strings',
    performers: [{ initials: 'EF', name: 'Name EF' }],
  });
  const songs = [
    first, duplicate, { ...song('a song', ['EF']), originalArtist: 'Other artist' },
    song('Done!', ['CD']), song('Other', ['AB']),
  ];
  const before = structuredClone(songs);
  const schedule = checkSchedule(songs);
  for (const { sessions } of schedule.options) {
    const entries = sessions.flatMap(({ blocks }) => blocks.flat());
    assert.equal(entries.length, 4);
    assert.ok(entries.some(({ title }) => title === 'Done!'));
    const merged = entries.find(({ title }) => title === first.title)!;
    assert.deepEqual(merged.roles[0].performers.map(({ initials }) => initials), ['AB', 'CD']);
    assert.deepEqual(merged.roles[1], duplicate.roles[1]);
  }
  assert.deepEqual(songs, before);
});

test('outer and inner bounded-search flags are independent and deterministic', { timeout: 10_000 }, () => {
  for (const size of [23, 45, 46]) {
    const songs = Array.from({ length: size }, (_, index) =>
      song(`Song ${index}`, [`P${index % 7}`, `Q${index % 3}`]),
    );
    const before = structuredClone(songs);
    const schedule = checkSchedule(songs);
    assert.equal(schedule.optimal, false);
    for (const { groups, sessions } of schedule.options) {
      assert.deepEqual(sessions.map(({ optimal }) => optimal),
        groups.map((group) => group.length <= 22));
    }
    assert.deepEqual(songs, before);
  }
});
