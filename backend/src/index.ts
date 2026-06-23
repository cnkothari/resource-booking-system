import { createApp } from './app';
import { env } from './config/env';
import { AppDataSource } from './config/data-source';

const start = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    // eslint-disable-next-line no-console
    console.log('[db] connected to PostgreSQL');

    const app = createApp();
    app.listen(env.port, () => {
      // eslint-disable-next-line no-console
      console.log(`[server] API listening on http://localhost:${env.port}/api`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[startup] failed to start server', error);
    process.exit(1);
  }
};

void start();
