import { buildApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { initTelemetry } from './config/otel.js';

initTelemetry();

const app = buildApp({ reseed: true });

const server = app.listen(env.PORT, () => {
  logger.info(
    { event: 'bff.listening', port: env.PORT, env: env.NODE_ENV },
    'BFF listening',
  );
});

function shutdown(signal: string): void {
  logger.info({ event: 'bff.shutdown', signal }, 'Shutting down');
  server.close(() => process.exit(0));
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
