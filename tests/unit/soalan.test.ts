import { afterAll, beforeEach, describe, expect, test } from 'vitest';
import { asc, eq } from 'drizzle-orm';
import { db, skema as s, tutupDb } from '@/lib/data/db';
import { adaKurungan, simpanDrafSoalan, susunSoalan, terbitSoalan, tunjukSoalan } from '@/lib/data/soalanAdmin';
import { resetDb, seedDb } from '../db';

const U = '00000000-0000-4000-8000-000000000001';

describe('adaKurungan', () => {
  test('kesan [teks] yang belum diisi', () => {
    expect(adaKurungan('Sekurang-kurangnya [3 hari].')).toBe(true);
    expect(adaKurungan('Tiada kurungan di sini.')).toBe(false);
    expect(adaKurungan('Tanda [ sahaja')).toBe(true);
  });
});

describe('soalan lazim', () => {
  beforeEach(async () => {
    await resetDb();
    await seedDb();
  });
  afterAll(tutupDb);
  const ikut = async (q: string) => (await db.select().from(s.faq).where(eq(s.faq.question, q)))[0];

  test('terbit ditolak jika masih ada kurungan; selepas diisi, terbit dan papar', async () => {
    const f = await ikut('Berapa hari awal perlu tempah?');
    expect(f.visible).toBe(false);
    expect(await terbitSoalan(f.id, U)).toEqual({ ok: false, ralat: 'Jawapan masih ada [kurungan]. Isi dahulu sebelum terbit.' });
    expect(await simpanDrafSoalan(f.id, f.question, 'Sekurang-kurangnya 3 hari untuk kek biasa.', U)).toEqual({ ok: true });
    expect((await ikut(f.question)).answer).toContain('[3 hari]');
    expect(await terbitSoalan(f.id, U)).toEqual({ ok: true });
    const g = await ikut(f.question);
    expect(g.answer).toBe('Sekurang-kurangnya 3 hari untuk kek biasa.');
    expect(g.visible).toBe(true);
    expect(g.draftAnswer).toBeNull();
  });

  test('tunjuk soalan berkurungan ditolak; sembunyi dibenarkan', async () => {
    const f = await ikut('Kek ini halal?');
    expect((await tunjukSoalan(f.id, true, U)).ok).toBe(false);
    const v = await ikut('Macam mana nak tempah?');
    expect(await tunjukSoalan(v.id, false, U)).toEqual({ ok: true });
    expect((await ikut(v.question)).visible).toBe(false);
  });

  test('susun ikut senarai id', async () => {
    const semua = await db.select().from(s.faq).orderBy(asc(s.faq.sortOrder));
    const terbalik = semua.map((f) => f.id).reverse();
    await susunSoalan(terbalik, U);
    const baru = await db.select().from(s.faq).orderBy(asc(s.faq.sortOrder));
    expect(baru.map((f) => f.id)).toEqual(terbalik);
  });
});
