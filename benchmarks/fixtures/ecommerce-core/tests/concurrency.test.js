import test from 'node:test';
import assert from 'node:assert/strict';
import { db } from '../src/db/orders.js';
import { processCharge } from '../src/payments/charge.js';

test('concurrency [adversarial]: prevents duplicate orders across concurrent requests with identical idempotencyKey', async () => {
  db.reset();
  const idempotencyKey = 'idemp_key_race_999';

  // Fire 5 concurrent requests with identical idempotencyKey
  const promises = Array.from({ length: 5 }).map((_, i) =>
    processCharge({
      orderId: `ord_concurrent_${i}`,
      amount: 10000,
      customerId: 'cust_race',
      idempotencyKey
    }).catch(err => ({ error: err.message }))
  );

  const results = await Promise.all(promises);

  // Invariant: At most 1 order can exist in DB for this idempotencyKey
  const orders = db.getAll().filter(o => o.idempotencyKey === idempotencyKey);
  assert.equal(orders.length, 1, `Invariant Violation: expected 1 order, found ${orders.length}`);
});
