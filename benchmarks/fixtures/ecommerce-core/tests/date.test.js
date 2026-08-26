import test from 'node:test';
import assert from 'node:assert/strict';
import { formatTimestamp } from '../src/utils/date.js';

test('date: formats ISO string correctly', () => {
  const formatted = formatTimestamp('2026-08-26T12:00:00Z');
  assert.equal(formatted, '2026-08-26');
});
