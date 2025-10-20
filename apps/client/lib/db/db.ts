'use server';
import { Kysely, PostgresDialect } from 'kysely';
import assert from 'node:assert';
import { Pool } from 'pg';
import { DB } from '@/lib/db/schema';

export default async function createDb() {
  const dbHost = process.env.DB_HOST;
  const dbPort = process.env.DB_PORT;
  const dbUser = process.env.DB_USER;
  const dbPassword = process.env.DB_PASSWORD;
  const dbName = process.env.DB_NAME;
  assert(dbHost, 'DB_HOST is not set');
  assert(dbPort, 'DB_PORT is not set');
  assert(dbUser, 'DB_USER is not set');
  assert(dbPassword, 'DB_PASSWORD is not set');
  assert(dbName, 'DB_NAME is not set');
  return new Kysely<DB>({
    dialect: new PostgresDialect({
      pool: new Pool({
        host: dbHost,
        port: Number(dbPort),
        user: dbUser,
        password: dbPassword,
        database: dbName,
      }),
    }),
  });
}
