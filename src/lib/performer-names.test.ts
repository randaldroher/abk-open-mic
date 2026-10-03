import assert from 'node:assert/strict';
import test from 'node:test';
import { createPerformerNameFormatter } from './performer-names';

test('uses first names and adds last initials only for repeated first names', () => {
  const displayName = createPerformerNameFormatter([
    'Alex Brown',
    'Alex Jones',
    'Jamie Young',
    'Taylor',
  ]);

  assert.equal(displayName('Alex Brown'), 'Alex B.');
  assert.equal(displayName('Alex Jones'), 'Alex J.');
  assert.equal(displayName('Jamie Young'), 'Jamie');
  assert.equal(displayName('Taylor'), 'Taylor');
});

test('treats whitespace and casing differences as the same performer name', () => {
  const displayName = createPerformerNameFormatter([
    '  alex   brown ',
    'Alex Jones',
  ]);

  assert.equal(displayName('ALEX BROWN'), 'alex B.');
  assert.equal(displayName('Alex Jones'), 'Alex J.');
});
