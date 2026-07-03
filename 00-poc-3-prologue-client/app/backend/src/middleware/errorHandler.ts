import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../util/errors.js';
import { logger } from '../config/logger.js';

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  const problem = (status: number, body: Record<string, unknown>) => {
    res.status(status).setHeader('Content-Type', 'application/problem+json').json(body);
  };

  if (err instanceof ZodError) {
    const issues = err.errors.map((e) => ({ path: e.path.join('.'), message: e.message }));
    problem(400, {
      type: 'urn:prologue:error:validation',
      title: 'Validation Error',
      status: 400,
      code: 'VALIDATION_ERROR',
      detail: 'One or more fields failed validation',
      issues,
    });
    return;
  }

  if (err instanceof AppError) {
    const body: Record<string, unknown> = {
      type: `urn:prologue:error:${err.code.toLowerCase().replace(/_/g, '-')}`,
      title: err.code,
      status: err.status,
      code: err.code,
      detail: err.detail,
    };
    if (err.field) body['field'] = err.field;
    if (err.issues) body['issues'] = err.issues;
    if (err.extra) Object.assign(body, err.extra);
    problem(err.status, body);
    return;
  }

  logger.error({ err, path: req.path }, 'unhandled error');
  problem(500, {
    type: 'urn:prologue:error:internal-error',
    title: 'INTERNAL_ERROR',
    status: 500,
    code: 'INTERNAL_ERROR',
    detail: 'An unexpected error occurred',
  });
}
