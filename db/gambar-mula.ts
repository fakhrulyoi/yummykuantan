import { readFile } from 'node:fs/promises';
import path from 'node:path';

const DIR = path.join(process.cwd(), 'public', 'seed');

/**
 * Pulangkan URL gambar data mula. Bila Supabase ditetapkan, gambar dimuat naik ke
 * bucket (upsert) dan URL awam dipulangkan; jika tidak, guna fail dalam public/seed.
 */
export async function urlGambarMula(fail: string, bucket: 'produk' | 'meja'): Promise<string> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const kunci = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !kunci) return `/seed/${fail}`;
  const badan = await readFile(path.join(DIR, fail));
  const jenis = fail.endsWith('.webp') ? 'image/webp' : 'image/jpeg';
  const r = await fetch(`${url}/storage/v1/object/${bucket}/mula/${fail}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${kunci}`, 'Content-Type': jenis, 'x-upsert': 'true' },
    body: badan,
  });
  if (!r.ok) throw new Error(`Muat naik ${fail} gagal: ${r.status} ${await r.text()}`);
  return `${url}/storage/v1/object/public/${bucket}/mula/${fail}`;
}
