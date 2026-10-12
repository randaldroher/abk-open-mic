import { getSongAnchor, type SetListSong } from './october-set-list';

type Performer = { initials: string; name: string };
type PracticeOption = {
  groups: [SetListSong[], SetListSong[]];
  sharedPerformers: Performer[];
};
type PracticeSession = {
  blocks: [SetListSong[], SetListSong[]];
  sharedPerformers: Performer[];
  optimal: boolean;
};
type PracticeSwap = {
  role: 'Bass' | 'Drums';
  exchanges: [
    { song: SetListSong; performer: Performer },
    { song: SetListSong; performer: Performer },
  ];
  overlapReduction: number;
  sharedPerformers: Performer[];
  sessions: [PracticeSession, PracticeSession];
};

const EXACT_SONG_LIMIT = 22;
const SEARCH_STARTS = 8;
const SWAPS_PER_START = 2_500;
const ASSIGNMENT_PAIR_SCAN_LIMIT = 20_000;
const ASSIGNMENT_SWAP_LIMIT = 100;
const OPTION_LIMIT = 5;
const ALWAYS_PRESENT_FIRST_NAMES = new Set(['donald', 'randal']);

export function isAlwaysPresentPracticeAttendee(name: string): boolean {
  const firstName = name.trim().split(/\s+/)[0]?.toLocaleLowerCase('en');
  return ALWAYS_PRESENT_FIRST_NAMES.has(firstName ?? '');
}

function mergeSongs(songs: SetListSong[]): SetListSong[] {
  const merged = new Map<string, SetListSong>();
  for (const song of songs) {
    const anchor = getSongAnchor(song.title, song.originalArtist);
    let entry = merged.get(anchor);
    if (!entry) {
      entry = { ...song, roles: [] };
      merged.set(anchor, entry);
    }
    for (const role of song.roles) {
      // Preserve distinct need markers and instrument qualifiers on duplicate rows.
      let target = entry.roles.find((candidate) =>
        candidate.role === role.role && candidate.status === role.status &&
        candidate.detail === role.detail,
      );
      if (!target) {
        target = { ...role, performers: [] };
        entry.roles.push(target);
      }
      const seen = new Set(target.performers.map(({ initials }) => initials));
      for (const performer of role.performers) {
        if (!seen.has(performer.initials)) {
          target.performers.push({ ...performer });
          seen.add(performer.initials);
        }
      }
    }
  }
  return [...merged.values()];
}

