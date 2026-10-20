import { buildOctoberEventIcs, OCTOBER_EVENT } from '@/lib/october-event';

export function GET() {
  return new Response(buildOctoberEventIcs(), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${OCTOBER_EVENT.calendarFileName}"`,
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
