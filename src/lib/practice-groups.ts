import { getSongAnchor, type SetListSong } from './october-set-list';

type Performer = { initials: string; name: string };
type PracticeOption = {
  groups: [SetListSong[], SetListSong[]];
  sharedPerformers: Performer[];
};

const EXACT_SONG_LIMIT = 22;
const SEARCH_STARTS = 8;
const SWAPS_PER_START = 2_500;
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
  const indices = new Map(roster.map(({ initials }, index) => [initials, index]));
  const members = entries.map((song) => [...new Set(
    song.roles.flatMap(({ performers }) =>
      performers.map(({ initials }) => indices.get(initials)!),
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
        counts[0][index] > 0 && counts[1][index] > 0,
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
