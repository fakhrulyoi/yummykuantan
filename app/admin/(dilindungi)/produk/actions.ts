'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { requireAdminTindakan } from '@/lib/auth/admin';
import { rekodAudit } from '@/lib/data/audit';
import { db } from '@/lib/data/db';
import * as s from '@/lib/data/skema';
import { urlGambarSah } from '@/lib/data/urlGambar';
import { TAG } from '@/lib/data/cache';
import { ciptaProduk, padamProduk, simpanDrafProduk, terbitProduk, type HasilProduk } from '@/lib/data/terbit';

function segar(id?: string) {
  revalidatePath('/admin/produk');
  if (id) revalidatePath(`/admin/produk/${id}`);
}

export async function simpanDraf(id: string, draf: unknown): Promise<HasilProduk> {
  const a = await requireAdminTindakan();
  const r = await simpanDrafProduk(id, draf, a.userId);
  if (r.ok) segar(id);
  return r;
}

/** Simpan borang semasa sebagai draf, kemudian terbitkan ke laman. */
export async function terbit(id: string, draf: unknown): Promise<HasilProduk> {
  const a = await requireAdminTindakan();
  const d = await simpanDrafProduk(id, draf, a.userId);
  if (!d.ok) return d;
  const r = await terbitProduk(id, a.userId);
  if (r.ok) {
    revalidateTag(TAG.produk);
    segar(id);
  }
  return r;
}

export async function tambahProduk(): Promise<void> {
  const a = await requireAdminTindakan();
  const id = await ciptaProduk('Kek baru', a.userId);
  segar();
  redirect(`/admin/produk/${id}`);
}

export async function padam(id: string): Promise<{ ok: true; dipadam: boolean } | { ok: false; ralat: string }> {
  const a = await requireAdminTindakan('OWNER');
  const r = await padamProduk(id, a.userId);
  if (r.ok) {
    revalidateTag(TAG.produk);
    segar(id);
  }
  return r;
}

type HasilMeja = { ok: true } | { ok: false; ralat: string };

async function produkMeja(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [p] = await db.select({ id: s.product.id, url: s.product.tableImageUrl, asal: s.product.tableImageOriginalUrl, draf: s.product.tableImageDraftUrl }).from(s.product).where(eq(s.product.id, id));
  return p ?? null;
}

export async function simpanDrafGambarMeja(productId: string, url: string): Promise<HasilMeja> {
  const a = await requireAdminTindakan();
  if (!urlGambarSah(url)) return { ok: false, ralat: 'Alamat gambar tidak sah.' };
  const p = await produkMeja(productId);
  if (!p) return { ok: false, ralat: 'Produk tidak dijumpai.' };
  await db.update(s.product).set({ tableImageDraftUrl: url }).where(eq(s.product.id, productId));
  await rekodAudit(a.userId, 'draf_gambar_meja', 'product', productId, { tableImageDraftUrl: [p.draf, url] });
  segar(productId);
  return { ok: true };
}

/** Gambar draf jadi gambar meja; gambar semasa disimpan sebagai "sebelum ini". */
export async function terbitGambarMeja(productId: string): Promise<HasilMeja> {
  const a = await requireAdminTindakan();
  const p = await produkMeja(productId);
  if (!p) return { ok: false, ralat: 'Produk tidak dijumpai.' };
  if (!p.draf) return { ok: false, ralat: 'Tiada gambar baru untuk diterbitkan.' };
  await db.update(s.product).set({ tableImageUrl: p.draf, tableImageOriginalUrl: p.url, tableImageDraftUrl: null }).where(eq(s.product.id, productId));
  await rekodAudit(a.userId, 'terbit_gambar_meja', 'product', productId, { tableImageUrl: [p.url, p.draf] });
  revalidateTag(TAG.produk);
  segar(productId);
  return { ok: true };
}

/** Kembali ke gambar sebelum ini (gambar semasa pula disimpan sebagai "sebelum ini"). */
export async function pulihGambarMeja(productId: string): Promise<HasilMeja> {
  const a = await requireAdminTindakan();
  const p = await produkMeja(productId);
  if (!p) return { ok: false, ralat: 'Produk tidak dijumpai.' };
  if (!p.asal) return { ok: false, ralat: 'Tiada gambar sebelum ini.' };
  await db.update(s.product).set({ tableImageUrl: p.asal, tableImageOriginalUrl: p.url, tableImageDraftUrl: null }).where(eq(s.product.id, productId));
  await rekodAudit(a.userId, 'pulih_gambar_meja', 'product', productId, { tableImageUrl: [p.url, p.asal] });
  revalidateTag(TAG.produk);
  segar(productId);
  return { ok: true };
}
