// In-memory transactional order store
const orders = new Map();
const idempotencyKeys = new Set();

export const db = {
  reset() {
    orders.clear();
    idempotencyKeys.clear();
  },

  getAll() {
    return Array.from(orders.values());
  },

  getById(id) {
    return orders.get(id) || null;
  },

  // Inserts order with unique idempotency check
  createOrder({ id, amount, customerId, idempotencyKey }) {
    if (idempotencyKey) {
      if (idempotencyKeys.has(idempotencyKey)) {
        const err = new Error(`Unique constraint violation: idempotency_key '${idempotencyKey}' already exists`);
        err.code = 'SQLITE_CONSTRAINT_UNIQUE';
        throw err;
      }
      idempotencyKeys.add(idempotencyKey);
    }

    const order = { id, amount, customerId, idempotencyKey, createdAt: new Date().toISOString() };
    orders.set(id, order);
    return order;
  }
};
