'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdminTindakan } from '@/lib/auth/admin';
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
