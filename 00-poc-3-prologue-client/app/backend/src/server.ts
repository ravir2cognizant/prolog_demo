import { initOtel } from './config/otel.js';
import { logger } from './config/logger.js';
import { seedStore } from './store/seed.js';

async function bootstrap() {
  await initOtel();
  seedStore();

  const { default: app } = await import('./app.js');
  const { env } = await import('./config/env.js');

  const server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, 'Prologue BFF listening');
  });

  const shutdown = (signal: string) => {
    logger.info({ signal }, 'Shutdown signal received');
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  console.error('Fatal startup error', err);
  process.exit(1);
});
