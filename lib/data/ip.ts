import { headers } from 'next/headers';

/** IP pelanggan dari pengepala proksi Vercel; hanya untuk had kadar (disimpan sebagai hash). */
export async function ipPelanggan(): Promise<string> {
  const h = await headers();
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || '0.0.0.0';
}
