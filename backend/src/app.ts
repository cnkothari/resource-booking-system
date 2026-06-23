import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env';
import { apiRouter } from './routes';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';

/**
 * Build and configure the Express application. Kept as a factory function
 * (functional style) so it can be reused in tests without side effects.
 */
export const createApp = (): Application => {
  const app = express();

  app.use(cors({ origin: env.corsOrigin, credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  if (env.nodeEnv !== 'test') {
    app.use(morgan('dev'));
  }

  app.use('/api', apiRouter);

  // 404 for any unmatched route, then the central error handler.
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
