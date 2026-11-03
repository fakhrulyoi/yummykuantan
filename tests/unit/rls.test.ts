import { afterAll, describe, expect, test } from 'vitest';
import { sql } from 'drizzle-orm';
import { db, tutupDb } from '@/lib/data/db';

afterAll(tutupDb);

describe('keselamatan pangkalan data', () => {
  // Supabase dedahkan skema public melalui REST kepada kunci anon (awam). RLS tanpa polisi = tolak semua
  // kecuali pemilik jadual / service role, iaitu sambungan aplikasi ini.
  test('Row Level Security aktif pada setiap jadual public', async () => {
    const r = await db.execute<{ relname: string; relrowsecurity: boolean }>(sql`
      SELECT c.relname, c.relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relname NOT LIKE '__drizzle%'`);
    expect(r.rows.length).toBeGreaterThan(10);
    expect(r.rows.filter((x) => !x.relrowsecurity).map((x) => x.relname)).toEqual([]);
  });
});
