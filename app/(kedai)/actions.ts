'use server';

import { ipPelanggan } from '@/lib/data/ip';
import { semakStatus, simpanTempahan, simpanTempahanCepat, type HasilTempahan } from '@/lib/data/tempahan';

export async function buatTempahan(input: unknown): Promise<HasilTempahan> {
  const harga = (input as { harga?: unknown } | null)?.harga;
  return simpanTempahan(input, { ip: await ipPelanggan(), hargaPelanggan: typeof harga === 'number' ? harga : undefined });
}

export async function buatTempahanCepat(input: unknown): Promise<HasilTempahan> {
  return simpanTempahanCepat(input, { ip: await ipPelanggan() });
}

export async function semakTempahan(input: unknown) {
  const v = (input ?? {}) as { ref?: unknown; empat?: unknown };
  return semakStatus(String(v.ref ?? ''), String(v.empat ?? ''), await ipPelanggan());
}
