import type { OrderStatus } from './jenis';

export type TempahanKiraan = { date: string; timeSlotId: string | null; status: OrderStatus; createdAt: Date };
export type SlotKiraan = { id: string; capacity: number; active: boolean };

/** Tempahan yang masih memegang tempat pada tarikh itu. */
export function dikira(t: TempahanKiraan, now: Date, holdHours: number): boolean {
  if (t.status === 'DIBATALKAN') return false;
  if (t.status === 'BARU_WA') return now.getTime() - t.createdAt.getTime() < holdHours * 3600_000;
  return true;
}

export function bakiSlot(
  tarikh: string,
  slot: SlotKiraan[],
  dailyCapacity: number,
  tempahan: TempahanKiraan[],
  now: Date,
  holdHours: number,
): { harian: number; slot: Record<string, number> } {
  const aktif = tempahan.filter((t) => t.date === tarikh && dikira(t, now, holdHours));
  const harian = Math.max(0, dailyCapacity - aktif.length);
  const baki: Record<string, number> = {};
  for (const s of slot) {
    const guna = aktif.filter((t) => t.timeSlotId === s.id).length;
    baki[s.id] = s.active ? Math.max(0, Math.min(s.capacity - guna, harian)) : 0;
  }
  return { harian, slot: baki };
}
