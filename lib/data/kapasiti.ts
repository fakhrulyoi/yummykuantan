import { and, gte, inArray, lte, ne } from 'drizzle-orm';
import { bakiSlot } from '@/lib/tempahan/slot';
import { db } from './db';
import * as s from './skema';
import { bacaTetapan, senaraiHariTutup, senaraiSlot } from './tetapan';

export type BakiHari = { tarikh: string; tutup: boolean; harian: number; slot: Record<string, number>; jumlahSlot: number };

/** Baki tempat bagi setiap tarikh (data langsung, tidak dicache). */
export async function bakiTarikh(tarikh: string[], now = new Date()): Promise<{ hari: BakiHari[]; slot: { id: string; label: string; active: boolean }[] }> {
  if (!tarikh.length) return { hari: [], slot: [] };
  const [tetapan, tutup, slot, tempahan] = await Promise.all([
    bacaTetapan(),
    senaraiHariTutup(),
    senaraiSlot(),
    db
      .select({ date: s.order.date, timeSlotId: s.order.timeSlotId, status: s.order.status, createdAt: s.order.createdAt })
      .from(s.order)
      .where(and(gte(s.order.date, tarikh[0]), lte(s.order.date, tarikh[tarikh.length - 1]), inArray(s.order.date, tarikh), ne(s.order.status, 'DIBATALKAN'))),
  ]);
  const kira = slot.map((z) => ({ id: z.id, capacity: z.capacity, active: z.active }));
  const hari = tarikh.map((t) => {
    if (tutup.has(t)) return { tarikh: t, tutup: true, harian: 0, slot: Object.fromEntries(slot.map((z) => [z.id, 0])), jumlahSlot: 0 };
    const b = bakiSlot(t, kira, tetapan.dailyCapacity, tempahan.filter((o) => o.date === t).map((o) => ({ ...o, date: o.date! })), now, tetapan.holdHours);
    const jumlahSlot = Math.min(b.harian, Object.values(b.slot).reduce((a, n) => a + n, 0));
    return { tarikh: t, tutup: false, harian: b.harian, slot: b.slot, jumlahSlot };
  });
  return { hari, slot: slot.filter((z) => z.active).map((z) => ({ id: z.id, label: z.label, active: z.active })) };
}
