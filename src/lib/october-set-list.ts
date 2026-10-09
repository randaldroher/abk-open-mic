import {
  normalizeSignupHeader,
  octoberSignupSongColumns,
  type OctoberSignupPerformer,
  type PerformerSongInterest,
} from './october-signup';

export type SetListSong = {
  title: string;
  originalArtist: string | null;
  roles: Array<{
    role: string;
    performers: Array<{ initials: string; name: string }>;
    status: 'nice-to-have' | 'needed' | null;
    detail: string | null;
  }>;
};

export type OctoberSetList = {
  songs: SetListSong[];
  roles: string[];
  fetchedAt: string;
};

export function octoberSetListColumns(headers: string[]) {
  const columns = octoberSignupSongColumns(headers);
  if (
    columns.artist === null ||
    new Set(columns.roles.map(({ role }) => role)).size !== columns.roles.length
  ) {
    throw new Error('Invalid October set-list headers');
  }
  return { ...columns, artist: columns.artist };
}

export function projectOctoberSetList(
  headers: string[],
  rows: string[][],
  performers: OctoberSignupPerformer[],
): Omit<OctoberSetList, 'fetchedAt'> {
  const columns = octoberSetListColumns(headers);
  const names = new Map(performers.map(({ initials, name }) => [initials, name]));
  const songs: SetListSong[] = [];
  for (const row of rows) {
    const title = row[columns.song]?.trim() ?? '';
    if (!title) break;
    const originalArtist = row[columns.artist]?.trim() || null;
    if (/\b[^\s@]+@[^\s@]+\.[^\s@]+\b/.test(`${title} ${originalArtist ?? ''}`)) {
      throw new Error('Invalid October set-list song');
    }
    const roles = columns.roles.map(({ column, role }) => {
      const cell = normalizeSignupHeader(row[column] ?? '');
      const nice = /^nice to have(?: \(strings\))?$/.test(cell);
      const status = nice
        ? 'nice-to-have' as const
        : cell === 'needed!'
          ? 'needed' as const
          : null;
      const initials = status || cell === 'n/a'
        ? []
        : [...new Set((row[column] ?? '').toUpperCase().split(/[,;\n|/&+\s]+/))];
      return {
        role,
        performers: initials.flatMap((initials) => {
          const name = names.get(initials);
          return name ? [{ initials, name }] : [];
        }),
        status,
        detail: nice && cell.endsWith('(strings)') ? 'strings' : null,
      };
    });
    songs.push({ title, originalArtist, roles });
  }
  if (!songs.length) throw new Error('Invalid October set-list songs');
  return { songs, roles: columns.roles.map(({ role }) => role) };
}

export function getSongAnchor(title: string, originalArtist: string | null): string {
  return `song-${encodeURIComponent(JSON.stringify([
    normalizeSignupHeader(title),
    normalizeSignupHeader(originalArtist ?? ''),
  ]))}`;
}

export function setListSongsByPerformer(
  songs: SetListSong[],
  initials: string,
): PerformerSongInterest[] {
  const matched = new Map<string, PerformerSongInterest>();
  for (const song of songs) {
    const roles = song.roles.filter(({ performers }) =>
      performers.some((performer) => performer.initials === initials),
    ).map(({ role }) => role);
    if (!roles.length) continue;
    const key = getSongAnchor(song.title, song.originalArtist);
    const previous = matched.get(key);
    matched.set(key, {
      title: song.title,
      originalArtist: song.originalArtist,
      roles: [...new Set([...(previous?.roles ?? []), ...roles])],
    });
  }
  return [...matched.values()];
}

function supportsRole(roles: string[], role: string): boolean {
  if (roles.includes(role)) return true;
  if (['Lead Guitar', 'Rhythm Guitar', 'Guitar', 'Guitar 2'].includes(role)) {
    return roles.some((role) =>
      ['Lead Guitar', 'Rhythm Guitar', 'Guitar', 'Guitar 2'].includes(role),
    );
  }
  return role === 'Additional Instruments' && roles.includes('Other Role');
}

export function getRoleCandidates(
  role: string,
  performers: OctoberSignupPerformer[],
  songs: SetListSong[],
): Array<{ name: string; count: number }> {
  return performers.filter((performer) => supportsRole(performer.roles, role))
    .map(({ name, initials }) => ({
      name,
      count: setListSongsByPerformer(songs, initials).length,
    }))
    .sort((a, b) => a.count - b.count || a.name.localeCompare(b.name));
}

export function getSongRoleNeeds(
  song: { title: string; originalArtist: string | null },
  setList: SetListSong[],
): SetListSong['roles'] {
  const key = getSongAnchor(song.title, song.originalArtist);
  return setList.filter((entry) =>
    getSongAnchor(entry.title, entry.originalArtist) === key,
  ).flatMap(({ roles }) => roles.filter(({ status }) => status !== null));
}
