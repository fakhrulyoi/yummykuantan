'use client';

import { createClient } from '@supabase/supabase-js';

const JENIS = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAKS = 10 * 1024 * 1024;

export type HasilMuatNaik = { ok: true; url: string } | { ok: false; ralat: string };

/** Muat naik satu gambar terus ke storan (Supabase atau tempatan semasa pembangunan). */
export async function muatNaikGambar(fail: Blob, bucket: 'produk' | 'meja' | 'hero'): Promise<HasilMuatNaik> {
  if (!JENIS.includes(fail.type)) return { ok: false, ralat: 'Hanya gambar (JPG, PNG, WebP atau AVIF) dibenarkan.' };
  if (fail.size > MAKS) return { ok: false, ralat: 'Gambar terlalu besar. Maksimum 10 MB.' };
  try {
    const r = await fetch('/api/upload', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ bucket, jenis: fail.type, saiz: fail.size }) });
    const v = await r.json();
    if (!r.ok) return { ok: false, ralat: v.ralat ?? 'Muat naik gagal.' };
    if (v.cara === 'supabase') {
      const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } });
      const { error } = await sb.storage.from(v.bucket).uploadToSignedUrl(v.path, v.token, fail, { contentType: fail.type });
      if (error) return { ok: false, ralat: 'Muat naik gagal. Cuba lagi.' };
    } else {
      const u = await fetch(v.uploadUrl, { method: 'PUT', body: fail, headers: { 'content-type': fail.type } });
      if (!u.ok) return { ok: false, ralat: 'Muat naik gagal. Cuba lagi.' };
    }
    return { ok: true, url: v.url };
  } catch {
    return { ok: false, ralat: 'Muat naik gagal. Semak sambungan internet.' };
  }
}
