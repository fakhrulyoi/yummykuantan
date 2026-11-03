import { describe, expect, test } from 'vitest';
import { kiraHarga } from '@/lib/tempahan/harga';
import type { AddonKatalog, SaizKatalog } from '@/lib/tempahan/jenis';

const saiz = new Map<string, SaizKatalog>([
  ['it6', { sizeId: 'it6', productId: 'italian', productName: 'Italian Cake', label: '6 inci', priceSen: 10000, active: true, leadDays: 3, allowMessage: true }],
  ['kb7', { sizeId: 'kb7', productId: 'batik', productName: 'Kekbatik Ganache', label: '7 inci', priceSen: 5500, active: true, leadDays: 3, allowMessage: false }],
  ['off', { sizeId: 'off', productId: 'lama', productName: 'Kek Lama', label: '6 inci', priceSen: 9000, active: false, leadDays: 3, allowMessage: true }],
]);
const tambahan = new Map<string, AddonKatalog>([
  ['lilin', { addonId: 'lilin', name: 'Lilin set 3 batang', priceSen: 600, textKind: 'NONE', active: true }],
  ['nombor', { addonId: 'nombor', name: 'Lilin nombor', priceSen: 500, textKind: 'NUMBER', active: true }],
  ['kad', { addonId: 'kad', name: 'Kad ucapan', priceSen: 300, textKind: 'MESSAGE', active: true }],
  ['tutup', { addonId: 'tutup', name: 'Beg', priceSen: 400, textKind: 'NONE', active: false }],
]);

describe('kiraHarga', () => {
  test('jumlah dari harga katalog', () => {
    const r = kiraHarga(
      [{ productId: 'italian', sizeId: 'it6', qty: 1 }, { productId: 'batik', sizeId: 'kb7', qty: 2 }],
      [{ addonId: 'lilin', qty: 1 }],
      saiz,
      tambahan,
    );
    expect(r).toMatchObject({ ok: true, cakeSubtotalSen: 21000, addonSubtotalSen: 600, totalSen: 21600 });
    if (!r.ok) throw new Error();
    expect(r.items[1]).toEqual({ productId: 'batik', productName: 'Kekbatik Ganache', sizeLabel: '7 inci', unitPriceSen: 5500, qty: 2, leadDays: 3 });
    expect(r.addons[0]).toEqual({ addonId: 'lilin', name: 'Lilin set 3 batang', unitPriceSen: 600, qty: 1 });
  });

  test('harga dari browser tidak digunakan', () => {
    const input = [{ productId: 'italian', sizeId: 'it6', qty: 1, priceSen: 1 }] as never;
    const r = kiraHarga(input, [], saiz, tambahan);
    expect(r).toMatchObject({ ok: true, totalSen: 10000 });
  });

  test('saiz tidak aktif', () => {
    const r = kiraHarga([{ productId: 'italian', sizeId: 'it6', qty: 1 }, { productId: 'lama', sizeId: 'off', qty: 1 }], [], saiz, tambahan);
    expect(r).toEqual({ ok: false, ralat: 'ITEM_TIDAK_AKTIF', indeks: 1 });
  });

  test('saiz tidak wujud atau produk tidak padan', () => {
    expect(kiraHarga([{ productId: 'italian', sizeId: 'tiada', qty: 1 }], [], saiz, tambahan)).toEqual({ ok: false, ralat: 'ITEM_TIDAK_AKTIF', indeks: 0 });
    expect(kiraHarga([{ productId: 'batik', sizeId: 'it6', qty: 1 }], [], saiz, tambahan)).toEqual({ ok: false, ralat: 'ITEM_TIDAK_AKTIF', indeks: 0 });
  });

  test.each([0, 11, 1.5])('kuantiti %s ditolak', (qty) => {
    expect(kiraHarga([{ productId: 'italian', sizeId: 'it6', qty }], [], saiz, tambahan)).toMatchObject({ ok: false, ralat: 'KUANTITI', indeks: 0 });
  });

  test('tambahan tidak aktif', () => {
    expect(kiraHarga([{ productId: 'italian', sizeId: 'it6', qty: 1 }], [{ addonId: 'tutup', qty: 1 }], saiz, tambahan)).toEqual({ ok: false, ralat: 'ADDON_TIDAK_AKTIF', indeks: 0 });
  });

  test('lilin nombor tanpa teks', () => {
    expect(kiraHarga([{ productId: 'italian', sizeId: 'it6', qty: 1 }], [{ addonId: 'nombor', qty: 1 }], saiz, tambahan)).toEqual({ ok: false, ralat: 'TEKS_DIPERLUKAN', indeks: 0 });
    expect(kiraHarga([{ productId: 'italian', sizeId: 'it6', qty: 1 }], [{ addonId: 'nombor', qty: 1, text: '  ' }], saiz, tambahan)).toMatchObject({ ralat: 'TEKS_DIPERLUKAN' });
  });

  test('kad ucapan lebih 120 aksara', () => {
    const r = kiraHarga([{ productId: 'italian', sizeId: 'it6', qty: 1 }], [{ addonId: 'kad', qty: 1, text: 'a'.repeat(121) }], saiz, tambahan);
    expect(r).toEqual({ ok: false, ralat: 'TEKS_PANJANG', indeks: 0 });
  });

  test('ucapan kek 31 aksara', () => {
    const r = kiraHarga([{ productId: 'italian', sizeId: 'it6', qty: 1, cakeMessage: 'a'.repeat(31) }], [], saiz, tambahan);
    expect(r).toEqual({ ok: false, ralat: 'TEKS_PANJANG', indeks: 0 });
  });

  test('ucapan pada produk tanpa tulisan dibuang', () => {
    const r = kiraHarga([{ productId: 'batik', sizeId: 'kb7', qty: 1, cakeMessage: 'Selamat' }], [], saiz, tambahan);
    if (!r.ok) throw new Error('patut ok');
    expect(r.items[0].cakeMessage).toBeUndefined();
  });

  test('ucapan dipangkas dan kosong dibuang', () => {
    const r = kiraHarga([{ productId: 'italian', sizeId: 'it6', qty: 1, cakeMessage: '  Selamat Pengantin Baru  ' }, { productId: 'italian', sizeId: 'it6', qty: 1, cakeMessage: '   ' }], [], saiz, tambahan);
    if (!r.ok) throw new Error('patut ok');
    expect(r.items[0].cakeMessage).toBe('Selamat Pengantin Baru');
    expect(r.items[1].cakeMessage).toBeUndefined();
  });

  test('senarai kosong', () => {
    expect(kiraHarga([], [{ addonId: 'lilin', qty: 1 }], saiz, tambahan)).toEqual({ ok: false, ralat: 'SENARAI_KOSONG' });
  });
});
