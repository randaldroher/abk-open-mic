import {
  PRACTICE_WEEKDAYS,
  type PracticeWeekday,
} from './october-signup';
import { getSongAnchor, type SetListSong } from './october-set-list';

export type PracticePerformer = { initials: string; name: string };
type Performer = PracticePerformer;
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

function isWeeknightPlan(option: PracticeOption | WeeknightPlan): option is WeeknightPlan {
  return 'weeknights' in option;
}

const EXACT_SONG_LIMIT = 22;
const SEARCH_STARTS = 8;
const SWAPS_PER_START = 2_500;
const ASSIGNMENT_PAIR_SCAN_LIMIT = 20_000;
const ASSIGNMENT_SWAP_LIMIT = 100;
const WEEKDAY_SWAP_EVALUATION_LIMIT = 2_500;
const OPTION_LIMIT = 5;

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

export function buildPracticeGroups(
  songs: SetListSong[],
  alwaysPresentInitials: ReadonlySet<string> = new Set(),
): {
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
  const indices = new Map(roster.map(({ initials }, index) => [initials, index]));
  const members = entries.map((song) => [...new Set(
    song.roles.flatMap(({ performers }) =>
      performers.filter(({ initials }) => !alwaysPresentInitials.has(initials))
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
        !alwaysPresentInitials.has(roster[index].initials),
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
  alwaysPresentInitials: ReadonlySet<string>,
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

  function score(groups: [SetListSong[], SetListSong[]]): [number, number] {
    const attendees = groups.map((group) => {
      const initials = new Set(group.flatMap((entry) => entry.roles.flatMap(
        ({ performers }) => performers
          .filter(({ initials }) => !alwaysPresentInitials.has(initials))
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
    let groupConflicts = Infinity;
    let groupOverlap = Infinity;
    let bestWeeknightMask = 0;
    let weeknightIndex = 0;
    for (let firstDay = 0; firstDay < PRACTICE_WEEKDAYS.length; firstDay++) {
      for (let secondDay = 0; secondDay < PRACTICE_WEEKDAYS.length; secondDay++) {
        if (firstDay === secondDay) continue;
        const currentWeeknightIndex = weeknightIndex++;
        const weeknights = [
          PRACTICE_WEEKDAYS[firstDay],
          PRACTICE_WEEKDAYS[secondDay],
        ] as [PracticeWeekday, PracticeWeekday];
        const conflicts = attendees.reduce((total, people, session) =>
          total + people.reduce((unavailableCount, { initials }) => {
            const available = availabilityByInitials.get(initials);
            return unavailableCount + Number(
              available !== null && available !== undefined &&
              !available.includes(weeknights[session]),
            );
          }, 0),
        0);
        if (
          conflicts > groupConflicts ||
          (conflicts === groupConflicts && sharedPerformers.length > groupOverlap)
        ) continue;

        if (conflicts < groupConflicts ||
          (conflicts === groupConflicts && sharedPerformers.length < groupOverlap)) {
          groupConflicts = conflicts;
          groupOverlap = sharedPerformers.length;
          bestWeeknightMask = 0;
        }

        bestWeeknightMask |= 1 << currentWeeknightIndex;
      }
    }

    if (
      groupConflicts < bestConflicts ||
      (groupConflicts === bestConflicts && groupOverlap < bestOverlap)
    ) {
      bestConflicts = groupConflicts;
      bestOverlap = groupOverlap;
      optionMap.clear();
    }
    if (groupConflicts === bestConflicts && groupOverlap === bestOverlap) {
      const groupAnchors = groups.map((group) => group.map(({ title, originalArtist }) =>
        getSongAnchor(title, originalArtist),
      ).sort().join(','));
      weeknightIndex = 0;
      for (let firstDay = 0; firstDay < PRACTICE_WEEKDAYS.length; firstDay++) {
        for (let secondDay = 0; secondDay < PRACTICE_WEEKDAYS.length; secondDay++) {
          if (firstDay === secondDay) continue;
          if (!(bestWeeknightMask & (1 << weeknightIndex++))) continue;
          if (optionMap.size === OPTION_LIMIT) continue;
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
          const key = [...groupAnchors].sort().join('|');
          if (optionMap.has(key)) continue;
          optionMap.set(key, {
            groups,
            sharedPerformers,
            weeknights,
            unavailablePerformers,
            availabilityConflicts: groupConflicts,
          });
        }
      }
    }
    return [groupConflicts, groupOverlap];
  }

  if (entries.length <= EXACT_SONG_LIMIT) {
    const firstSize = Math.floor(entries.length / 2);
    const selection = new Array<boolean>(entries.length).fill(false);
    function visit(index: number, firstCount: number) {
      if (index === entries.length) {
        score([
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
    if (entries.length === 1) score([entries, []]);
    else visit(0, 0);
    return { options: [...optionMap.values()], optimal: true };
  }

  const firstSize = Math.floor(entries.length / 2);
  let evaluations = 0;
  function compare(left: [number, number], right: [number, number]): number {
    return left[0] - right[0] || left[1] - right[1];
  }
  for (let start = 0; start < SEARCH_STARTS; start++) {
    const offset = Math.floor(start * entries.length / SEARCH_STARTS);
    const selection = entries.map((_, index) =>
      (index - offset + entries.length) % entries.length < firstSize,
    );
    function groups(): [SetListSong[], SetListSong[]] {
      return [
        entries.filter((_, index) => selection[index]),
        entries.filter((_, index) => !selection[index]),
      ];
    }

    let currentScore = score(groups());
    let improved = true;
    while (improved && evaluations < WEEKDAY_SWAP_EVALUATION_LIMIT) {
      improved = false;
      search: for (let first = 0; first < entries.length; first++) {
        if (!selection[first]) continue;
        for (let second = 0; second < entries.length; second++) {
          if (selection[second]) continue;
          if (evaluations++ === WEEKDAY_SWAP_EVALUATION_LIMIT) break search;
          selection[first] = false;
          selection[second] = true;
          const candidateScore = score(groups());
          if (compare(candidateScore, currentScore) < 0) {
            currentScore = candidateScore;
            improved = true;
            break search;
          }
          selection[first] = true;
          selection[second] = false;
        }
      }
    }
    if (evaluations >= WEEKDAY_SWAP_EVALUATION_LIMIT) break;
  }
  return { options: [...optionMap.values()], optimal: false };
}

export function buildPracticeSchedule(
  songs: SetListSong[],
  availabilityByInitials?: ReadonlyMap<string, PracticeWeekday[] | null>,
  alwaysPresentInitials: ReadonlySet<string> = new Set(),
): {
  options: (PracticeOption & { sessions: [PracticeSession, PracticeSession] })[];
  optimal: boolean;
  suggestedSwaps: PracticeSwap[];
  swapSearchComplete: boolean;
  availabilitySearchComplete?: boolean;
} {
  const result = buildPracticeGroups(songs, alwaysPresentInitials);
  const assignedInitials = new Set(songs.flatMap(({ roles }) =>
    roles.flatMap(({ performers }) => performers
      .filter(({ initials }) => !alwaysPresentInitials.has(initials))
      .map(({ initials }) => initials)),
  ));
  const availabilityAware = availabilityByInitials !== undefined &&
    [...assignedInitials].some((initials) => {
      const days = availabilityByInitials.get(initials);
      return days !== null && days !== undefined && days.length > 0;
    });
  const weeknightSearch = availabilityAware
    ? buildWeeknightPlans(songs, availabilityByInitials!, alwaysPresentInitials)
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
      };
    }
    const split = buildPracticeGroups(group, alwaysPresentInitials);
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
          ? role.performers.filter(({ initials }) => !alwaysPresentInitials.has(initials))
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
        ? buildWeeknightPlans(changed, availabilityByInitials!, alwaysPresentInitials)
        : null;
      const best = optimized?.options[0] ??
        buildPracticeGroups(changed, alwaysPresentInitials).options[0];
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
    options: baseOptions.map((option) => {
      const plan = isWeeknightPlan(option) ? option : null;
      return {
        ...option,
        sessions: [
          session(
            option.groups[0],
            plan?.weeknights[0],
            plan?.unavailablePerformers[0],
          ),
          session(
            option.groups[1],
            option.groups[1].length ? plan?.weeknights[1] : undefined,
            plan?.unavailablePerformers[1],
          ),
        ],
      };
    }),
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
