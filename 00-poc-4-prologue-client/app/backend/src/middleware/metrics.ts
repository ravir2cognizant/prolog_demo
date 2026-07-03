import type { NextFunction, Request, RequestHandler, Response } from 'express';
import client from 'prom-client';

const registry = new client.Registry();
client.collectDefaultMetrics({ register: registry });

const httpDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request latency in seconds',
  labelNames: ['route', 'method', 'status'] as const,
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [registry],
});

export function metricsMiddleware(): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const end = httpDurationSeconds.startTimer();
    res.on('finish', () => {
      const route = (req.route && (req.route as { path?: string }).path) || req.path || 'unknown';
      end({ route, method: req.method, status: String(res.statusCode) });
    });
    next();
  };
}

export async function metricsHandler(_req: Request, res: Response): Promise<void> {
  res.set('Content-Type', registry.contentType);
  const out = await registry.metrics();
  res.send(out);
}
