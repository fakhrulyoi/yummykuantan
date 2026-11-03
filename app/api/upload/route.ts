import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminSemasa } from '@/lib/auth/admin';
import { hadKadar } from '@/lib/data/hadKadar';
import { BUCKET, JENIS_GAMBAR, SAIZ_MAKS, sediaMuatNaik } from '@/lib/data/storan';

const skema = z.object({ bucket: z.enum(BUCKET), jenis: z.string().max(60), saiz: z.number().int().min(1) });

/** Pentadbir minta URL muat naik. Fail dihantar terus ke storan, bukan melalui pelayan ini. */
export async function POST(req: Request) {
  const a = await adminSemasa();
  if (!a) return NextResponse.json({ ralat: 'Sesi tamat. Sila log masuk semula.' }, { status: 401 });
  const p = skema.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ ralat: 'Permintaan tidak sah.' }, { status: 400 });
  if (!JENIS_GAMBAR[p.data.jenis]) return NextResponse.json({ ralat: 'Hanya gambar (JPG, PNG, WebP atau AVIF) dibenarkan.' }, { status: 415 });
  if (p.data.saiz > SAIZ_MAKS) return NextResponse.json({ ralat: 'Gambar terlalu besar. Maksimum 10 MB.' }, { status: 413 });
  if (!(await hadKadar(`upload:${a.userId}`, 120, 3600))) return NextResponse.json({ ralat: 'Terlalu banyak muat naik. Cuba lagi sebentar.' }, { status: 429 });
  const r = await sediaMuatNaik(p.data.bucket, p.data.jenis);
  if (!r) return NextResponse.json({ ralat: 'Storan gambar belum disediakan (Supabase).' }, { status: 503 });
  return NextResponse.json(r);
}
