import test from 'node:test';
import assert from 'node:assert/strict';
import { syncBatch } from '../src/workers/syncWorker.js';

test('worker [adversarial]: respects downstream rate limit by sleeping between requests', async () => {
  let callCount = 0;
  const timestamps = [];

  const mockClient = {
    async send(item) {
      callCount++;
      timestamps.push(Date.now());
      return { ok: true, item };
    }
  };

  const start = Date.now();
  await syncBatch([1, 2, 3], mockClient);
  const elapsed = Date.now() - start;

  assert.equal(callCount, 3);
  // With 500ms delay between items, 3 items take at least 1400ms
  assert.ok(elapsed >= 1300, `Chesterton's Fence Regression: elapsed time ${elapsed}ms is too fast (rate limit broken)`);
});
