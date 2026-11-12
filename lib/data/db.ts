import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as skema from './skema';

export type Db = NodePgDatabase<typeof skema>;

const g = globalThis as unknown as { __ykPool?: Pool; __ykDb?: Db };

/** Terangkan bentuk DATABASE_URL yang salah tanpa mendedahkan kata laluan. */
export function semakUrlDb(url: string): string | null {
  if (/^postgres(ql)?:\/\//.test(url)) return null;
  const tanda: string[] = [];
  if (/^\s/.test(url)) tanda.push('ada ruang di depan');
  if (/^["']/.test(url)) tanda.push('bermula dengan tanda petik');
  if (/^DATABASE_URL\s*=/.test(url)) tanda.push('termasuk "DATABASE_URL="');
  if (/^psql\b/.test(url)) tanda.push('format arahan psql, bukan URI');
  if (/\buser(name)?=|\bhost=/i.test(url)) tanda.push('format kunci=nilai, bukan URI');
  if (/^\w+$/.test(url)) tanda.push('nampak seperti kata laluan sahaja');
  tanda.push(`panjang ${url.length} aksara`, url.includes('pooler.supabase.com') ? 'ada hos pooler' : 'tiada hos pooler');
  return `DATABASE_URL mesti bermula dengan postgresql:// (${tanda.join(', ')})`;
}

function buat(): Db {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL belum ditetapkan');
  // Log sahaja (bukan throw) supaya build tidak gagal; pertanyaan akan gagal dengan mesej ini dalam log.
  const salah = semakUrlDb(url);
  if (salah) console.error(salah);
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
