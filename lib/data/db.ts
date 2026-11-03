import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as skema from './skema';

export type Db = NodePgDatabase<typeof skema>;

const g = globalThis as unknown as { __ykPool?: Pool; __ykDb?: Db };

function buat(): Db {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL belum ditetapkan');
  const pool = g.__ykPool ?? new Pool({ connectionString: url, max: Number(process.env.DB_POOL_MAX ?? 5) });
  g.__ykPool = pool;
  return drizzle(pool, { schema: skema, casing: 'snake_case' });
}

export const db: Db = g.__ykDb ?? (g.__ykDb = buat());

export async function tutupDb(): Promise<void> {
  await g.__ykPool?.end();
  g.__ykPool = undefined;
  g.__ykDb = undefined;
}

export { skema };
