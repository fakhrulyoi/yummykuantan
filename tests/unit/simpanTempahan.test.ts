import { afterAll, beforeEach, describe, expect, test } from 'vitest';
import { count, eq } from 'drizzle-orm';
import { db, skema as s, tutupDb } from '@/lib/data/db';
import { cariTempahanUntukPelanggan, semakStatus, simpanTempahan, simpanTempahanCepat } from '@/lib/data/tempahan';
import { binaMesejWhatsApp } from '@/lib/tempahan/mesej';
import { resetDb, seedDb } from '../db';
import { addonIkutNama, saizIkutSlug, slotIkutUrutan } from '../bantu';

const now = new Date('2026-11-03T02:00:00Z'); // 10:00 pagi MYT, 3 Nov
const ctx = { ip: '10.0.0.1', now };

async function inputSah(over: Record<string, unknown> = {}) {
  const it = await saizIkutSlug('italian-cake', '6 inci');
  const kb = await saizIkutSlug('kekbatik-indulgence-cheese', '7 inci');
  const slot = await slotIkutUrutan(1);
  return {
    items: [{ ...it, qty: 1, cakeMessage: 'Selamat Pengantin Baru' }, { ...kb, qty: 2 }],
    addons: [{ addonId: await addonIkutNama('Lilin set 3 batang'), qty: 1 }],
    mode: 'PICKUP',
    date: '2026-11-11',
    timeSlotId: slot.id,
    name: 'Nur Aisyah',
    phone: '011-2302 3447',
    lamanWeb: '',
    ...over,
  };
}

const bilOrder = async () => (await db.select({ n: count() }).from(s.order))[0].n;

beforeEach(async () => {
  await resetDb();
  await seedDb();
});
afterAll(tutupDb);

