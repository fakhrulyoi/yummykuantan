import { asc, eq } from 'drizzle-orm';
import { db } from './db';
import * as s from './skema';

type Pelaksana = Pick<typeof db, 'select'>;

export type Tetapan = typeof s.settings.$inferSelect;

export async function bacaTetapan(q: Pelaksana = db): Promise<Tetapan> {
  const [t] = await q.select().from(s.settings).where(eq(s.settings.id, 1));
  if (!t) throw new Error('Tetapan belum dimasukkan (jalankan npm run db:seed)');
  return t;
}

export async function senaraiSlot(q: Pelaksana = db) {
  return q.select().from(s.timeSlot).orderBy(asc(s.timeSlot.sortOrder));
}

export async function senaraiHariTutup(q: Pelaksana = db): Promise<Set<string>> {
  const r = await q.select({ date: s.closedDate.date }).from(s.closedDate);
  return new Set(r.map((x) => x.date));
}