export function buildPracticeGroups(songs: SetListSong[]): {
  options: PracticeOption[];
  optimal: boolean;
} {
  const entries = mergeSongs(songs);
  const size = entries.length;
  if (!size) return { options: [], optimal: true };
  if (size === 1) {
    return { options: [{ groups: [entries, []], sharedPerformers: [] }], optimal: true };
  }

  const performers = new Map<string, Performer>();
  for (const song of entries) {
    for (const role of song.roles) {
      for (const performer of role.performers) {
        if (!performers.has(performer.initials)) {
          performers.set(performer.initials, performer);
        }
      }
    }
  }
  const roster = [...performers.values()].sort((a, b) =>
    a.initials < b.initials ? -1 : a.initials > b.initials ? 1 : 0,
  );
  const alwaysPresent = new Set(
    roster.filter(({ name }) => isAlwaysPresentPracticeAttendee(name))
      .map(({ initials }) => initials),
  );
  const indices = new Map(roster.map(({ initials }, index) => [initials, index]));
  const members = entries.map((song) => [...new Set(
    song.roles.flatMap(({ performers }) =>
      performers.filter(({ initials }) => !alwaysPresent.has(initials))
        .map(({ initials }) => indices.get(initials)!),
    ),
  )]);
  const counts = [new Uint32Array(roster.length), new Uint32Array(roster.length)];
  const firstSize = Math.floor(size / 2);
  const selection = new Array<boolean>(size).fill(false);
  let overlap = 0;
  let best = Infinity;
  let options: PracticeOption[] = [];
  const keys = new Set<string>();

  function update(song: number, side: number, delta: number) {
    for (const performer of members[song]) {
      const wasShared = counts[0][performer] > 0 && counts[1][performer] > 0;
      counts[side][performer] += delta;
      const isShared = counts[0][performer] > 0 && counts[1][performer] > 0;
      overlap += Number(isShared) - Number(wasShared);
    }
  }

  function remember() {
    if (overlap > best) return;
    if (overlap < best) {
      best = overlap;
      options = [];
      keys.clear();
    }
    if (options.length === OPTION_LIMIT) return;
    const swap = size % 2 === 0 && !selection[0];
    const first = selection.map((selected) => swap ? !selected : selected);
    const key = first.map((selected) => Number(selected)).join('');
    if (keys.has(key)) return;
    keys.add(key);
    options.push({
      groups: [
        entries.filter((_, index) => first[index]),
        entries.filter((_, index) => !first[index]),
      ],
      sharedPerformers: roster.filter((_, index) =>
        counts[0][index] > 0 && counts[1][index] > 0 &&
        !alwaysPresent.has(roster[index].initials),
      ).map((performer) => ({ ...performer })),
    });
  }

  if (size <= EXACT_SONG_LIMIT) {
    // At most C(22, 11) / 2 = 352,716 balanced pairs; partial overlap only grows.
    function visit(index: number, firstCount: number) {
      if (
        overlap > best ||
        (overlap === best && options.length === OPTION_LIMIT)
      ) return;
      if (index === size) {
        remember();
        return;
      }
      if (firstCount < firstSize) {
        selection[index] = true;
        update(index, 0, 1);
        visit(index + 1, firstCount + 1);
        update(index, 0, -1);
      }
      if (index - firstCount < size - firstSize && (index !== 0 || size % 2 !== 0)) {
        selection[index] = false;
        update(index, 1, 1);
        visit(index + 1, firstCount);
        update(index, 1, -1);
      }
    }
    visit(0, 0);
    return { options, optimal: true };
  }

  // Larger inputs never recurse or enumerate partitions: eight deterministic
  // seeds, at most 20,000 swap evaluations total, and only strict improvements.
  for (let start = 0; start < SEARCH_STARTS; start++) {
    counts[0].fill(0);
    counts[1].fill(0);
    overlap = 0;
    const offset = Math.floor(start * size / SEARCH_STARTS);
    for (let index = 0; index < size; index++) {
      selection[index] = (index - offset + size) % size < firstSize;
      update(index, selection[index] ? 0 : 1, 1);
    }
    remember();
    let work = 0;
    let improved = true;
    while (improved && work < SWAPS_PER_START) {
      improved = false;
      search: for (let first = 0; first < size; first++) {
        if (!selection[first]) continue;
        for (let second = 0; second < size; second++) {
          if (selection[second]) continue;
          if (work++ >= SWAPS_PER_START) break search;
          const before = overlap;
          update(first, 0, -1);
          update(first, 1, 1);
          update(second, 1, -1);
          update(second, 0, 1);
          selection[first] = false;
          selection[second] = true;
          remember();
          if (overlap < before) {
            improved = true;
            break search;
          }
          selection[first] = true;
          selection[second] = false;
          update(first, 1, -1);
          update(first, 0, 1);
          update(second, 0, -1);
          update(second, 1, 1);
        }
      }
    }
  }
  return { options, optimal: false };
}

