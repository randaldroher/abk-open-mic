export type OctoberSignupSong = {
  title: string;
  originalArtist: string | null;
  interestedPerformers: Array<{ name: string; roles: string[] }>;
  videoId: string | null;
};

export type OctoberSignupPerformer = {
  name: string;
  initials: string;
  roles: string[];
  genres: string;
};

function compareAlphabetically(left: string, right: string): number {
  return left.localeCompare(right, 'en', { sensitivity: 'base' });
}

export function sortSongsByOriginalArtist(
  songs: OctoberSignupSong[],
): OctoberSignupSong[] {
  return [...songs].sort((left, right) => {
    if (left.originalArtist === null && right.originalArtist !== null) {
      return 1;
    }
    if (left.originalArtist !== null && right.originalArtist === null) {
      return -1;
    }
    if (left.originalArtist && right.originalArtist) {
      const artistOrder = compareAlphabetically(
        left.originalArtist,
        right.originalArtist,
      );
      if (artistOrder !== 0) {
        return artistOrder;
      }
    }
    return compareAlphabetically(left.title, right.title);
  });
}

export function sortPerformersByInitials(
  performers: OctoberSignupPerformer[],
): OctoberSignupPerformer[] {
  return [...performers].sort((left, right) =>
    compareAlphabetically(left.initials, right.initials),
  );
}

const SONG_HEADERS = ['song', 'song title', 'title'];
const ARTIST_HEADERS = ['artist', 'original artist', 'orginal artist'];
const NAME_HEADERS = ['name', 'performer name'];
const INITIALS_HEADERS = ['initials'];
const PERFORMER_ROLE_HEADERS = ['roles', 'role', 'instruments', 'instrument'];
const GENRE_HEADERS = ['genres', 'genre'];
const VIDEO_HEADERS = ['youtube link', 'youtube', 'video link'];
const SONG_ROLE_HEADERS = new Map([
  ['vocal', 'Vocal'],
  ['vocals', 'Vocal'],
  ['singer', 'Vocal'],
  ['lead guitar', 'Lead Guitar'],
  ['rhythm guitar', 'Rhythm Guitar'],
  ['guitar', 'Guitar'],
  ['guitar 2', 'Guitar 2'],
  ['bass', 'Bass'],
  ['keyboard', 'Keyboard'],
  ['keyboards', 'Keyboard'],
  ['keys', 'Keyboard'],
  ['drum', 'Drums'],
  ['drums', 'Drums'],
  ['other role', 'Other Role'],
  ['additional instruments', 'Additional Instruments'],
]);
const PERFORMER_ROLE_ALIASES = new Map([
  ['vocal', 'Vocal'],
  ['vocals', 'Vocal'],
  ['singer', 'Vocal'],
  ['lead guitar', 'Lead Guitar'],
  ['rhythm guitar', 'Rhythm Guitar'],
  ['guitar', 'Guitar'],
  ['guitar 2', 'Guitar 2'],
  ['bass', 'Bass'],
  ['keyboard', 'Keyboard'],
  ['keyboards', 'Keyboard'],
  ['keys', 'Keyboard'],
  ['piano', 'Keyboard'],
  ['drum', 'Drums'],
  ['drums', 'Drums'],
  ['percussion', 'Drums'],
  ['other', 'Other Role'],
  ['other role', 'Other Role'],
  ['additional instruments', 'Other Role'],
]);
const EMAIL = /\b[^\s@]+@[^\s@]+\.[^\s@]+\b/;

export function normalizeSignupHeader(value: string): string {
  return value.normalize('NFKC').trim().replace(/\s+/g, ' ').toLowerCase();
}

function findUniqueColumn(
  headers: string[],
  aliases: string[],
  errorMessage: string,
): number {
  const matches = headers.flatMap((header, index) =>
    aliases.includes(normalizeSignupHeader(header)) ? [index] : [],
  );
  if (matches.length !== 1) {
    throw new Error(errorMessage);
  }
  return matches[0];
}

export function octoberSignupSongColumns(headers: string[]): {
  song: number;
  artist: number | null;
  video: number | null;
  roles: Array<{ column: number; role: string }>;
} {
  const song = findUniqueColumn(
    headers,
    SONG_HEADERS,
    'Invalid October signup song headers',
  );
  const artistMatches = headers.flatMap((header, index) =>
    ARTIST_HEADERS.includes(normalizeSignupHeader(header)) ? [index] : [],
  );
  const videoMatches = headers.flatMap((header, index) =>
    VIDEO_HEADERS.includes(normalizeSignupHeader(header)) ? [index] : [],
  );
  const roles = headers.flatMap((header, column) => {
    const role = SONG_ROLE_HEADERS.get(normalizeSignupHeader(header));
    return role ? [{ column, role }] : [];
  });
  if (
    artistMatches.length > 1 ||
    videoMatches.length > 1 ||
    roles.length === 0
  ) {
    throw new Error('Invalid October signup song headers');
  }

  return {
    song,
    artist: artistMatches[0] ?? null,
    video: videoMatches[0] ?? null,
    roles,
  };
}

