import { createPerformerNameFormatter } from './performer-names';

export type PastEventSong = {
  title: string;
  originalArtist: string | null;
  performers: Array<{ role: string; name: string }>;
};

const ROLE_HEADERS = new Map([
  ["vocal", "Vocal"],
  ["vocals", "Vocal"],
  ["singer", "Vocal"],
  ["guitar", "Guitar"],
  ["guitar 2", "Guitar 2"],
  ["bass", "Bass"],
  ["keyboard", "Keyboard"],
  ["keyboards", "Keyboard"],
  ["drum", "Drums"],
  ["drums", "Drums"],
  ["additional instruments", "Additional instruments"],
  ["other instruments", "Additional instruments"],
]);
const EMAIL = /\b[^\s@]+@[^\s@]+\.[^\s@]+\b/;

export function normalizeSheetHeader(value: string): string {
  return value.normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase();
}

export function pastEventSongColumns(headers: string[]): number[] {
  const songColumn = headers.findIndex((header) =>
    ["song", "song title", "title"].includes(normalizeSheetHeader(header)),
  );
  if (songColumn < 0) {
    throw new Error("Invalid past event song data");
  }

  const artistColumn = headers.findIndex((header) =>
    ["artist", "original artist"].includes(normalizeSheetHeader(header)),
  );
  const roleColumns = headers.flatMap((header, column) =>
    ROLE_HEADERS.has(normalizeSheetHeader(header)) ? [column] : [],
  );
  return [...new Set([songColumn, ...(artistColumn < 0 ? [] : [artistColumn]), ...roleColumns])];
}

function publicCell(value: string | undefined): string | null {
  const text = value?.trim();
  if (!text || EMAIL.test(text) || /^<open>$/i.test(text)) {
    return null;
  }
  return text;
}

export function projectPastEventSongs(headers: string[], rows: string[][]): PastEventSong[] {
  const publicColumns = pastEventSongColumns(headers);
  const songColumn = publicColumns[0];
  const artistColumn = headers.findIndex((header) =>
    ["artist", "original artist"].includes(normalizeSheetHeader(header)),
  );
  const roleColumns = headers.flatMap((header, column) => {
    const role = ROLE_HEADERS.get(normalizeSheetHeader(header));
    return role ? [{ column, role }] : [];
  });

  const songs: PastEventSong[] = [];
  for (const row of rows) {
    if (!row.some((cell) => cell.trim())) {
      break;
    }

    const title = publicCell(row[songColumn]);
    if (!title) {
      throw new Error("Invalid past event song data");
    }

    songs.push({
      title,
      originalArtist: artistColumn < 0 ? null : publicCell(row[artistColumn]),
      performers: roleColumns.flatMap(({ column, role }) => {
        const name = publicCell(row[column]);
        return name ? [{ role, name }] : [];
      }),
    });
  }

  if (songs.length === 0) {
    throw new Error("Invalid past event song data");
  }

  const displayName = createPerformerNameFormatter(
    songs.flatMap((song) => song.performers.map(({ name }) => name)),
  );
  return songs.map((song) => ({
    ...song,
    performers: song.performers.map((performer) => ({
      ...performer,
      name: displayName(performer.name),
    })),
  }));
}
