import { NextResponse } from 'next/server';
import { adminSemasa } from '@/lib/auth/admin';
import { JENIS_GAMBAR, laluanTempatan, SAIZ_MAKS, tempatanDibenarkan, tulisTempatan } from '@/lib/data/storan';

/** Muat naik tempatan (pembangunan dan ujian sahaja). */
export async function PUT(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  if (!tempatanDibenarkan()) return NextResponse.json({ ralat: 'Tidak tersedia.' }, { status: 404 });
  if (!(await adminSemasa())) return NextResponse.json({ ralat: 'Sesi tamat.' }, { status: 401 });
  const p = laluanTempatan((await params).path);
  if (!p) return NextResponse.json({ ralat: 'Laluan tidak sah.' }, { status: 400 });
  if (!JENIS_GAMBAR[req.headers.get('content-type') ?? '']) return NextResponse.json({ ralat: 'Hanya gambar.' }, { status: 415 });
  const data = await req.arrayBuffer();
  if (data.byteLength > SAIZ_MAKS) return NextResponse.json({ ralat: 'Terlalu besar.' }, { status: 413 });
  await tulisTempatan(p, data);
  return new NextResponse(null, { status: 204 });
}
