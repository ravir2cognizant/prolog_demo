import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { unauthorised } from '../util/errors.js';
import type { Principal } from '../domain/types.js';

declare module 'express-serve-static-core' {
  interface Request {
    principal?: Principal;
  }
}

/**
 * authn middleware -- Bearer JWT enforcement.
 *
 * In dev (AUTH_DEV_BYPASS=1, NODE_ENV != production), any `Authorization: Bearer ...`
 * header is accepted and a stub principal is attached. With no header, 401.
 *
 * Production validation (jose remote JWKS) is intentionally not wired in this POC --
 * the integration point is here, behind a clear `if (env.AUTH_DEV_BYPASS)` guard.
 */
export function authn(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.toLowerCase().startsWith('bearer ')) {
    logger.debug({ event: 'authn.missing_bearer', path: req.path }, 'No bearer token');
    return next(unauthorised());
  }

  if (env.AUTH_DEV_BYPASS) {
    req.principal = { userId: 'usr-001', displayName: 'Demo Accountant' };
    return next();
  }

  // Production path -- not implemented in POC. Reject explicitly so a
  // misconfigured deployment cannot silently accept unsigned tokens.
  logger.warn({ event: 'authn.prod_path_not_implemented' }, 'JWT verification path not wired');
  return next(unauthorised('Authentication backend not configured'));
}

/**
 * Extract the validated principal. Throws if called outside an authenticated route.
 */
export function principal(req: Request): Principal {
  if (!req.principal) {
    throw unauthorised();
  }
  return req.principal;
}
