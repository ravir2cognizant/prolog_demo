import type { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';
import type { Principal } from '../domain/types.js';
import { AppError } from '../util/errors.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: Principal;
    }
  }
}

const DEV_PRINCIPAL: Principal = {
  sub: 'dev-user-001',
  roles: [
    'gl-accountant',
    'gl-supervisor',
    'gl-administrator',
    'finance-administrator',
    'finance-manager',
    'finance-reporting-manager',
    'group-finance-manager',
  ],
};

export async function authn(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    if (env.AUTH_DEV_BYPASS) {
      req.user = DEV_PRINCIPAL;
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError(401, 'UNAUTHORIZED', 'Missing Bearer token');
    }

    const token = authHeader.slice(7);
    if (!env.JWKS_URI) {
      throw new AppError(401, 'UNAUTHORIZED', 'JWKS_URI not configured');
    }

    const { createRemoteJWKSet, jwtVerify } = await import('jose');
    const JWKS = createRemoteJWKSet(new URL(env.JWKS_URI));
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: env.JWT_ISSUER || undefined,
      audience: env.JWT_AUDIENCE || undefined,
    });

    req.user = {
      sub: String(payload.sub ?? ''),
      roles: Array.isArray(payload['roles']) ? (payload['roles'] as string[]) : [],
    };
    next();
  } catch (err) {
    if (err instanceof AppError) {
      next(err);
    } else {
      next(new AppError(401, 'UNAUTHORIZED', 'Token validation failed'));
    }
  }
}

export function principal(req: Request): Principal {
  if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Not authenticated');
  return req.user;
}

export function requireRole(roles: string[]): (req: Request, res: Response, next: NextFunction) => void {
  return (req, _res, next) => {
    const p = req.user;
    if (!p || !roles.some((r) => p.roles.includes(r))) {
      return next(new AppError(403, 'FORBIDDEN', `Required role: ${roles.join(' or ')}`));
    }
    next();
  };
}