describe('simpanTempahan', () => {
  test('tempahan sah direkod dengan harga dari DB', async () => {
    const r = await simpanTempahan(await inputSah(), ctx);
    expect(r).toMatchObject({ ok: true, totalSen: 21600, hargaBerubah: false });
    if (!r.ok) throw new Error();
    expect(r.ref).toMatch(/^YK-241\d\d$/);
    expect(r.token).toHaveLength(32);
    expect(r.waUrl.startsWith('https://wa.me/601123023447?text=')).toBe(true);

    const [o] = await db.select().from(s.order).where(eq(s.order.ref, r.ref));
    expect(o.totalSen).toBe(21600);
    expect(o.cakeSubtotalSen).toBe(21000);
    expect(o.addonSubtotalSen).toBe(600);
    expect(o.status).toBe('BARU_WA');
    expect(o.kind).toBe('LIST');
    expect(o.phone).toBe('601123023447');
    expect(o.ipHash).not.toContain('10.0.0.1');
    const items = await db.select().from(s.orderItem).where(eq(s.orderItem.orderId, o.id));
    const addons = await db.select().from(s.orderAddon).where(eq(s.orderAddon.orderId, o.id));
    expect(items).toHaveLength(2);
    expect(addons).toHaveLength(1);
    expect(o.waMessage).toBe(
      binaMesejWhatsApp({
        ref: r.ref,
        kind: 'LIST',
        items: [
          { productId: items[0].productId, productName: 'Italian Cake', sizeLabel: '6 inci', unitPriceSen: 10000, qty: 1, cakeMessage: 'Selamat Pengantin Baru', leadDays: 3 },
          { productId: items[1].productId, productName: 'Kekbatik Indulgence Cheese', sizeLabel: '7 inci', unitPriceSen: 5500, qty: 2, leadDays: 3 },
        ],
        addons: [{ addonId: addons[0].addonId, name: 'Lilin set 3 batang', unitPriceSen: 600, qty: 1 }],
        totalSen: 21600,
        tarikh: '2026-11-11',
        slotLabel: '2:00 hingga 4:00 petang',
        mode: 'PICKUP',
        name: 'Nur Aisyah',
      }),
    );
    expect(decodeURIComponent(r.waUrl.split('text=')[1])).toBe(o.waMessage);
  });

  test('harga dalam senarai pelanggan lapuk', async () => {
    const r = await simpanTempahan(await inputSah(), { ...ctx, hargaPelanggan: 20000 });
    expect(r).toMatchObject({ ok: true, hargaBerubah: true, totalSen: 21600 });
  });

  test('saiz dinyahaktif', async () => {
    const it = await saizIkutSlug('italian-cake', '6 inci');
    await db.update(s.productSize).set({ active: false }).where(eq(s.productSize.id, it.sizeId));
    expect(await simpanTempahan(await inputSah(), ctx)).toEqual({ ok: false, ralat: 'ITEM_TIDAK_AKTIF', indeks: 0 });
    expect(await bilOrder()).toBe(0);
  });

  test('produk dinyahaktif', async () => {
    const kb = await saizIkutSlug('kekbatik-indulgence-cheese', '7 inci');
    await db.update(s.product).set({ active: false }).where(eq(s.product.id, kb.productId));
    expect(await simpanTempahan(await inputSah(), ctx)).toEqual({ ok: false, ralat: 'ITEM_TIDAK_AKTIF', indeks: 1 });
  });

  test('input tidak sah memulangkan medan', async () => {
    const r = await simpanTempahan(await inputSah({ name: '' }), ctx);
    expect(r).toMatchObject({ ok: false, ralat: 'INPUT', medan: { name: 'Sila isi nama' } });
  });

  test('tarikh terlalu awal dan hari tutup', async () => {
    expect(await simpanTempahan(await inputSah({ date: '2026-11-05' }), ctx)).toMatchObject({ ok: false, ralat: 'TERLALU_AWAL' });
    await db.insert(s.closedDate).values({ date: '2026-11-12' });
    expect(await simpanTempahan(await inputSah({ date: '2026-11-12' }), ctx)).toMatchObject({ ok: false, ralat: 'HARI_TUTUP' });
  });

  test('kek kahwin perlu 7 hari', async () => {
    const k = await saizIkutSlug('2-tier-wedding-cake', '2 tingkat');
    const r = await simpanTempahan(await inputSah({ items: [{ ...k, qty: 1 }], date: '2026-11-08' }), ctx);
    expect(r).toMatchObject({ ok: false, ralat: 'TERLALU_AWAL' });
  });

  test('slot terakhir: dua tempahan serentak, satu berjaya', async () => {
    const slot = await slotIkutUrutan(1);
    await db.update(s.timeSlot).set({ capacity: 1 }).where(eq(s.timeSlot.id, slot.id));
    const [a, b] = await Promise.all([
      simpanTempahan(await inputSah({ phone: '0111111111' }), { ...ctx, ip: '10.0.0.2' }),
      simpanTempahan(await inputSah({ phone: '0122222222' }), { ...ctx, ip: '10.0.0.3' }),
    ]);
    const hasil = [a, b].map((r) => (r.ok ? 'ok' : r.ralat)).sort();
    expect(hasil).toEqual(['SLOT_PENUH', 'ok']);
    expect(await bilOrder()).toBe(1);
  });

  test('kapasiti harian penuh', async () => {
    await db.update(s.settings).set({ dailyCapacity: 1 });
    expect((await simpanTempahan(await inputSah({ phone: '0111111111' }), ctx)).ok).toBe(true);
    const slot0 = await slotIkutUrutan(0);
    expect(await simpanTempahan(await inputSah({ phone: '0122222222', timeSlotId: slot0.id }), ctx)).toMatchObject({ ok: false, ralat: 'HARI_PENUH' });
  });

  test('hantar dua kali dalam 10 minit memulangkan rujukan sama', async () => {
    const input = await inputSah();
    const a = await simpanTempahan(input, ctx);
    const b = await simpanTempahan(input, { ...ctx, now: new Date(now.getTime() + 5 * 60_000) });
    expect(a.ok && b.ok && a.ref === b.ref).toBe(true);
    expect(await bilOrder()).toBe(1);
  });

  test('tekan dua kali serentak memulangkan satu rekod', async () => {
    const input = await inputSah();
    const [a, b] = await Promise.all([simpanTempahan(input, ctx), simpanTempahan(input, ctx)]);
    expect(a.ok && b.ok && a.ref === b.ref).toBe(true);
    expect(await bilOrder()).toBe(1);
  });

  test('selepas 10 minit dianggap tempahan baru', async () => {
    const input = await inputSah();
    const a = await simpanTempahan(input, ctx);
    const b = await simpanTempahan(input, { ...ctx, now: new Date(now.getTime() + 11 * 60_000) });
    expect(a.ok && b.ok && a.ref !== b.ref).toBe(true);
  });

  test('had 10 tempahan sejam bagi satu IP', async () => {
    for (let i = 0; i < 10; i++) {
      const r = await simpanTempahan(await inputSah({ phone: `01${String(10000000 + i)}`, date: `2026-11-${String(11 + i)}` }), ctx);
      expect(r.ok).toBe(true);
    }
    expect(await simpanTempahan(await inputSah({ phone: '0199999999', date: '2026-11-25' }), ctx)).toMatchObject({ ok: false, ralat: 'HAD_KADAR' });
  });

  test('perangkap bot', async () => {
    expect(await simpanTempahan(await inputSah({ lamanWeb: 'http://spam' }), ctx)).toMatchObject({ ok: false, ralat: 'INPUT' });
    expect(await bilOrder()).toBe(0);
  });
});

