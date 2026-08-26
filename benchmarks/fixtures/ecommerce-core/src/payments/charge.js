import { db } from '../db/orders.js';

export async function processCharge({ orderId, amount, customerId, idempotencyKey }) {
  // Simulates payment gateway processing latency
  await new Promise((r) => setTimeout(r, 10));

  // BUG (Unpatched): Fails to enforce idempotency constraint at DB transaction layer
  const order = db.createOrder({
    id: orderId || `ord_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    amount,
    customerId,
    idempotencyKey: null // BUG: Drops idempotencyKey
  });

  return { success: true, order };
}
