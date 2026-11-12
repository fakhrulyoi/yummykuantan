import { describe, expect, test } from 'vitest';
import { medanRalat, skemaSemak, skemaTempahan, skemaTempahanCepat } from '@/lib/tempahan/skema';

const sah = {
  items: [{ productId: 'p1', sizeId: 's1', qty: 1 }],
  addons: [],
  mode: 'PICKUP',
  date: '2026-11-11',
  timeSlotId: 'slot1',
  name: 'Nur Aisyah',
  phone: '011-2302 3447',
  lamanWeb: '',
};

describe('skemaTempahan', () => {
  test('input sah diterima, telefon dinormalkan', () => {
    const r = skemaTempahan.safeParse(sah);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.phone).toBe('601123023447');
  });

  test('hantar tanpa alamat', () => {
    const r = skemaTempahan.safeParse({ ...sah, mode: 'DELIVERY', area: 'Kuantan' });
    expect(r.success).toBe(false);
    if (!r.success) expect(medanRalat(r.error).address).toBe('Sila isi alamat penghantaran');
  });

  test('alamat terlalu pendek dan kawasan wajib', () => {
    const r = skemaTempahan.safeParse({ ...sah, mode: 'DELIVERY', address: 'Jln 1' });
    expect(r.success).toBe(false);
    if (!r.success) {
      const m = medanRalat(r.error);
      expect(m.address).toBe('Sila isi alamat penghantaran');
      expect(m.area).toBe('Pilih kawasan penghantaran');
    }
  });

  test('kawasan di luar Kuantan dan Pekan ditolak', () => {
    expect(skemaTempahan.safeParse({ ...sah, mode: 'DELIVERY', area: 'Kuala Lumpur', address: 'No 5, Jalan Ampang' }).success).toBe(false);
  });

  test('perangkap bot', () => {
    expect(skemaTempahan.safeParse({ ...sah, lamanWeb: 'x' }).success).toBe(false);
  });

  test('nama dan telefon wajib', () => {
    const r = skemaTempahan.safeParse({ ...sah, name: '  ', phone: '' });
    expect(r.success).toBe(false);
    if (!r.success) {
      const m = medanRalat(r.error);
      expect(m.name).toBe('Sila isi nama');
      expect(m.phone).toBe('Sila isi nombor telefon');
    }
  });

  test('telefon tidak sah', () => {
    const r = skemaTempahan.safeParse({ ...sah, phone: '12345' });
    expect(r.success).toBe(false);
    if (!r.success) expect(medanRalat(r.error).phone).toBe('Nombor telefon tidak sah');
  });

  test('nota lebih 500 aksara dan lebih 20 item', () => {
    expect(skemaTempahan.safeParse({ ...sah, notes: 'a'.repeat(501) }).success).toBe(false);
    expect(skemaTempahan.safeParse({ ...sah, items: Array(21).fill(sah.items[0]) }).success).toBe(false);
  });
});

describe('skemaTempahanCepat dan skemaSemak', () => {
  test('tempahan cepat', () => {
    expect(skemaTempahanCepat.safeParse({ productId: 'p', sizeId: 's', qty: 1, date: '2026-11-11', lamanWeb: '' }).success).toBe(true);
    expect(skemaTempahanCepat.safeParse({ productId: 'p', sizeId: 's', qty: 1, lamanWeb: '' }).success).toBe(false);
    expect(skemaTempahanCepat.safeParse({ productId: 'p', sizeId: 's', qty: 11, date: '2026-11-11', lamanWeb: '' }).success).toBe(false);
    expect(skemaTempahanCepat.safeParse({ productId: 'p', sizeId: 's', qty: 1, cakeMessage: 'a'.repeat(31), date: '2026-11-11', lamanWeb: '' }).success).toBe(false);
  });

  test('semak status', () => {
    expect(skemaSemak.safeParse({ ref: 'YK-24117', empat: '3447' }).success).toBe(true);
    expect(skemaSemak.safeParse({ ref: 'yk-24117', empat: '3447' }).success).toBe(true);
    expect(skemaSemak.safeParse({ ref: 'YK-24', empat: '3447' }).success).toBe(false);
    expect(skemaSemak.safeParse({ ref: 'YK-24117', empat: '344' }).success).toBe(false);
  });
});
