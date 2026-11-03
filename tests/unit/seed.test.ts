import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { asc, count, eq, sql } from 'drizzle-orm';
import { db, skema as s, tutupDb } from '@/lib/data/db';
import { resetDb, seedDb } from '../db';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const bil = async (t: any, where?: any) => {
  const [r] = await db.select({ n: count() }).from(t).where(where);
  return r.n;
};

describe('data mula', () => {
  beforeAll(async () => {
    await resetDb();
    await seedDb();
  });
  afterAll(async () => {
    await tutupDb();
  });

  test('6 kategori dan 33 produk', async () => {
    expect(await bil(s.category)).toBe(6);
    expect(await bil(s.product)).toBe(33);
  });

  test('8 kek meja berurutan dengan gambar meja', async () => {
    const meja = await db.select().from(s.product).where(eq(s.product.onTable, true)).orderBy(asc(s.product.tablePosition));
    expect(meja).toHaveLength(8);
    expect(meja.map((p) => p.tablePosition)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(meja.every((p) => p.tableImageUrl)).toBe(true);
    expect(meja[0].name).toBe('Italian Cake');
    expect(meja[4].name).toBe('Tall Cake Italian');
  });

  test('saiz Italian Cake', async () => {
    const p = await db.query.product.findFirst({ where: eq(s.product.slug, 'italian-cake') });
    const saiz = await db.select().from(s.productSize).where(eq(s.productSize.productId, p!.id)).orderBy(asc(s.productSize.sortOrder));
    expect(saiz.map((z) => [z.label, z.priceSen])).toEqual([
      ['6 inci', 10000],
      ['8 inci', 28000],
      ['10 inci', 38000],
    ]);
  });

  test('slot, tetapan dan tempoh tempah awal', async () => {
    const slot = await db.select().from(s.timeSlot).orderBy(asc(s.timeSlot.sortOrder));
    expect(slot.map((z) => z.capacity)).toEqual([3, 2, 2]);
    const [t] = await db.select().from(s.settings).where(eq(s.settings.id, 1));
    expect(t.dailyCapacity).toBe(12);
    expect(t.minLeadDays).toBe(3);
    expect(t.holdHours).toBe(48);
    expect(t.deliveryAreas).toEqual(['Kuantan', 'Pekan']);
    const kahwin = await db
      .select({ leadDays: s.product.leadDays })
      .from(s.product)
      .innerJoin(s.category, eq(s.category.id, s.product.categoryId))
      .where(eq(s.category.name, 'Kek kahwin'));
    expect(kahwin).toHaveLength(5);
    expect(kahwin.every((p) => p.leadDays === 7)).toBe(true);
  });

  test('tambahan dan soalan lazim', async () => {
    const a = await db.select().from(s.addon).orderBy(asc(s.addon.sortOrder));
    expect(a.map((x) => x.priceSen)).toEqual([600, 500, 300, 400, 400]);
    expect(await bil(s.faq)).toBe(10);
    expect(await bil(s.faq, eq(s.faq.visible, true))).toBe(3);
  });

  test('jujukan rujukan bermula 24100', async () => {
    const r = await db.execute<{ n: string }>(sql`SELECT nextval('order_ref_seq') AS n`);
    expect(Number(r.rows[0].n)).toBe(24100);
  });
});
