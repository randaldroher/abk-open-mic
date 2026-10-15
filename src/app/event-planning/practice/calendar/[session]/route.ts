import { octoberPracticeCalendarIcs } from '../../../../../lib/october-practice';
import {
  OCTOBER_PRACTICE_DAYS,
  OCTOBER_PRACTICE_SLOTS,
} from '../../../../../lib/october-set-list';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ session: string }> },
) {
  const { session } = await params;
  const filename = session.toLowerCase();
  const day = OCTOBER_PRACTICE_DAYS.find((candidate) =>
    filename.startsWith(`${candidate.toLowerCase()}-`),
  );
  if (!day) return new Response('Not Found', { status: 404 });

  const slot = OCTOBER_PRACTICE_SLOTS.find(
    (candidate) =>
      filename === `${day.toLowerCase()}-${candidate.toLowerCase()}.ics`,
  );
  if (!slot) return new Response('Not Found', { status: 404 });

  return new Response(octoberPracticeCalendarIcs(day, slot), {
    headers: {
      'Content-Disposition': `attachment; filename="abk-open-mic-${day.toLowerCase()}-${slot.toLowerCase()}.ics"`,
      'Content-Type': 'text/calendar; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
