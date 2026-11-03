import { afterAll, beforeEach, describe, expect, test } from 'vitest';
import { asc, count, eq } from 'drizzle-orm';
import { db, skema as s, tutupDb } from '@/lib/data/db';
import { bacaDrafProduk, ciptaProduk, padamProduk, simpanDrafProduk, terbitProduk } from '@/lib/data/terbit';
import { resetDb, seedDb } from '../db';

const PENGGUNA = '00000000-0000-4000-8000-000000000001';

async function italian() {
  const [p] = await db.select().from(s.product).where(eq(s.product.slug, 'italian-cake'));
  return p;
}

beforeEach(async () => {
  await resetDb();
  await seedDb();
});
afterAll(tutupDb);

describe('draf dan terbit produk', () => {
  test('simpan draf tidak mengubah lajur awam; terbit menyalin dan mengosongkan draf', async () => {
    const p = await italian();
    const d = await bacaDrafProduk(p.id);
    expect(d!.sizes.map((z) => z.priceSen)).toEqual([10000, 28000, 38000]);
    d!.sizes[0].priceSen = 11000;
    d!.description = 'Penerangan baru';
    expect(await simpanDrafProduk(p.id, d!, PENGGUNA)).toEqual({ ok: true });

    const [z0] = await db.select().from(s.productSize).where(eq(s.productSize.id, d!.sizes[0].id!));
    expect(z0.priceSen).toBe(10000);
    expect((await italian()).description).not.toBe('Penerangan baru');
    expect((await bacaDrafProduk(p.id))!.sizes[0].priceSen).toBe(11000);

    expect(await terbitProduk(p.id, PENGGUNA)).toEqual({ ok: true });
    const q = await italian();
    expect(q.draft).toBeNull();
    expect(q.description).toBe('Penerangan baru');
    expect(q.publishedAt).not.toBeNull();
    const [z1] = await db.select().from(s.productSize).where(eq(s.productSize.id, d!.sizes[0].id!));
    expect(z1.priceSen).toBe(11000);
    expect((await db.select({ n: count() }).from(s.auditLog))[0].n).toBe(2);
  });

  test('saiz dibuang dinyahaktif (id kekal), saiz baru ditambah', async () => {
    const p = await italian();
    const d = (await bacaDrafProduk(p.id))!;
    const buang = d.sizes[2].id!;
    d.sizes = [d.sizes[0], d.sizes[1], { label: '12 inci', priceSen: 50000 }];
    await simpanDrafProduk(p.id, d, PENGGUNA);
    await terbitProduk(p.id, PENGGUNA);
    const semua = await db.select().from(s.productSize).where(eq(s.productSize.productId, p.id)).orderBy(asc(s.productSize.sortOrder));
    expect(semua.find((z) => z.id === buang)!.active).toBe(false);
    expect(semua.filter((z) => z.active).map((z) => z.label)).toEqual(['6 inci', '8 inci', '12 inci']);
  });

  test('draf tanpa saiz ditolak', async () => {
    const p = await italian();
    const d = (await bacaDrafProduk(p.id))!;
    d.sizes = [];
    expect(await simpanDrafProduk(p.id, d, PENGGUNA)).toEqual({ ok: false, ralat: 'Sekurang-kurangnya satu saiz' });
  });

  test('gambar diganti ikut susunan draf', async () => {
    const p = await italian();
    const d = (await bacaDrafProduk(p.id))!;
    const [a, b] = d.images;
    d.images = [b, a];
    await simpanDrafProduk(p.id, d, PENGGUNA);
    await terbitProduk(p.id, PENGGUNA);
    const g = await db.select().from(s.productImage).where(eq(s.productImage.productId, p.id)).orderBy(asc(s.productImage.sortOrder));
    expect(g.map((x) => x.url)).toEqual([b.url, a.url]);
  });

  test('cipta produk baru: tidak aktif, slug unik', async () => {
    const id1 = await ciptaProduk('Italian Cake', PENGGUNA);
    const [x] = await db.select().from(s.product).where(eq(s.product.id, id1));
    expect(x.active).toBe(false);
    expect(x.slug).toBe('italian-cake-2');
  });

  test('padam: produk dengan rekod tempahan hanya dinyahaktif', async () => {
    const p = await italian();
    const [o] = await db
      .insert(s.order)
      .values({ ref: 'YK-1', token: 't', kind: 'QUICK', cakeSubtotalSen: 1, totalSen: 1, waMessage: '-', ipHash: '-', dedupeKey: '-' })
      .returning();
    await db.insert(s.orderItem).values({ orderId: o.id, productId: p.id, productName: 'Italian Cake', sizeLabel: '6 inci', unitPriceSen: 1, qty: 1 });
    expect(await padamProduk(p.id, PENGGUNA)).toEqual({ ok: true, dipadam: false });
    expect((await italian()).active).toBe(false);

    const baru = await ciptaProduk('Kek Ujian', PENGGUNA);
    expect(await padamProduk(baru, PENGGUNA)).toEqual({ ok: true, dipadam: true });
    expect(await db.select().from(s.product).where(eq(s.product.id, baru))).toHaveLength(0);
  });
});
