import { Registry, collectDefaultMetrics, Histogram } from 'prom-client';
import type { Request, Response, NextFunction } from 'express';

export const register = new Registry();
collectDefaultMetrics({ register });

const httpDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['route', 'method', 'status'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [register],
});

export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const duration = Number(process.hrtime.bigint() - start) / 1e9;
    httpDuration.observe(
      { route: req.route?.path ?? req.path, method: req.method, status: String(res.statusCode) },
      duration,
    );
  });
  next();
}
