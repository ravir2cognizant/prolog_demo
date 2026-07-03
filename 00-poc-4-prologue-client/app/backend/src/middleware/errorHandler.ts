import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { logger } from '../config/logger.js';
import { AppError } from '../util/errors.js';

/**
 * Central error handler. Converts AppError + ZodError + unknown into the BFF
 * error envelope { error, field? } expected by ED-001..008 and the FE.
 *
 * Note: Express requires the (err, req, res, next) 4-arg signature; `next`
 * is unused but must remain to register as an error handler.
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    const first = err.issues[0];
    const field = first?.path?.join('.') || undefined;
    const message = first?.message ?? 'Validation failure';
    logger.warn(
      { event: 'http.zod_validation', path: req.path, field, message },
      'Zod validation failed',
    );
    res.status(400).json({ error: message, field });
    return;
  }
  if (err instanceof AppError) {
    const body: { error: string; field?: string } = { error: err.message };
    if (err.field) body.field = err.field;
    if (err.status >= 500) {
      logger.error({ event: 'http.app_error', status: err.status, path: req.path }, err.message);
    } else {
      logger.warn({ event: 'http.app_error', status: err.status, path: req.path }, err.message);
    }
    res.status(err.status).json(body);
    return;
  }
  const message = err instanceof Error ? err.message : 'Internal server error';
  logger.error({ event: 'http.unhandled', path: req.path, err: message }, 'Unhandled error');
  res.status(500).json({ error: 'Internal server error' });
}
