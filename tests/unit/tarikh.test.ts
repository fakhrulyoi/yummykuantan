import { describe, expect, test } from 'vitest';
import { hariIniMYT, jalurTarikh, tambahHari, tarikhAwal, tarikhDibenarkan, tarikhPenuh } from '@/lib/tempahan/tarikh';

// 00:30 waktu Malaysia, 4 November 2026 (masih 3 November di UTC)
const now = new Date('2026-11-03T16:30:00Z');

describe('tarikh dalam waktu Malaysia', () => {
  test('hari ini ikut MYT, bukan UTC', () => {
    expect(hariIniMYT(now)).toBe('2026-11-04');
    expect(hariIniMYT(new Date('2026-11-03T15:59:00Z'))).toBe('2026-11-03');
  });

  test('tarikh paling awal', () => {
    expect(tarikhAwal(now, [3], 3)).toBe('2026-11-07');
    expect(tarikhAwal(now, [3, 7], 3)).toBe('2026-11-11');
    expect(tarikhAwal(now, [], 5)).toBe('2026-11-09');
    expect(tarikhAwal(now, [1], 3)).toBe('2026-11-07');
  });

  test('tambahHari merentas bulan dan tahun', () => {
    expect(tambahHari('2026-11-29', 3)).toBe('2026-12-02');
    expect(tambahHari('2026-12-30', 3)).toBe('2027-01-02');
  });

  test('tarikhDibenarkan', () => {
    const tutup = new Set(['2026-11-08']);
    expect(tarikhDibenarkan('2026-11-07', now, [3], 3, tutup)).toEqual({ ok: true });
    expect(tarikhDibenarkan('2026-11-06', now, [3], 3, tutup)).toEqual({ ok: false, sebab: 'TERLALU_AWAL' });
    expect(tarikhDibenarkan('2026-11-08', now, [3], 3, tutup)).toEqual({ ok: false, sebab: 'HARI_TUTUP' });
    expect(tarikhDibenarkan('2026-11-09', now, [3, 7], 3, tutup)).toEqual({ ok: false, sebab: 'TERLALU_AWAL' });
    expect(tarikhDibenarkan('11/07/2026', now, [3], 3, tutup)).toEqual({ ok: false, sebab: 'FORMAT' });
    expect(tarikhDibenarkan('2026-02-30', now, [3], 3, tutup)).toEqual({ ok: false, sebab: 'FORMAT' });
  });

  test('jalur 14 hari bermula hari ini MYT', () => {
    const j = jalurTarikh(now, 14);
    expect(j).toHaveLength(14);
    expect(j[0]).toBe('2026-11-04');
    expect(j[13]).toBe('2026-11-17');
  });

  test('tarikhPenuh dalam Bahasa Melayu', () => {
    expect(tarikhPenuh('2026-11-11')).toBe('Rabu, 11 November 2026');
    expect(tarikhPenuh('2026-11-08')).toBe('Ahad, 8 November 2026');
    expect(tarikhPenuh('2027-01-01')).toBe('Jumaat, 1 Januari 2027');
  });
});
