export function requireTenantAuth(req, res, next) {
  const tenantId = req.headers?.['x-tenant-id'];
  const user = req.user;

  if (!tenantId || !user || user.tenantId !== tenantId) {
    const err = new Error('Forbidden: cross-tenant access violation');
    err.status = 403;
    throw err;
  }

  req.tenantId = tenantId;
  return next();
}
