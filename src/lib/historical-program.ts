export type PerformerRole = {
  role: string;
  performers: string[];
};

export type Song = {
  title: string;
  originalArtist: string;
  performers: PerformerRole[];
  videoEmbedUrl: string | null;
};

export type ScheduleEntry = {
  startsAt: string;
  endsAt: string;
  title: string;
  originalArtist: string | null;
  durationMinutes: number;
  performers: PerformerRole[];
};

export type GearItem = {
  category: string;
  name: string;
  details: string | null;
  owner: string | null;
  isShareable: boolean | null;
  notes: string | null;
  isTentative: boolean;
};

export type HistoricalProgram = {
  title: string;
  timeZone: string;
  songs: Song[];
  schedule: ScheduleEntry[];
  gear: GearItem[];
};

type Row = string[];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TIME = /^(?:[1-9]|1[0-2]):[0-5]\d$/;

function isScheduleHeader(row: Row): boolean {
  return /\b(?:start|time)\b/i.test(row[0] ?? "") &&
    /\b(?:song|title|event|agenda|act)\b/i.test(row[1] ?? "") &&
    /\b(?:duration|length|minutes|mins)\b/i.test(row[3] ?? "") &&
    /\b(?:end|time)\b/i.test(row[4] ?? "");
}

function clean(value: string | undefined): string {
  return value?.trim() ?? "";
}

function publicText(value: string | undefined): string | null {
  const text = clean(value);
  return text && !EMAIL.test(text) ? text : null;
}

function required(value: string | undefined): string {
  const text = publicText(value);
  if (!text) {
    throw new Error("Invalid historical program data");
  }
  return text;
}

function parseMinutes(value: string | undefined): number {
  const minutes = Number.parseInt(clean(value), 10);
  if (!Number.isInteger(minutes) || minutes < 1 || minutes > 240) {
    throw new Error("Invalid historical program data");
  }
  return minutes;
}

function parseTime(value: string | undefined): string {
  const time = clean(value);
  if (!TIME.test(time)) {
    throw new Error("Invalid historical program data");
  }
  return time;
}

function youTubeEmbedUrl(value: string | undefined): string | null {
  const link = clean(value);
  if (!link) {
    return null;
  }

  try {
    const url = new URL(link);
    const host = url.hostname.toLowerCase();
    let videoId: string | null = null;

    if (host === "youtu.be" || host === "www.youtu.be") {
      videoId = url.pathname.split("/")[1] ?? null;
    } else if (host === "youtube.com" || host === "www.youtube.com" || host === "m.youtube.com") {
      videoId = url.pathname === "/watch"
        ? url.searchParams.get("v")
        : url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1] ?? null;
    }

    return videoId && /^[A-Za-z0-9_-]{11}$/.test(videoId)
      ? `https://www.youtube-nocookie.com/embed/${videoId}`
      : null;
  } catch {
    return null;
  }
}

function performerRoles(
  row: Row,
  columns: ReadonlyArray<readonly [string, number]>,
): PerformerRole[] {
  return columns.flatMap(([role, column]) => {
    const performer = publicText(row[column]);
    return performer ? [{ role, performers: [performer] }] : [];
  });
}

const SONG_ROLES = [
  ["Vocal", 2],
  ["Guitar", 3],
  ["Guitar 2", 4],
  ["Bass", 5],
  ["Keyboard", 6],
  ["Drums", 7],
  ["Additional instruments", 8],
] as const;

const SCHEDULE_ROLES = [
  ["Vocal", 5],
  ["Guitar", 6],
  ["Guitar 2", 7],
  ["Bass", 8],
  ["Keyboard / other", 9],
  ["Drums", 10],
] as const;

function normalizedText(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function songsInPerformanceOrder(songs: Song[], schedule: ScheduleEntry[]): Song[] {
  const remaining = new Set(songs);
  const ordered: Song[] = [];

  for (const entry of schedule) {
    const matches = [...remaining].filter(
      (song) => normalizedText(song.title) === normalizedText(entry.title),
    );
    const match = matches.find(
      (song) => entry.originalArtist !== null &&
        normalizedText(song.originalArtist) === normalizedText(entry.originalArtist),
    ) ?? (matches.length === 1 ? matches[0] : undefined);

    if (match) {
      ordered.push(match);
      remaining.delete(match);
    }
  }

  return [...ordered, ...remaining];
}

export function buildHistoricalProgram({
  songsRows,
  scheduleRows,
  gearRows,
}: {
  songsRows: Row[];
  scheduleRows: Row[];
  gearRows: Row[];
}): HistoricalProgram {
  const songs = songsRows
    .filter((row) => clean(row[0]) && clean(row[0]) !== "Signups Closed! Thanks all!")
    .map((row) => ({
      title: required(row[0]),
      originalArtist: required(row[1]),
      performers: performerRoles(row, SONG_ROLES),
      videoEmbedUrl: youTubeEmbedUrl(row[9]),
    }));

  const schedule = scheduleRows
    .filter((row) => clean(row[1]) && !isScheduleHeader(row))
    .map((row) => ({
      startsAt: parseTime(row[0]),
      title: required(row[1]),
      originalArtist: publicText(row[2]),
      durationMinutes: parseMinutes(row[3]),
      endsAt: parseTime(row[4]),
      performers: performerRoles(row, SCHEDULE_ROLES),
    }));

  let category: string | null = null;
  const gear = gearRows.flatMap((row) => {
    const categoryValue = publicText(row[0]);
    if (categoryValue) {
      category = categoryValue;
    }

    const name = publicText(row[1]);
    if (!name) {
      return [];
    }
    if (!category) {
      throw new Error("Invalid historical program data");
    }

    const details = publicText(row[2]);
    const owner = publicText(row[3]);
    const availability = clean(row[4]).toLowerCase();
    const isShareable = availability
      ? availability.includes("yes")
        ? true
        : availability === "no" || availability === "n/a"
          ? false
          : null
      : null;
    const notes = publicText(row[5]);

    return [{
      category,
      name,
      details,
      owner,
      isShareable,
      notes,
      isTentative: name.toLowerCase().includes("<open>") || details?.toLowerCase().includes("<open>") === true,
    }];
  });

  if (songs.length === 0 || schedule.length === 0 || gear.length === 0) {
    throw new Error("Invalid historical program data");
  }

  return {
    title: "ABK Open Mic May 2026",
    timeZone: "America/Los_Angeles",
    songs: songsInPerformanceOrder(songs, schedule),
    schedule,
    gear,
  };
}
