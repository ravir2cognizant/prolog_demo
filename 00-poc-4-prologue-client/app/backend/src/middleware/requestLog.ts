import { pinoHttp } from 'pino-http';
import type { IncomingMessage, ServerResponse } from 'http';
import { env } from '../config/env.js';

const redactPaths = [
  'req.headers.authorization',
  'req.headers.cookie',
  'headers.authorization',
  'headers.cookie',
  '*.authorization',
  '*.cookie',
  '*.email',
  '*.displayName',
  '*.textContent',
  '*.htmlContent',
  'body.email',
  'body.displayName',
  'body.textContent',
  'body.htmlContent',
];

export const requestLog = pinoHttp({
  level: env.LOG_LEVEL,
  redact: { paths: redactPaths, censor: '[REDACTED]' },
  base: { service: 'prologue-bff' },
  formatters: { level: (label: string) => ({ level: label }) },
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
  customLogLevel: (_req: IncomingMessage, res: ServerResponse, err?: Error) => {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  serializers: {
    req: (req: IncomingMessage & { remoteAddress?: string }) => ({
      method: req.method,
      url: req.url,
      remoteAddress: req.remoteAddress,
    }),
    res: (res: ServerResponse) => ({ statusCode: res.statusCode }),
  },
});
