import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { env } from './env';
import { User } from '../entities/User';
import { ResourceType } from '../entities/ResourceType';
import { Resource } from '../entities/Resource';
import { Booking } from '../entities/Booking';

/**
 * Single shared TypeORM DataSource. `synchronize` is enabled in development so the
 * schema is created automatically; disable it (DB_SYNCHRONIZE=false) and use
 * migrations for production deployments.
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.db.host,
  port: env.db.port,
  username: env.db.username,
  password: env.db.password,
  database: env.db.database,
  synchronize: env.db.synchronize,
  logging: env.db.logging,
  entities: [User, ResourceType, Resource, Booking],
  migrations: [],
  subscribers: [],
});
