import { resetDb, seedDb } from '../db';

/** Pulihkan DB e2e ke data mula. Panggil dalam beforeEach bagi ujian yang mengubah data. */
export async function dataMula(): Promise<void> {
  await resetDb();
  await seedDb();
}
