import type { APIRequestContext } from '@playwright/test';
import { resetDb, seedDb } from '../db';

/** Kosongkan cache pelayan selepas ujian mengubah DB secara terus. */
export async function segarkan(request: APIRequestContext): Promise<void> {
  const r = await request.post('/api/ujian/segar');
  if (!r.ok()) throw new Error(`segar gagal: ${r.status()}`);
}

/** Pulihkan DB e2e ke data mula dan kosongkan cache. */
export async function dataMula(request: APIRequestContext): Promise<void> {
  await resetDb();
  await seedDb();
  await segarkan(request);
}
