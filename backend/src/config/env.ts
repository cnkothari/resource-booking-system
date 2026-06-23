import dotenv from 'dotenv';

dotenv.config();

/**
 * Centralised, typed access to environment configuration.
 * Kept as a plain frozen object (functional style — no config class).
 */
const toBool = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined) return fallback;
  return value.toLowerCase() === 'true';
};

const toInt = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: toInt(process.env.PORT, 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  db: {
    host: process.env.DB_HOST ?? 'localhost',
    port: toInt(process.env.DB_PORT, 5432),
    username: process.env.DB_USERNAME ?? 'rbs_user',
    password: process.env.DB_PASSWORD ?? 'rbs_password',
    database: process.env.DB_DATABASE ?? 'resource_booking',
    synchronize: toBool(process.env.DB_SYNCHRONIZE, true),
    logging: toBool(process.env.DB_LOGGING, false),
  },
});
