import express, { type Application, type Request, type Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { authn } from './middleware/auth.js';
import { requestLog } from './middleware/requestLog.js';
import { metricsHandler, metricsMiddleware } from './middleware/metrics.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiDocsHandler, apiDocsJsonHandler } from './docs/handler.js';
import { navigationRouter } from './routes/navigation.routes.js';
import { referenceRouter } from './routes/reference.routes.js';
import { accountsRouter } from './routes/accounts.routes.js';
import { journalEntriesRouter } from './routes/journal-entries.routes.js';
import { deferredRouter } from './routes/deferred.routes.js';
import { seedStore } from './store/seed.js';
import { memoryStore } from './store/memoryStore.js';

export interface AppOptions {
  /** When true, the in-memory store is reset + reseeded on app build. */
  reseed?: boolean;
}

/**
 * buildApp -- composition root. Exported separately from server bootstrap so
 * tests can spin up an Express instance without binding a port.
 */
export function buildApp(opts: AppOptions = {}): Application {
  if (opts.reseed) {
    memoryStore.reset();
    seedStore();
  }

  const app = express();
  app.disable('x-powered-by');

  // -- Security and parsing -------------------------------------------------
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean),
      credentials: false,
    }),
  );
  app.use(express.json({ limit: env.BODY_LIMIT }));

  // -- Observability --------------------------------------------------------
  app.use(requestLog);
  app.use(metricsMiddleware());

  // -- Public routes (mounted BEFORE authn) --------------------------------
  app.get('/healthz', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });
  app.get('/readyz', (_req: Request, res: Response) => {
    res.json({ status: 'ready' });
  });
  app.get('/metrics', (req, res, next) => {
    metricsHandler(req, res).catch(next);
  });
  if (env.ENABLE_API_DOCS) {
    app.get('/api-docs', apiDocsHandler);
    app.get('/api-docs.json', apiDocsJsonHandler);
  }

  // -- Authn guard for everything below ------------------------------------
  app.use(authn);

  // -- Protected routes -----------------------------------------------------
  app.use(navigationRouter);
  app.use(referenceRouter);
  app.use(accountsRouter);
  app.use(journalEntriesRouter);
  app.use(deferredRouter);

  // -- 404 catch-all (must be after all routes) -----------------------------
  app.use((req: Request, res: Response) => {
    logger.debug({ event: 'http.not_found', path: req.path }, 'Route not found');
    res.status(404).json({ error: 'Route not found' });
  });

  // -- Central error handler (must be last) ---------------------------------
  app.use(errorHandler);

  return app;
}
