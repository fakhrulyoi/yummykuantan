import { db } from './db';
import * as s from './skema';

type Pelaksana = Pick<typeof db, 'insert'>;

/** Rekod setiap perubahan oleh admin. `diff` ialah `{ medan: [lama, baru] }` atau ringkasan tindakan. */
export async function rekodAudit(userId: string, action: string, entity: string, entityId: string, diff: unknown, q: Pelaksana = db): Promise<void> {
  await q.insert(s.auditLog).values({ userId, action, entity, entityId, diff: (diff ?? {}) as object });
}
