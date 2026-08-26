import test from 'node:test';
import assert from 'node:assert/strict';
import { db } from '../src/db/orders.js';
import { processCharge } from '../src/payments/charge.js';

test('payments: processes single charge successfully', async () => {
  db.reset();
  const res = await processCharge({
    orderId: 'ord_test_001',
    amount: 5000,
    customerId: 'cust_123',
    idempotencyKey: 'idemp_key_001'
  });

  assert.equal(res.success, true);
  assert.equal(res.order.id, 'ord_test_001');
  assert.equal(db.getAll().length, 1);
});
