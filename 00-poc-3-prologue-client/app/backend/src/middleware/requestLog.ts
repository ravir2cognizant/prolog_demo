import type { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger.js';

export function requestLog(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  res.on('finish', () => {
    logger.info({ method: req.method, path: req.path, status: res.statusCode, ms: Date.now() - start }, 'request');
  });
  next();
}