export function projectOctoberSignupSongs(
  headers: string[],
  rows: string[][],
  performerNamesByInitials: ReadonlyMap<string, string>,
  videoLinks: Array<string | null> = [],
): OctoberSignupSong[] {
  const columns = octoberSignupSongColumns(headers);
  const songs: OctoberSignupSong[] = [];

  for (const [rowIndex, row] of rows.entries()) {
    const title = row[columns.song]?.trim() ?? '';
    const artist =
      columns.artist === null ? '' : (row[columns.artist]?.trim() ?? '');
    if (!title) {
      if (artist || columns.roles.some(({ column }) => row[column]?.trim())) {
        throw new Error('Invalid October signup song rows');
      }
      continue;
    }

    if (EMAIL.test(title) || EMAIL.test(artist)) {
      throw new Error('Invalid October signup song rows');
    }

    const interestsByInitials = new Map<
      string,
      { name: string; roles: Set<string> }
    >();
    for (const { column, role } of columns.roles) {
      const seen = new Set<string>();
      const initialsInColumn = (row[column] ?? '')
        .split(/[,;\n|/&+\s]+/)
        .map((value) => value.trim().toUpperCase());
      for (const initials of initialsInColumn) {
        if (!/^[A-Z]+$/.test(initials) || seen.has(initials)) {
          continue;
        }
        const name = performerNamesByInitials.get(initials);
        if (!name) {
          continue;
        }
        seen.add(initials);
        const interest = interestsByInitials.get(initials) ?? {
          name,
          roles: new Set<string>(),
        };
        interest.roles.add(role);
        interestsByInitials.set(initials, interest);
      }
    }
    const interestedPerformers = [...interestsByInitials.values()].map(
      ({ name, roles }) => ({ name, roles: [...roles] }),
    );
    const videoId =
      columns.video === null
        ? null
        : getYouTubeVideoId(videoLinks[rowIndex] ?? row[columns.video] ?? '');

    songs.push({
      title,
      originalArtist: artist || null,
      interestedPerformers,
      videoId,
    });
  }

  if (songs.length === 0) {
    throw new Error('Invalid October signup song rows');
  }
  return songs;
}

export function octoberSignupPerformerColumns(headers: string[]): {
  name: number;
  initials: number;
  roles: number;
  genres: number;
} {
  return {
    name: findUniqueColumn(
      headers,
      NAME_HEADERS,
      'Invalid October performer headers',
    ),
    initials: findUniqueColumn(
      headers,
      INITIALS_HEADERS,
      'Invalid October performer headers',
    ),
    roles: findUniqueColumn(
      headers,
      PERFORMER_ROLE_HEADERS,
      'Invalid October performer headers',
    ),
    genres: findUniqueColumn(
      headers,
      GENRE_HEADERS,
      'Invalid October performer headers',
    ),
  };
}

export function projectOctoberSignupPerformers(
  headers: string[],
  rows: string[][],
): OctoberSignupPerformer[] {
  const columns = octoberSignupPerformerColumns(headers);
  const performers: OctoberSignupPerformer[] = [];
  const seen = new Set<string>();

  for (const row of rows) {
    const name = row[columns.name]?.trim() ?? '';
    const initials = row[columns.initials]?.trim().toUpperCase() ?? '';
    if (!name || EMAIL.test(name) || !initials) {
      continue;
    }
    if (!/^[A-Z]+$/.test(initials)) {
      continue;
    }
    if (seen.has(initials)) {
      continue;
    }
    seen.add(initials);

    const roles = (row[columns.roles] ?? '')
      .split(/[,;\n|/]+|\s+and\s+/i)
      .map((value) => PERFORMER_ROLE_ALIASES.get(normalizeSignupHeader(value)))
      .filter((role): role is string => role !== undefined);
    performers.push({
      name,
      initials,
      roles: [...new Set(roles)],
      genres: row[columns.genres] ?? '',
    });
  }

  if (performers.length === 0) {
    throw new Error('Invalid October performer data');
  }
  return performers;
}

export function getYouTubeVideoId(value: string): string | null {
  try {
    const url = new URL(value.trim());
    const host = url.hostname.toLowerCase();
    let videoId: string | null = null;

    if (host === 'youtu.be' || host === 'www.youtu.be') {
      videoId = url.pathname.split('/')[1] ?? null;
    } else if (
      ['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(host)
    ) {
      videoId =
        url.pathname === '/watch'
          ? url.searchParams.get('v')
          : (url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1] ?? null);
    }

    return videoId && /^[A-Za-z0-9_-]{11}$/.test(videoId) ? videoId : null;
  } catch {
    return null;
  }
}
