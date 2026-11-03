import { eq } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';
import type { KunciKandungan, NilaiKandungan } from '@/lib/kandungan/jenis';
import { TAG } from './cache';
import { db } from './db';
import * as s from './skema';

async function baca<K extends KunciKandungan>(k: K): Promise<NilaiKandungan[K]> {
  const [r] = await db.select({ value: s.siteContent.value }).from(s.siteContent).where(eq(s.siteContent.key, k));
  if (!r) throw new Error(`Kandungan "${k}" tiada (jalankan npm run db:seed)`);
  return r.value as NilaiKandungan[K];
}

/** Versi diterbitkan, dicache sehingga admin terbit (`revalidateTag('kandungan')`). */
export function bacaKandungan<K extends KunciKandungan>(k: K): Promise<NilaiKandungan[K]> {
  return unstable_cache(() => baca(k), ['kandungan', k], { tags: [TAG.kandungan] })();
}

export const senaraiKategori = unstable_cache(
  () => db.select().from(s.category).orderBy(s.category.sortOrder),
  ['kategori'],
  { tags: [TAG.produk] },
);
