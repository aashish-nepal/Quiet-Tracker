import { HttpError } from '../utils/httpError.js';
import { env } from '../config/env.js';
import { verifyAuthToken } from '../services/authService.js';
import { getUserContext } from '../services/organizationService.js';

if (env.enableDemoAuth && env.nodeEnv === 'production') {
  throw new Error('ENABLE_DEMO_AUTH must not be true in production. Refusing to handle request.');
}

export async function resolveAuthContext(req, _res, next) {
  let userId = null;
  let tokenRole = null;
  let tokenOrgId = null;

  const authHeader = req.header('authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice('Bearer '.length).trim();
    const decoded = verifyAuthToken(token);
    userId = decoded.sub;
    tokenRole = decoded.role;
    tokenOrgId = decoded.orgId;
  } else if (env.enableDemoAuth) {
    // Accept ONLY the x-user-id header in demo mode — never from body/query/params
    // to limit the attack surface if this flag is accidentally left enabled.
    userId = req.header('x-user-id') || null;
  }

  if (!userId) {
    throw new HttpError(401, 'Missing authentication context');
  }

  const context = await getUserContext(userId);
  req.userId = context.userId;
  req.organizationId = tokenOrgId || context.organizationId;
  req.role = tokenRole || context.role;
  req.auth = {
    userId: req.userId,
    organizationId: req.organizationId,
    role: req.role
  };

  next();
}

export function requireAuth(req, _res, next) {
  if (!req.userId) {
    throw new HttpError(401, 'Authentication required');
  }
  next();
}

export function requireRole(allowedRoles) {
  const allowed = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return (req, _res, next) => {
    if (!req.role || !allowed.includes(req.role)) {
      throw new HttpError(403, 'Insufficient permissions');
    }
    next();
  };
}
