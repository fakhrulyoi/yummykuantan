import 'server-only';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

export const BUCKET = ['produk', 'meja', 'hero'] as const;
export type Bucket = (typeof BUCKET)[number];
export const JENIS_GAMBAR: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif' };
export const SAIZ_MAKS = 10 * 1024 * 1024;

export type SediaMuatNaik =
  | { cara: 'supabase'; bucket: Bucket; path: string; token: string; url: string }
  | { cara: 'tempatan'; path: string; uploadUrl: string; url: string };

const supabaseAda = () => !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
/** Storan tempatan hanya untuk pembangunan dan ujian (Vercel tidak menyimpan fail). */
export const tempatanDibenarkan = () => process.env.NODE_ENV !== 'production' || process.env.E2E === '1';
export const DIR_TEMPATAN = path.resolve(process.env.UPLOAD_DIR ?? '.muatnaik');

/** Sediakan URL muat naik (URL bertanda tangan Supabase, atau laluan tempatan semasa pembangunan). */
export async function sediaMuatNaik(bucket: Bucket, jenis: string): Promise<SediaMuatNaik | null> {
  const ext = JENIS_GAMBAR[jenis];
  const nama = `${new Date().getFullYear()}/${randomUUID()}.${ext}`;
  if (supabaseAda()) {
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
    const { data, error } = await sb.storage.from(bucket).createSignedUploadUrl(nama);
    if (error || !data) throw new Error(`Supabase Storage: ${error?.message ?? 'tiada data'}`);
    return { cara: 'supabase', bucket, path: data.path, token: data.token, url: sb.storage.from(bucket).getPublicUrl(data.path).data.publicUrl };
  }
  if (!tempatanDibenarkan()) return null;
  const p = `${bucket}/${nama}`;
  return { cara: 'tempatan', path: p, uploadUrl: `/api/upload/tempatan/${p}`, url: `/api/fail/${p}` };
}

/** Laluan fail tempatan yang selamat (tiada `..`), atau null. */
export function laluanTempatan(bahagian: string[]): string | null {
  const p = path.resolve(DIR_TEMPATAN, ...bahagian);
  if (!p.startsWith(DIR_TEMPATAN + path.sep)) return null;
  if (!BUCKET.includes(bahagian[0] as Bucket)) return null;
  if (!JENIS_GAMBAR_EXT.has(path.extname(p).slice(1))) return null;
  return p;
}
const JENIS_GAMBAR_EXT = new Set(Object.values(JENIS_GAMBAR));
export const jenisDariExt = (ext: string) => Object.entries(JENIS_GAMBAR).find(([, e]) => e === ext)?.[0] ?? 'application/octet-stream';

export async function tulisTempatan(p: string, data: ArrayBuffer): Promise<void> {
  await mkdir(path.dirname(p), { recursive: true });
  await writeFile(p, Buffer.from(data));
}
export const bacaTempatan = (p: string) => readFile(p);
