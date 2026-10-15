import {
  getSongAnchor,
  OCTOBER_PRACTICE_DAYS,
  OCTOBER_PRACTICE_SLOTS,
  projectOctoberSetList,
  type OctoberPracticeDifficulty,
  type OctoberPracticeDay,
  type OctoberPracticeSession,
  type OctoberPracticeSlot,
  type SetListSong,
} from './october-set-list';
import {
  normalizeSignupHeader,
  type OctoberSignupPerformer,
} from './october-signup';

export function octoberAlwaysPresentPerformers(
  performers: OctoberSignupPerformer[],
) {
  return performers.filter(({ name }) => {
    const firstName = normalizeSignupHeader(name).split(' ')[0];
    return firstName === 'donald' || firstName === 'randal';
  });
}

export function octoberPracticeColumn(headers: string[]): number | null {
  const columns = headers.flatMap((header, column) =>
    normalizeSignupHeader(header) === 'practice' ? [column] : [],
  );
  return columns.length === 1 ? columns[0] : null;
}

export const OCTOBER_PRACTICE_SLOT_SCHEDULE = {
  Early: {
    label: '7:30–8:00 p.m.',
    startTime: '193000',
    endTime: '200000',
  },
  Late: {
    label: '8:00–10:30 p.m.',
    startTime: '200000',
    endTime: '223000',
  },
} satisfies Record<
  OctoberPracticeSlot,
  { label: string; startTime: string; endTime: string }
>;

const OCTOBER_PRACTICE_DATES: Record<OctoberPracticeDay, string> = {
  Monday: '20261019',
  Thursday: '20261022',
};

export function octoberPracticeCalendarUrl(
  day: OctoberPracticeDay,
  slot: OctoberPracticeSlot,
): string {
  return `/event-planning/practice/calendar/${day.toLowerCase()}-${slot.toLowerCase()}.ics`;
}

export function octoberPracticeCalendarIcs(
  day: OctoberPracticeDay,
  slot: OctoberPracticeSlot,
): string {
  const date = OCTOBER_PRACTICE_DATES[day];
  const { startTime, endTime } = OCTOBER_PRACTICE_SLOT_SCHEDULE[slot];
  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
  const escapeText = (value: string) =>
    value
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\r?\n/g, '\\n');
  const location = escapeText(
    'Stage One Studios, 23092 Terra Dr, Laguna Hills, CA 92653',
  );
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ABK Open Mic//Practice Sessions//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VTIMEZONE',
    'TZID:America/Los_Angeles',
    'X-LIC-LOCATION:America/Los_Angeles',
    'BEGIN:DAYLIGHT',
    'TZOFFSETFROM:-0800',
    'TZOFFSETTO:-0700',
    'TZNAME:PDT',
    'DTSTART:19700308T020000',
    'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU',
    'END:DAYLIGHT',
    'BEGIN:STANDARD',
    'TZOFFSETFROM:-0700',
    'TZOFFSETTO:-0800',
    'TZNAME:PST',
    'DTSTART:19701101T020000',
    'RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU',
    'END:STANDARD',
    'END:VTIMEZONE',
    'BEGIN:VEVENT',
    `UID:${date}-${slot.toLowerCase()}@abk-open-mic`,
    `DTSTAMP:${stamp}`,
    `DTSTART;TZID=America/Los_Angeles:${date}T${startTime}`,
    `DTEND;TZID=America/Los_Angeles:${date}T${endTime}`,
    `SUMMARY:${escapeText(`ABK Open Mic Practice - ${day} ${slot}`)}`,
    `LOCATION:${location}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return `${lines.join('\r\n')}\r\n`;
}

export function isPracticeDone(value: string): boolean {
  return normalizeSignupHeader(value) === 'done!';
}

function practiceDay(value: string): OctoberPracticeDay | null {
  const normalized = normalizeSignupHeader(value);
  if (normalized === 'monday' || normalized === 'mon') return 'Monday';
  if (
    normalized === 'thursday' ||
    normalized === 'thu' ||
    normalized === 'thurs'
  ) {
    return 'Thursday';
  }
  return null;
}

function practiceSlot(value: string): OctoberPracticeSlot | null {
  const normalized = normalizeSignupHeader(value);
  if (normalized === 'early' || normalized === 'early session') return 'Early';
  if (normalized === 'late' || normalized === 'late session') return 'Late';
  return null;
}

function practiceAssignment(value: string): {
  day: OctoberPracticeDay;
  slot: OctoberPracticeSlot;
  difficulty: OctoberPracticeDifficulty;
} | null {
  const match =
    /^(mon(?:day)?|thu(?:rs(?:day)?)?)\s+(early|late)\s*-\s*(low|medium|high)$/.exec(
      normalizeSignupHeader(value),
    );
  if (!match) return null;
  const day = practiceDay(match[1]);
  const slot = practiceSlot(match[2]);
  if (!day || !slot) return null;
  const difficulty = match[3][0].toUpperCase() + match[3].slice(1);
  return { day, slot, difficulty: difficulty as OctoberPracticeDifficulty };
}

export function sanitizeOctoberPracticeValue(value: string): string {
  if (isPracticeDone(value)) return 'Done!';
  const assignment = practiceAssignment(value);
  return assignment
    ? `${assignment.day} ${assignment.slot} - ${assignment.difficulty}`
    : '';
}

export function projectOctoberPracticeSongs(
  headers: string[],
  rows: string[][],
  performers: OctoberSignupPerformer[],
): SetListSong[] | null {
  const column = octoberPracticeColumn(headers);
  if (column === null) return null;
  const { songs } = projectOctoberSetList(headers, rows, performers);
  const completed = new Set(
    songs.flatMap((song, index) =>
      isPracticeDone(rows[index][column] ?? '')
        ? [getSongAnchor(song.title, song.originalArtist)]
        : [],
    ),
  );
  return songs.filter(
    (song) => !completed.has(getSongAnchor(song.title, song.originalArtist)),
  );
}

export function projectOctoberPracticeSessions(
  headers: string[],
  rows: string[][],
  performers: OctoberSignupPerformer[],
): OctoberPracticeSession[] | null {
  const column = octoberPracticeColumn(headers);
  if (column === null) return null;

  const { songs } = projectOctoberSetList(headers, rows, performers);
  const completed = new Set(
    songs.flatMap((song, index) =>
      isPracticeDone(rows[index]?.[column] ?? '')
        ? [getSongAnchor(song.title, song.originalArtist)]
        : [],
    ),
  );
  const groups = new Map<string, OctoberPracticeSession['songs']>(
    OCTOBER_PRACTICE_DAYS.flatMap((day) =>
      OCTOBER_PRACTICE_SLOTS.map((slot) => [`${day}:${slot}`, []]),
    ),
  );

  for (const [index, song] of songs.entries()) {
    if (completed.has(getSongAnchor(song.title, song.originalArtist))) continue;
    const row = rows[index] ?? [];
    const assignment = practiceAssignment(row[column] ?? '');
    if (!assignment) return null;
    groups.get(`${assignment.day}:${assignment.slot}`)!.push({
      ...song,
      difficulty: assignment.difficulty,
    });
  }

  return OCTOBER_PRACTICE_DAYS.flatMap((day) =>
    OCTOBER_PRACTICE_SLOTS.map((slot) => ({
      day,
      slot,
      songs: groups.get(`${day}:${slot}`)!,
    })),
  );
}
