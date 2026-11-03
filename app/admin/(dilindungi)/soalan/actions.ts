'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { requireAdminTindakan } from '@/lib/auth/admin';
import { TAG } from '@/lib/data/cache';
import * as d from '@/lib/data/soalanAdmin';

function segar() {
  revalidateTag(TAG.soalan);
  revalidatePath('/admin/soalan');
}

export async function simpanDrafSoalan(id: string, q: string, a: string) {
  const u = await requireAdminTindakan();
  const r = await d.simpanDrafSoalan(id, q, a, u.userId);
  revalidatePath('/admin/soalan');
  return r;
}
export async function terbitSoalan(id: string) {
  const u = await requireAdminTindakan();
  const r = await d.terbitSoalan(id, u.userId);
  segar();
  return r;
}
export async function tunjukSoalan(id: string, visible: boolean) {
  const u = await requireAdminTindakan();
  const r = await d.tunjukSoalan(id, visible, u.userId);
  segar();
  return r;
}
export async function susunSoalan(ids: string[]) {
  const u = await requireAdminTindakan();
  const r = await d.susunSoalan(ids, u.userId);
  segar();
  return r;
}
export async function tambahSoalan() {
  const u = await requireAdminTindakan();
  await d.tambahSoalan(u.userId);
  revalidatePath('/admin/soalan');
}
export async function padamSoalan(id: string) {
  const u = await requireAdminTindakan('OWNER');
  const r = await d.padamSoalan(id, u.userId);
  segar();
  return r;
}
