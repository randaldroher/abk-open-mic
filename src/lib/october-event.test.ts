import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildOctoberEventIcs,
  escapeIcsText,
  foldIcsLine,
} from './october-event';

test('calendar invite uses UTC times for 6:00–7:30 p.m. Pacific on October 25', () => {
  const ics = buildOctoberEventIcs();

  assert.ok(ics.includes('\r\nDTSTART:20261026T010000Z\r\n'));
  assert.ok(ics.includes('\r\nDTEND:20261026T023000Z\r\n'));
  assert.ok(ics.includes('\r\nSUMMARY:ABK Open Mic: Spooky Edition\r\n'));
  assert.ok(
    ics.includes(
      '\r\nLOCATION:Blizzard Theater\\, 1 Blizzard Way\\, Irvine\\, CA 92618\r\n',
    ),
  );
  assert.ok(ics.startsWith('BEGIN:VCALENDAR\r\n'));
  assert.ok(ics.endsWith('END:VCALENDAR\r\n'));
  assert.equal(ics, buildOctoberEventIcs());
});

test('calendar invite lines stay within 75 octets', () => {
  const encoder = new TextEncoder();
  for (const line of buildOctoberEventIcs().split('\r\n')) {
    assert.ok(encoder.encode(line).length <= 75, line);
  }
});

test('calendar text escapes separators and folds long lines', () => {
  assert.equal(escapeIcsText('a,b;c\\d\ne'), 'a\\,b\\;c\\\\d\\ne');

  const folded = foldIcsLine(`DESCRIPTION:${'x'.repeat(100)}`);
  const [first, second] = folded.split('\r\n');
  assert.equal(first.length, 75);
  assert.ok(second.startsWith(' '));
  assert.equal(folded.replace(/\r\n /g, ''), `DESCRIPTION:${'x'.repeat(100)}`);
});
