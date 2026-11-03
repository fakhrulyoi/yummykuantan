import { describe, expect, test } from 'vitest';
import { bilKek, buangItem, KOSONG, bacaSenarai, tambahItem, ubahAddon, ubahQty, type Senarai } from '@/lib/senarai/senarai';

const a = { productId: 'p1', sizeId: 's1', qty: 1 };

describe('senarai tempahan di browser', () => {
  test('tambah dan gabung item sama', () => {
    let s = tambahItem(KOSONG, a);
    s = tambahItem(s, { ...a, qty: 2 });
    expect(s.items).toEqual([{ ...a, qty: 3 }]);
    expect(bilKek(s)).toBe(3);
  });

  test('ucapan berbeza dianggap item lain', () => {
    const s = tambahItem(tambahItem(KOSONG, { ...a, cakeMessage: 'Ali' }), { ...a, cakeMessage: 'Abu' });
    expect(s.items).toHaveLength(2);
  });

  test('kuantiti maksimum 10', () => {
    const s = tambahItem(tambahItem(KOSONG, { ...a, qty: 8 }), { ...a, qty: 5 });
    expect(s.items[0].qty).toBe(10);
    expect(ubahQty(s, 0, 15).items[0].qty).toBe(10);
    expect(ubahQty(s, 0, 0).items[0].qty).toBe(1);
  });

  test('buang item tidak mengubah senarai asal', () => {
    const s = tambahItem(tambahItem(KOSONG, a), { ...a, sizeId: 's2' });
    const t = buangItem(s, 0);
    expect(t.items.map((i) => i.sizeId)).toEqual(['s2']);
    expect(s.items).toHaveLength(2);
  });

  test('ubahAddon tambah, ubah dan buang', () => {
    let s: Senarai = ubahAddon(KOSONG, 'lilin', 1);
    s = ubahAddon(s, 'kad', 1, 'Selamat');
    s = ubahAddon(s, 'lilin', 2);
    expect(s.addons).toEqual([{ addonId: 'lilin', qty: 2 }, { addonId: 'kad', qty: 1, text: 'Selamat' }]);
    expect(ubahAddon(s, 'lilin', 0).addons).toEqual([{ addonId: 'kad', qty: 1, text: 'Selamat' }]);
  });

  test('bacaSenarai tahan JSON rosak dan versi lain', () => {
    expect(bacaSenarai(null)).toEqual(KOSONG);
    expect(bacaSenarai('{rosak')).toEqual(KOSONG);
    expect(bacaSenarai(JSON.stringify({ v: 2, items: [a], addons: [] }))).toEqual(KOSONG);
    expect(bacaSenarai(JSON.stringify({ v: 1, items: [{ productId: 1 }], addons: [] }))).toEqual(KOSONG);
    const ok = { v: 1, items: [a], addons: [], harga: 10000 };
    expect(bacaSenarai(JSON.stringify(ok))).toEqual(ok);
  });
});
