'use server';

import { eq, sql } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { supabaseServer } from '@/lib/auth/supabase';
import { db } from '@/lib/data/db';
import { hadKadar, hashIp } from '@/lib/data/hadKadar';
import { ipPelanggan } from '@/lib/data/ip';
import * as s from '@/lib/data/skema';

const GAGAL_MAKS = 5;
const TETINGKAP = 15 * 60;

export type HasilLogMasuk = { ralat: string; emel?: string } | undefined;

const skema = z.object({ emel: z.email().max(200), kataLaluan: z.string().min(1).max(200) });

async function bilGagal(kunci: string, now: Date): Promise<number> {
  const mula = new Date(Math.floor(now.getTime() / (TETINGKAP * 1000)) * TETINGKAP * 1000);
  const r = await db.execute<{ count: number }>(sql`SELECT count FROM rate_limit WHERE key = ${kunci} AND window_start = ${mula.toISOString()}`);
  return Number(r.rows[0]?.count ?? 0);
}

export async function logMasuk(_: HasilLogMasuk, form: FormData): Promise<HasilLogMasuk> {
  const now = new Date();
  const p = skema.safeParse({ emel: String(form.get('emel') ?? '').trim().toLowerCase(), kataLaluan: String(form.get('kataLaluan') ?? '') });
  if (!p.success) return { ralat: 'Isi emel dan kata laluan.', emel: String(form.get('emel') ?? '').slice(0, 200) };
  const kunci = `login:${hashIp(await ipPelanggan())}:${p.data.emel}`;
  const sekat = { ralat: 'Terlalu banyak cubaan. Cuba lagi selepas 15 minit.', emel: p.data.emel };
  if ((await bilGagal(kunci, now)) >= GAGAL_MAKS) return sekat;

  const sb = await supabaseServer();
  const { data, error } = await sb.auth.signInWithPassword({ email: p.data.emel, password: p.data.kataLaluan });
  if (error || !data.user) {
    const masih = await hadKadar(kunci, GAGAL_MAKS - 1, TETINGKAP, now);
    return masih ? { ralat: 'Emel atau kata laluan salah.', emel: p.data.emel } : sekat;
  }
  const [profil] = await db.select({ userId: s.adminProfile.userId }).from(s.adminProfile).where(eq(s.adminProfile.userId, data.user.id));
  if (!profil) {
    await sb.auth.signOut();
    return { ralat: 'Akaun ini tiada akses admin. Hubungi pemilik kedai.', emel: p.data.emel };
  }
  redirect('/admin');
}

export async function logKeluar(): Promise<void> {
  const sb = await supabaseServer();
  await sb.auth.signOut();
  redirect('/admin/login');
}
