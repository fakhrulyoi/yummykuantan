'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { requireAdminTindakan } from '@/lib/auth/admin';
import { TAG } from '@/lib/data/cache';
import { buangDrafKandungan, simpanDrafKandungan as simpan, terbitKandungan as terbit, type HasilKandungan } from '@/lib/data/kandunganAdmin';

/** Simpan draf; dengan `terbitkan` juga terbit terus. */
export async function simpanDrafKandungan(k: string, nilai: unknown, terbitkan = false): Promise<HasilKandungan> {
  const a = await requireAdminTindakan();
  const r = await simpan(k, nilai, a.userId);
  if (!r.ok || !terbitkan) {
    revalidatePath('/admin/kandungan');
    return r;
  }
  const t = await terbit(k, a.userId);
  revalidateTag(TAG.kandungan);
  revalidatePath('/admin/kandungan');
  return t;
}

export async function terbitKandungan(k: string): Promise<HasilKandungan> {
  const a = await requireAdminTindakan();
  const r = await terbit(k, a.userId);
  revalidateTag(TAG.kandungan);
  revalidatePath('/admin/kandungan');
  return r;
}

export async function buangDraf(k: string): Promise<HasilKandungan> {
  const a = await requireAdminTindakan();
  const r = await buangDrafKandungan(k, a.userId);
  revalidatePath('/admin/kandungan');
  return r;
}
