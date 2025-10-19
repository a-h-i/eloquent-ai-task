import { Pool } from 'pg';
import path from 'node:path';
import assert from 'node:assert';
import {
  Migrator,
  FileMigrationProvider,
  Kysely,
  PostgresDialect,
} from 'kysely';
import fs from 'node:fs/promises';

async function runMigrations() {
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

  const db = new Kysely({
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

  try {
    const migrator = new Migrator({
      db,
      provider: new FileMigrationProvider({
        fs,
        path,
        migrationFolder: path.join(__dirname, 'migrations'),
      }),
    });
    const { error, results } = await migrator.migrateToLatest();
    results?.forEach((result) => {
      if (result.status === 'Success') {
        console.log(
          `migration "${result.migrationName}" was executed successfully`,
        );
      } else if (result.status === 'Error') {
        console.error(`failed to execute migration "${result.migrationName}"`);
      }
    });
    if (error) {
      console.error('Migrations failed');
      console.error(error);
      throw new Error('Migrations failed');
    }
    console.log('Migrations completed successfully');
  } finally {
    await db.destroy();
  }
}

runMigrations().catch((error) => {
  console.error(error);
  process.exit(1);
});
