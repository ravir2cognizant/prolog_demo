import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { requestLog } from './middleware/requestLog.js';
import { metricsMiddleware } from './middleware/metrics.js';
import { errorHandler } from './middleware/errorHandler.js';
import router from './routes/index.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLog);
app.use(metricsMiddleware);

app.use('/', router);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    type: 'https://prologue.example/problems/not-found',
    title: 'Not Found',
    status: 404,
    detail: 'The requested resource does not exist',
  });
});

app.use(errorHandler);

logger.info({ port: env.PORT }, 'App configured');

export default app;
