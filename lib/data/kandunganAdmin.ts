import { eq } from 'drizzle-orm';
import type { KunciKandungan, NilaiKandungan } from '@/lib/kandungan/jenis';
import { KUNCI_KANDUNGAN } from '@/lib/kandungan/jenis';
import { SKEMA_KANDUNGAN } from '@/lib/kandungan/skema';
import { rekodAudit } from './audit';
import { db } from './db';
import * as s from './skema';
import { urlGambarSah } from './urlGambar';

export type HasilKandungan = { ok: true } | { ok: false; ralat: string };
export const kunciSah = (k: string): k is KunciKandungan => (KUNCI_KANDUNGAN as string[]).includes(k);

/** Draf jika ada, jika tidak versi diterbitkan. Tidak dicache (untuk admin). */
export async function bacaUntukSunting<K extends KunciKandungan>(k: K): Promise<{ nilai: NilaiKandungan[K]; terbit: NilaiKandungan[K]; adaDraf: boolean }> {
  const [r] = await db.select().from(s.siteContent).where(eq(s.siteContent.key, k));
  if (!r) throw new Error(`Kandungan ${k} tiada`);
  return { nilai: (r.draft ?? r.value) as NilaiKandungan[K], terbit: r.value as NilaiKandungan[K], adaDraf: r.draft !== null };
}

function semakGambar(k: KunciKandungan, v: unknown): boolean {
  if (k === 'hero') return (v as NilaiKandungan['hero']).gambar.every((g) => urlGambarSah(g.url));
  if (k === 'galeri') return (v as NilaiKandungan['galeri']).gambar.every(urlGambarSah);
  return true;
}

export async function simpanDrafKandungan(k: string, nilai: unknown, userId: string): Promise<HasilKandungan> {
  if (!kunciSah(k)) return { ok: false, ralat: 'Bahagian tidak sah.' };
  const p = SKEMA_KANDUNGAN[k].safeParse(nilai);
  if (!p.success) return { ok: false, ralat: p.error.issues[0]?.message ?? 'Sila semak borang.' };
  if (!semakGambar(k, p.data)) return { ok: false, ralat: 'Alamat gambar tidak sah.' };
  await db.update(s.siteContent).set({ draft: p.data as object }).where(eq(s.siteContent.key, k));
  await rekodAudit(userId, 'draf_kandungan', 'site_content', k, {});
  return { ok: true };
}

export async function terbitKandungan(k: string, userId: string): Promise<HasilKandungan> {
  if (!kunciSah(k)) return { ok: false, ralat: 'Bahagian tidak sah.' };
  const [r] = await db.select().from(s.siteContent).where(eq(s.siteContent.key, k));
  if (!r?.draft) return { ok: true };
  await db.update(s.siteContent).set({ value: r.draft, draft: null }).where(eq(s.siteContent.key, k));
  await rekodAudit(userId, 'terbit_kandungan', 'site_content', k, { sebelum: r.value });
  return { ok: true };
}

export async function buangDrafKandungan(k: string, userId: string): Promise<HasilKandungan> {
  if (!kunciSah(k)) return { ok: false, ralat: 'Bahagian tidak sah.' };
  await db.update(s.siteContent).set({ draft: null }).where(eq(s.siteContent.key, k));
  await rekodAudit(userId, 'buang_draf_kandungan', 'site_content', k, {});
  return { ok: true };
}
