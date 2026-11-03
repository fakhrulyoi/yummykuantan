import path from 'node:path';
import { bacaTempatan, jenisDariExt, laluanTempatan, tempatanDibenarkan } from '@/lib/data/storan';

/** Hidang fail muat naik tempatan (pembangunan dan ujian sahaja). */
export async function GET(_: Request, { params }: { params: Promise<{ path: string[] }> }) {
  if (!tempatanDibenarkan()) return new Response('Tidak dijumpai', { status: 404 });
  const p = laluanTempatan((await params).path);
  if (!p) return new Response('Tidak dijumpai', { status: 404 });
  try {
    const data = await bacaTempatan(p);
    return new Response(new Uint8Array(data), { headers: { 'content-type': jenisDariExt(path.extname(p).slice(1)), 'cache-control': 'public, max-age=31536000, immutable' } });
  } catch {
    return new Response('Tidak dijumpai', { status: 404 });
  }
}