export function buildPracticeSchedule(songs: SetListSong[]): {
  options: (PracticeOption & { sessions: [PracticeSession, PracticeSession] })[];
  optimal: boolean;
  suggestedSwaps: PracticeSwap[];
  swapSearchComplete: boolean;
} {
  const result = buildPracticeGroups(songs);

  function session(group: SetListSong[]): PracticeSession {
    if (!group.length) {
      return { blocks: [[], []], sharedPerformers: [], optimal: true };
    }
    const split = buildPracticeGroups(group);
    const first = split.options[0];
    return {
      blocks: first.groups,
      sharedPerformers: first.sharedPerformers,
      optimal: split.optimal,
    };
  }

  const entries = mergeSongs(songs);
  const baseOverlap = result.options[0]?.sharedPerformers.length ?? Infinity;
  const assignments = baseOverlap > 0
    ? entries.flatMap((entry) => entry.roles.flatMap((role) =>
        (role.role === 'Bass' || role.role === 'Drums')
          ? role.performers.filter(({ name }) => !isAlwaysPresentPracticeAttendee(name))
            .map((performer) => ({
              song: entry,
              role: role.role as 'Bass' | 'Drums',
              performer,
            }))
          : [],
      ))
    : [];
  const suggestions = new Map<string, PracticeSwap>();
  let evaluations = 0;
  let comparisons = 0;
  let swapSearchComplete = true;
  search: for (let first = 0; first < assignments.length; first++) {
    for (let second = first + 1; second < assignments.length; second++) {
      if (comparisons++ === ASSIGNMENT_PAIR_SCAN_LIMIT) {
        swapSearchComplete = false;
        break search;
      }
      const a = assignments[first];
      const b = assignments[second];
      if (
        a.role !== b.role || a.performer.initials === b.performer.initials ||
        getSongAnchor(a.song.title, a.song.originalArtist) ===
          getSongAnchor(b.song.title, b.song.originalArtist)
      ) continue;
      const firstRole = a.song.roles.find(({ role }) => role === a.role)!;
      const secondRole = b.song.roles.find(({ role }) => role === b.role)!;
      if (
        firstRole.performers.some(({ initials }) => initials === b.performer.initials) ||
        secondRole.performers.some(({ initials }) => initials === a.performer.initials)
      ) continue;
      if (evaluations === ASSIGNMENT_SWAP_LIMIT) {
        swapSearchComplete = false;
        break search;
      }
      evaluations++;

      const changed = mergeSongs(entries);
      const changedFirst = changed.find(({ title, originalArtist }) =>
        getSongAnchor(title, originalArtist) === getSongAnchor(a.song.title, a.song.originalArtist),
      )!;
      const changedSecond = changed.find(({ title, originalArtist }) =>
        getSongAnchor(title, originalArtist) === getSongAnchor(b.song.title, b.song.originalArtist),
      )!;
      const changedFirstRole = changedFirst.roles.find(({ role }) => role === a.role)!;
      const changedSecondRole = changedSecond.roles.find(({ role }) => role === b.role)!;
      const firstIndex = changedFirstRole.performers.findIndex(
        ({ initials }) => initials === a.performer.initials,
      );
      const secondIndex = changedSecondRole.performers.findIndex(
        ({ initials }) => initials === b.performer.initials,
      );
      changedFirstRole.performers[firstIndex] = { ...b.performer };
      changedSecondRole.performers[secondIndex] = { ...a.performer };

      const optimized = buildPracticeGroups(changed.flat());
      const best = optimized.options[0];
      if (!best || best.sharedPerformers.length >= baseOverlap) continue;
      const swapKey = [
        a.role,
        getSongAnchor(a.song.title, a.song.originalArtist),
        a.performer.initials,
        getSongAnchor(b.song.title, b.song.originalArtist),
        b.performer.initials,
      ].join('|');
      suggestions.set(swapKey, {
        role: a.role,
        exchanges: [
          { song: changedFirst, performer: { ...a.performer } },
          { song: changedSecond, performer: { ...b.performer } },
        ],
        overlapReduction: baseOverlap - best.sharedPerformers.length,
        sharedPerformers: best.sharedPerformers,
        sessions: [session(best.groups[0]), session(best.groups[1])],
      });
    }
  }

  return {
    options: result.options.map((option) => ({
      ...option,
      sessions: [session(option.groups[0]), session(option.groups[1])],
    })),
    optimal: result.optimal,
    suggestedSwaps: [...suggestions.values()]
      .sort((a, b) =>
        a.sharedPerformers.length - b.sharedPerformers.length ||
        a.role.localeCompare(b.role) ||
        getSongAnchor(a.exchanges[0].song.title, a.exchanges[0].song.originalArtist)
          .localeCompare(getSongAnchor(b.exchanges[0].song.title, b.exchanges[0].song.originalArtist)),
      )
      .slice(0, OPTION_LIMIT),
    swapSearchComplete,
  };
}
