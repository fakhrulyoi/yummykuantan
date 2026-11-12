import { describe, expect, test } from 'vitest';
import { langkahSeterusnya } from '@/lib/data/labelStatus';

describe('langkahSeterusnya', () => {
  test('aliran biasa ambil sendiri dan hantar', () => {
    expect(langkahSeterusnya('BARU_WA', 'PICKUP')?.status).toBe('MENUNGGU_BAYARAN');
    expect(langkahSeterusnya('MENUNGGU_BAYARAN', null)?.status).toBe('DISAHKAN');
    expect(langkahSeterusnya('DISAHKAN', 'PICKUP')?.status).toBe('DALAM_PENYEDIAAN');
    expect(langkahSeterusnya('DALAM_PENYEDIAAN', 'PICKUP')).toEqual({ status: 'SEDIA_DIAMBIL', label: 'Sedia diambil' });
    expect(langkahSeterusnya('DALAM_PENYEDIAAN', 'DELIVERY')).toEqual({ status: 'DALAM_PENGHANTARAN', label: 'Mula hantar' });
    expect(langkahSeterusnya('SEDIA_DIAMBIL', 'PICKUP')?.status).toBe('SELESAI');
    expect(langkahSeterusnya('SELESAI', 'PICKUP')).toBeNull();
    expect(langkahSeterusnya('DIBATALKAN', 'PICKUP')).toBeNull();
  });
});
