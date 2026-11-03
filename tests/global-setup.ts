import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

export default async function setup() {
  const pool = new Pool({ connectionString: process.env.TEST_DATABASE_URL ?? 'postgresql://yk:yk@localhost:5432/yk_test' });
  await migrate(drizzle(pool), { migrationsFolder: 'db/migrations' });
  await pool.end();
}
