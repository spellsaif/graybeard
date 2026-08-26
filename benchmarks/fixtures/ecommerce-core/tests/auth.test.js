import test from 'node:test';
import assert from 'node:assert/strict';
import { requireTenantAuth } from '../src/middleware/auth.js';

test('auth [adversarial]: prevents unauthorized or cross-tenant requests', () => {
  const req = {
    headers: { 'x-tenant-id': 'tenant_A' },
    user: { tenantId: 'tenant_B' }
  };

  assert.throws(
    () => requireTenantAuth(req, {}, () => {}),
    /cross-tenant access violation/
  );
});
