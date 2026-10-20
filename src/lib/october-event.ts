export const OCTOBER_EVENT = {
  title: 'ABK Open Mic: Spooky Edition',
  dateLabel: 'Sunday, October 25',
  timeLabel: '6:00 – 7:30 PM',
  // 6:00–7:30 p.m. Pacific Daylight Time on Sunday, October 25, 2026.
  start: '2026-10-25T18:00:00-07:00',
  end: '2026-10-25T19:30:00-07:00',
  venue: 'Blizzard Theater',
  campus: 'Blizzard Irvine Campus',
  streetAddress: '1 Blizzard Way',
  locality: 'Irvine, CA 92618',
  description:
    'Join us for the ABK Open Mic: Spooky Edition at the Blizzard Theater on the Blizzard Irvine campus.',
  calendarHref: '/abk-open-mic-october-2026.ics',
  calendarFileName: 'abk-open-mic-october-2026.ics',
  uid: 'abk-open-mic-2026-10-25@abk-open-mic',
  // Fixed so the invite is deterministic and can be prerendered.
  stamp: '2026-10-20T00:00:00Z',
} as const;

export const OCTOBER_EVENT_LOCATION = `${OCTOBER_EVENT.venue}, ${OCTOBER_EVENT.streetAddress}, ${OCTOBER_EVENT.locality}`;

function formatUtc(value: string): string {
  return new Date(value).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

export function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/([,;])/g, '\\$1');
}

// RFC 5545 limits content lines to 75 octets; continuation lines start with a space.
export function foldIcsLine(line: string): string {
  const encoder = new TextEncoder();
  const parts: string[] = [];
  let current = '';
  let limit = 75;

  for (const character of line) {
    if (encoder.encode(current + character).length > limit) {
      parts.push(current);
      current = character;
      limit = 74;
    } else {
      current += character;
    }
  }
  parts.push(current);

  return parts.join('\r\n ');
}

export function buildOctoberEventIcs(): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ABK Open Mic//October 2026//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${OCTOBER_EVENT.uid}`,
    `DTSTAMP:${formatUtc(OCTOBER_EVENT.stamp)}`,
    `DTSTART:${formatUtc(OCTOBER_EVENT.start)}`,
    `DTEND:${formatUtc(OCTOBER_EVENT.end)}`,
    `SUMMARY:${escapeIcsText(OCTOBER_EVENT.title)}`,
    `LOCATION:${escapeIcsText(OCTOBER_EVENT_LOCATION)}`,
    `DESCRIPTION:${escapeIcsText(OCTOBER_EVENT.description)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return `${lines.map(foldIcsLine).join('\r\n')}\r\n`;
}
