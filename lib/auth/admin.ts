import 'server-only';
import { eq } from 'drizzle-orm';
import { forbidden, redirect, unauthorized } from 'next/navigation';
import { cache } from 'react';
import { db } from '@/lib/data/db';
import * as s from '@/lib/data/skema';
import { supabaseServer } from './supabase';

export type Admin = { userId: string; name: string; role: 'OWNER' | 'STAFF' };

/** Pengguna Supabase semasa + profil admin. `null` jika tiada sesi sah atau tiada profil. Dicache untuk satu permintaan. */
export const adminSemasa = cache(async (): Promise<Admin | null> => {
  const sb = await supabaseServer();
  const { data, error } = await sb.auth.getUser();
  if (error || !data.user) return null;
  const [p] = await db.select().from(s.adminProfile).where(eq(s.adminProfile.userId, data.user.id));
  return p ? { userId: p.userId, name: p.name, role: p.role } : null;
});

/** Untuk halaman admin: tiada sesi → halaman log masuk; peranan tidak cukup → 403. */
export async function requireAdmin(peranan?: 'OWNER'): Promise<Admin> {
  const a = await adminSemasa();
  if (!a) redirect('/admin/login');
  if (peranan && a.role !== peranan) forbidden();
  return a;
}

/** Untuk server action admin: tiada sesi → 401; peranan tidak cukup → 403. */
export async function requireAdminTindakan(peranan?: 'OWNER'): Promise<Admin> {
  const a = await adminSemasa();
  if (!a) unauthorized();
  if (peranan && a.role !== peranan) forbidden();
  return a;
}
