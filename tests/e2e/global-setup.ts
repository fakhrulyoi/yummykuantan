import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

export default async function setup() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  await migrate(drizzle(pool), { migrationsFolder: 'db/migrations' });
  await pool.end();
  const { resetDb, seedDb } = await import('../db');
  await resetDb();
  await seedDb();
  const { tutupDb } = await import('../../lib/data/db');
  await tutupDb();
}
