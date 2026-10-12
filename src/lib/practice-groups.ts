import {
  PRACTICE_WEEKDAYS,
  type PracticeWeekday,
} from './october-signup';
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
  weeknight?: PracticeWeekday;
  unavailablePerformers?: Performer[];
};
type PracticeSwap = {
  role: 'Bass' | 'Drums';
  exchanges: [
    { song: SetListSong; performer: Performer },
    { song: SetListSong; performer: Performer },
  ];
  overlapReduction: number;
  availabilityConflictReduction: number;
  sharedPerformers: Performer[];
  sessions: [PracticeSession, PracticeSession];
};
type WeeknightPlan = PracticeOption & {
  weeknights: [PracticeWeekday, PracticeWeekday];
  unavailablePerformers: [Performer[], Performer[]];
  availabilityConflicts: number;
};
type WeeknightSearch = {
  options: WeeknightPlan[];
  optimal: boolean;
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

function buildWeeknightPlans(
  songs: SetListSong[],
  availabilityByInitials: ReadonlyMap<string, PracticeWeekday[] | null>,
): WeeknightSearch {
  const entries = mergeSongs(songs);
  if (!entries.length) return { options: [], optimal: true };
  const peopleByInitials = new Map<string, Performer>();
  for (const entry of entries) {
    for (const role of entry.roles) {
      for (const performer of role.performers) {
        if (!peopleByInitials.has(performer.initials)) {
          peopleByInitials.set(performer.initials, performer);
        }
      }
    }
  }
  const optionMap = new Map<string, WeeknightPlan>();
  let bestConflicts = Infinity;
  let bestOverlap = Infinity;

  function remember(groups: [SetListSong[], SetListSong[]]) {
    const attendees = groups.map((group) => {
      const initials = new Set(group.flatMap((entry) => entry.roles.flatMap(
        ({ performers }) => performers
          .filter(({ name }) => !isAlwaysPresentPracticeAttendee(name))
          .map(({ initials }) => initials),
      )));
      return [...initials].flatMap((initial) => {
        const performer = peopleByInitials.get(initial);
        return performer ? [performer] : [];
      });
    }) as [Performer[], Performer[]];
    const secondInitials = new Set(attendees[1].map(({ initials }) => initials));
    const sharedPerformers = attendees[0]
      .filter(({ initials }) => secondInitials.has(initials));
    const groupAnchors = groups.map((group) => group.map(({ title, originalArtist }) =>
      getSongAnchor(title, originalArtist),
    ).sort().join(','));

    for (let firstDay = 0; firstDay < PRACTICE_WEEKDAYS.length - 1; firstDay++) {
      for (let secondDay = firstDay + 1; secondDay < PRACTICE_WEEKDAYS.length; secondDay++) {
        const weeknights = [
          PRACTICE_WEEKDAYS[firstDay],
          PRACTICE_WEEKDAYS[secondDay],
        ] as [PracticeWeekday, PracticeWeekday];
        const unavailablePerformers = attendees.map((people, session) =>
          people.filter(({ initials }) => {
            const available = availabilityByInitials.get(initials);
            return available !== null && available !== undefined &&
              !available.includes(weeknights[session]);
          }),
        ) as [Performer[], Performer[]];
        const conflicts = unavailablePerformers[0].length +
          unavailablePerformers[1].length;
        if (
          conflicts > bestConflicts ||
          (conflicts === bestConflicts && sharedPerformers.length > bestOverlap)
        ) continue;

        if (conflicts < bestConflicts ||
          (conflicts === bestConflicts && sharedPerformers.length < bestOverlap)) {
          bestConflicts = conflicts;
          bestOverlap = sharedPerformers.length;
          optionMap.clear();
        }

        const key = `${groupAnchors[0]}|${groupAnchors[1]}|${weeknights.join('|')}`;
        if (optionMap.has(key) || optionMap.size === OPTION_LIMIT) continue;
        optionMap.set(key, {
          groups,
          sharedPerformers,
          weeknights,
          unavailablePerformers,
          availabilityConflicts: conflicts,
        });
      }
    }
  }

  if (entries.length <= EXACT_SONG_LIMIT) {
    const firstSize = Math.floor(entries.length / 2);
    const selection = new Array<boolean>(entries.length).fill(false);
    function visit(index: number, firstCount: number) {
      if (index === entries.length) {
        remember([
          entries.filter((_, songIndex) => selection[songIndex]),
          entries.filter((_, songIndex) => !selection[songIndex]),
        ]);
        return;
      }
      if (firstCount < firstSize) {
        selection[index] = true;
        visit(index + 1, firstCount + 1);
      }
      if (
        index - firstCount < entries.length - firstSize &&
        (index !== 0 || entries.length % 2 !== 0)
      ) {
        selection[index] = false;
        visit(index + 1, firstCount);
      }
    }
    if (entries.length === 1) remember([entries, []]);
    else visit(0, 0);
    return { options: [...optionMap.values()], optimal: true };
  }

  const bounded = buildPracticeGroups(entries);
  for (const { groups } of bounded.options) remember(groups);
  return { options: [...optionMap.values()], optimal: false };
}

export function buildPracticeSchedule(
  songs: SetListSong[],
  availabilityByInitials?: ReadonlyMap<string, PracticeWeekday[] | null>,
): {
  options: (PracticeOption & { sessions: [PracticeSession, PracticeSession] })[];
  optimal: boolean;
  suggestedSwaps: PracticeSwap[];
  swapSearchComplete: boolean;
  availabilitySearchComplete?: boolean;
} {
  const result = buildPracticeGroups(songs);
  const availabilityAware = availabilityByInitials !== undefined &&
    [...availabilityByInitials.values()].some((days) => days !== null && days.length > 0);
  const weeknightSearch = availabilityAware
    ? buildWeeknightPlans(songs, availabilityByInitials!)
    : null;
  const baseOptions = weeknightSearch?.options ?? result.options;
  const baseAvailabilityConflicts = weeknightSearch?.options[0]?.availabilityConflicts ?? 0;
  const baseOverlap = baseOptions[0]?.sharedPerformers.length ?? Infinity;

  function session(
    group: SetListSong[],
    weeknight?: PracticeWeekday,
    unavailablePerformers?: Performer[],
  ): PracticeSession {
    if (!group.length) {
      return {
        blocks: [[], []],
        sharedPerformers: [],
        optimal: true,
        ...(weeknight === undefined ? {} : { weeknight }),
        ...(unavailablePerformers === undefined ? {} : { unavailablePerformers }),
      };
    }
    const split = buildPracticeGroups(group);
    const first = split.options[0];
    return {
      blocks: first.groups,
      sharedPerformers: first.sharedPerformers,
      optimal: split.optimal,
      ...(weeknight === undefined ? {} : { weeknight }),
      ...(unavailablePerformers === undefined ? {} : { unavailablePerformers }),
    };
  }

  const entries = mergeSongs(songs);
  const assignments = baseAvailabilityConflicts > 0 || baseOverlap > 0
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

      const optimized = availabilityAware
        ? buildWeeknightPlans(changed.flat(), availabilityByInitials!)
        : null;
      const best = optimized?.options[0] ?? buildPracticeGroups(changed.flat()).options[0];
      const availabilityConflictReduction =
        baseAvailabilityConflicts - (optimized?.options[0]?.availabilityConflicts ?? 0);
      if (
        !best ||
        availabilityConflictReduction < 0 ||
        (availabilityConflictReduction === 0 &&
          best.sharedPerformers.length >= baseOverlap)
      ) continue;
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
        overlapReduction: Math.max(0, baseOverlap - best.sharedPerformers.length),
        availabilityConflictReduction,
        sharedPerformers: best.sharedPerformers,
        sessions: [
          session(
            best.groups[0],
            optimized?.options[0]?.weeknights[0],
            optimized?.options[0]?.unavailablePerformers[0],
          ),
          session(
            best.groups[1],
            optimized?.options[0]?.weeknights[1],
            optimized?.options[0]?.unavailablePerformers[1],
          ),
        ],
      });
    }
  }

  return {
    options: baseOptions.map((option) => ({
      ...option,
      sessions: [
        session(
          option.groups[0],
          'weeknights' in option ? option.weeknights[0] : undefined,
          'unavailablePerformers' in option ? option.unavailablePerformers[0] : undefined,
        ),
        session(
          option.groups[1],
          'weeknights' in option ? option.weeknights[1] : undefined,
          'unavailablePerformers' in option ? option.unavailablePerformers[1] : undefined,
        ),
      ],
    })),
    optimal: weeknightSearch?.optimal ?? result.optimal,
    suggestedSwaps: [...suggestions.values()]
      .sort((a, b) =>
        b.availabilityConflictReduction - a.availabilityConflictReduction ||
        a.sharedPerformers.length - b.sharedPerformers.length ||
        a.role.localeCompare(b.role) ||
        getSongAnchor(a.exchanges[0].song.title, a.exchanges[0].song.originalArtist)
          .localeCompare(getSongAnchor(b.exchanges[0].song.title, b.exchanges[0].song.originalArtist)),
      )
      .slice(0, OPTION_LIMIT),
    swapSearchComplete,
    ...(weeknightSearch === null
      ? {}
      : { availabilitySearchComplete: weeknightSearch.optimal }),
  };
}
