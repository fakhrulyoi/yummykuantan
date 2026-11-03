import { createHash } from 'node:crypto';
import { sql } from 'drizzle-orm';
import { db } from './db';

/** `true` jika dibenarkan. Satu baris per kunci per tetingkap; kiraan dinaikkan secara atomik. */
export async function hadKadar(kunci: string, had: number, tetingkapSaat: number, now = new Date()): Promise<boolean> {
  const mula = new Date(Math.floor(now.getTime() / (tetingkapSaat * 1000)) * tetingkapSaat * 1000);
  const r = await db.execute<{ count: number }>(sql`
    INSERT INTO rate_limit (key, window_start, count) VALUES (${kunci}, ${mula.toISOString()}, 1)
    ON CONFLICT (key, window_start) DO UPDATE SET count = rate_limit.count + 1
    RETURNING count`);
  return Number(r.rows[0].count) <= had;
}

export async function bersihkanHadKadar(now = new Date()): Promise<void> {
  await db.execute(sql`DELETE FROM rate_limit WHERE window_start < ${new Date(now.getTime() - 2 * 86400_000).toISOString()}`);
}

export function hashIp(ip: string): string {
  return createHash('sha256').update(`${process.env.IP_HASH_SALT ?? ''}:${ip}`).digest('hex');
}
