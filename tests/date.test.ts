import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatDate, getYear, groupByYear } from '../src/utils/date.ts';

test('publication dates use Shanghai time at the UTC day and year boundaries', () => {
  const midnight = new Date('2020-01-01T00:00:00+08:00');
  assert.equal(formatDate(midnight), '2020-01-01');
  assert.equal(getYear(midnight), 2020);
  assert.deepEqual([...groupByYear([{ data: { date: midnight } }]).keys()], [2020]);
});
