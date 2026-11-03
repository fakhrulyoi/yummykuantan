import { revalidateTag } from 'next/cache';
import { TAG } from '@/lib/data/cache';

/** Hanya untuk ujian e2e (E2E=1): kosongkan cache selepas ujian mengubah DB secara terus. */
export async function POST() {
  if (process.env.E2E !== '1') return new Response('Tidak dijumpai', { status: 404 });
  Object.values(TAG).forEach((t) => revalidateTag(t));
  return Response.json({ ok: true });
}
