import { describe, expect, test } from 'vitest';
import { bakiSlot, type TempahanKiraan } from '@/lib/tempahan/slot';

const now = new Date('2026-11-03T08:00:00Z');
const jamLalu = (j: number) => new Date(now.getTime() - j * 3600_000);
const slot = [
  { id: 'pagi', capacity: 3, active: true },
  { id: 'petang', capacity: 2, active: true },
  { id: 'lewat', capacity: 2, active: true },
];
const t = (timeSlotId: string | null, status: TempahanKiraan['status'], jam = 1, date = '2026-11-11'): TempahanKiraan => ({
  date, timeSlotId, status, createdAt: jamLalu(jam),
});

describe('bakiSlot', () => {
  test('tempahan batal tidak dikira', () => {
    const r = bakiSlot('2026-11-11', slot, 12, [t('petang', 'DISAHKAN'), t('petang', 'DIBATALKAN')], now, 48);
    expect(r.slot.petang).toBe(1);
    expect(r.harian).toBe(11);
  });

  test('BARU_WA dilepaskan selepas holdHours', () => {
    expect(bakiSlot('2026-11-11', slot, 12, [t('petang', 'BARU_WA', 49)], now, 48).slot.petang).toBe(2);
    expect(bakiSlot('2026-11-11', slot, 12, [t('petang', 'BARU_WA', 47)], now, 48).slot.petang).toBe(1);
  });

  test('kapasiti harian penuh menutup semua slot', () => {
    const r = bakiSlot('2026-11-11', slot, 2, [t('pagi', 'DISAHKAN'), t('pagi', 'DISAHKAN')], now, 48);
    expect(r).toEqual({ harian: 0, slot: { pagi: 0, petang: 0, lewat: 0 } });
  });

  test('tempahan tanpa slot dikira dalam harian sahaja', () => {
    const r = bakiSlot('2026-11-11', slot, 3, [t(null, 'DISAHKAN'), t(null, 'DISAHKAN')], now, 48);
    expect(r).toEqual({ harian: 1, slot: { pagi: 1, petang: 1, lewat: 1 } });
  });

  test('tarikh lain tidak dikira, baki tidak negatif, slot tidak aktif 0', () => {
    const tutup = [...slot.slice(0, 2), { id: 'lewat', capacity: 2, active: false }];
    const r = bakiSlot('2026-11-11', tutup, 12, [t('petang', 'DISAHKAN'), t('petang', 'DISAHKAN'), t('petang', 'DISAHKAN'), t('pagi', 'DISAHKAN', 1, '2026-11-12')], now, 48);
    expect(r.slot).toEqual({ pagi: 3, petang: 0, lewat: 0 });
  });
});
