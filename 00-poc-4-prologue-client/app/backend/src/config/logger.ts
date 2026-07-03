import { pino } from 'pino';
import { env } from './env.js';

/**
 * Pino logger with PII redaction.
 * Never log Authorization, Cookie, email, displayName, textContent, htmlContent.
 * Only named placeholders -- no string interpolation in log messages.
 */
export const logger = pino({
  level: env.LOG_LEVEL,
  redact: {
    paths: [
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
    ],
    censor: '[REDACTED]',
  },
  base: { service: 'prologue-bff' },
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});