describe('simpanTempahanCepat', () => {
  test('rekod QUICK tanpa tarikh dan nama', async () => {
    const it = await saizIkutSlug('italian-cake', '8 inci');
    const r = await simpanTempahanCepat({ ...it, qty: 1, lamanWeb: '' }, ctx);
    expect(r).toMatchObject({ ok: true, totalSen: 28000 });
    if (!r.ok) throw new Error();
    const [o] = await db.select().from(s.order).where(eq(s.order.ref, r.ref));
    expect(o.kind).toBe('QUICK');
    expect(o.date).toBeNull();
    expect(o.customerName).toBeNull();
    expect(o.waMessage).toContain('Tarikh yang saya mahu: ');
    expect(o.waMessage).toContain(r.ref);
  });

  test('dua kali dari IP sama memulangkan rujukan sama', async () => {
    const it = await saizIkutSlug('italian-cake', '8 inci');
    const a = await simpanTempahanCepat({ ...it, qty: 1, lamanWeb: '' }, ctx);
    const b = await simpanTempahanCepat({ ...it, qty: 1, lamanWeb: '' }, ctx);
    expect(a.ok && b.ok && a.ref === b.ref).toBe(true);
    expect(await bilOrder()).toBe(1);
  });

  test('saiz lain dianggap tempahan lain', async () => {
    const a = await simpanTempahanCepat({ ...(await saizIkutSlug('italian-cake', '8 inci')), qty: 1, lamanWeb: '' }, ctx);
    const b = await simpanTempahanCepat({ ...(await saizIkutSlug('italian-cake', '6 inci')), qty: 1, lamanWeb: '' }, ctx);
    expect(a.ok && b.ok && a.ref !== b.ref).toBe(true);
  });
});

describe('cari dan semak', () => {
  test('cariTempahanUntukPelanggan perlukan token betul', async () => {
    const r = await simpanTempahan(await inputSah(), ctx);
    if (!r.ok) throw new Error();
    const o = await cariTempahanUntukPelanggan(r.ref, r.token);
    expect(o?.ref).toBe(r.ref);
    expect(o?.items).toHaveLength(2);
    expect(o?.slotLabel).toBe('2:00 hingga 4:00 petang');
    expect(await cariTempahanUntukPelanggan(r.ref, 'a'.repeat(32))).toBeNull();
    expect(await cariTempahanUntukPelanggan(r.ref, '')).toBeNull();
  });

  test('semakStatus dengan 4 digit', async () => {
    const r = await simpanTempahan(await inputSah(), ctx);
    if (!r.ok) throw new Error();
    expect(await semakStatus(r.ref, '3447', '10.0.0.9')).toMatchObject({ ok: true, status: 'BARU_WA', kind: 'LIST', date: '2026-11-11', mode: 'PICKUP' });
    expect(await semakStatus(r.ref, '0000', '10.0.0.9')).toEqual({ ok: false, ralat: 'TIADA' });
    expect(await semakStatus('YK-99999', '3447', '10.0.0.9')).toEqual({ ok: false, ralat: 'TIADA' });
  });

  test('semakStatus had 20 sejam', async () => {
    for (let i = 0; i < 20; i++) await semakStatus('YK-99999', '0000', '10.0.0.8');
    expect(await semakStatus('YK-99999', '0000', '10.0.0.8')).toEqual({ ok: false, ralat: 'HAD_KADAR' });
  });
});
