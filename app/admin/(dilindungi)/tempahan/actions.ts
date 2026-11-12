'use server';

import { and, eq, ne } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdminTindakan } from '@/lib/auth/admin';
import { rekodAudit } from '@/lib/data/audit';
import { db } from '@/lib/data/db';
import { binaPautanBalas } from '@/lib/data/adminTempahan';
import * as s from '@/lib/data/skema';
import { bacaTetapan, senaraiHariTutup } from '@/lib/data/tetapan';
import { STATUS_TEMPAHAN, type OrderStatus } from '@/lib/tempahan/jenis';
import { bakiSlot } from '@/lib/tempahan/slot';
import { formatTelefon } from '@/lib/tempahan/telefon';

export type HasilAdmin = { ok: true; mesej?: string } | { ok: false; ralat: string };

const uuid = z.uuid();

async function ambil(id: string) {
  if (!uuid.safeParse(id).success) return null;
  const [o] = await db.select().from(s.order).where(eq(s.order.id, id));
  return o ?? null;
}

function segar(id: string) {
  revalidatePath('/admin');
  revalidatePath('/admin/tempahan');
  revalidatePath(`/admin/tempahan/${id}`);
}

export async function tukarStatus(id: string, status: OrderStatus): Promise<HasilAdmin> {
  const a = await requireAdminTindakan();
  if (!(STATUS_TEMPAHAN as readonly string[]).includes(status)) return { ok: false, ralat: 'Status tidak sah.' };
  const o = await ambil(id);
  if (!o) return { ok: false, ralat: 'Tempahan tidak dijumpai.' };
  if (o.status === status) return { ok: true, mesej: 'Tiada perubahan.' };
  await db.transaction(async (tx) => {
    await tx.update(s.order).set({ status }).where(eq(s.order.id, id));
    await rekodAudit(a.userId, 'tukar_status', 'order', id, { status: [o.status, status] }, tx);
  });
  segar(id);
  return { ok: true, mesej: 'Status dikemas kini.' };
}

const skemaKemaskini = z.object({
  date: z.union([z.literal(''), z.iso.date()]).optional(),
  timeSlotId: z.union([z.literal(''), z.uuid()]).optional(),
  customerName: z.string().trim().max(60).optional(),
  phone: z.string().trim().max(30).optional(),
  address: z.string().trim().max(300).optional(),
  deliveryFeeSen: z.number().int().min(0).max(100_000).nullable().optional(),
});

export async function kemaskiniTempahan(id: string, data: z.input<typeof skemaKemaskini>): Promise<HasilAdmin> {
  const a = await requireAdminTindakan();
  const p = skemaKemaskini.safeParse(data);
  if (!p.success) return { ok: false, ralat: 'Sila semak medan yang diisi.' };
  const v = p.data;
  const o = await ambil(id);
  if (!o) return { ok: false, ralat: 'Tempahan tidak dijumpai.' };

  const baru: Partial<typeof s.order.$inferInsert> = {};
  if (v.customerName !== undefined) baru.customerName = v.customerName || null;
  if (v.address !== undefined) baru.address = v.address || null;
  if (v.deliveryFeeSen !== undefined) baru.deliveryFeeSen = v.deliveryFeeSen;
  if (v.phone !== undefined) {
    if (!v.phone) baru.phone = null;
    else {
      const t = formatTelefon(v.phone);
      if (!t) return { ok: false, ralat: 'Nombor telefon tidak sah.' };
      baru.phone = t;
    }
  }
  if (v.date !== undefined) baru.date = v.date || null;
  if (v.timeSlotId !== undefined) baru.timeSlotId = v.timeSlotId || null;
  const tarikh = baru.date !== undefined ? baru.date : o.date;
  const slot = baru.timeSlotId !== undefined ? baru.timeSlotId : o.timeSlotId;
  const tarikhBerubah = tarikh !== o.date || slot !== o.timeSlotId;
  if (tarikh && !slot && o.kind === 'LIST') return { ok: false, ralat: 'Pilih slot masa untuk tarikh ini.' };

  try {
    await db.transaction(
      async (tx) => {
        if (tarikh && tarikhBerubah && o.status !== 'DIBATALKAN') {
          const [tetapan, tutup] = await Promise.all([bacaTetapan(tx), senaraiHariTutup(tx)]);
          if (tutup.has(tarikh)) throw new Error('Kedai tutup pada tarikh ini.');
          const semuaSlot = await tx.select({ id: s.timeSlot.id, capacity: s.timeSlot.capacity, active: s.timeSlot.active }).from(s.timeSlot);
          const lain = await tx
            .select({ date: s.order.date, timeSlotId: s.order.timeSlotId, status: s.order.status, createdAt: s.order.createdAt })
            .from(s.order)
            .where(and(eq(s.order.date, tarikh), ne(s.order.id, id), ne(s.order.status, 'DIBATALKAN')));
          const b = bakiSlot(tarikh, semuaSlot, tetapan.dailyCapacity, lain.map((x) => ({ ...x, date: x.date! })), new Date(), tetapan.holdHours);
          if (b.harian <= 0 || (slot && (b.slot[slot] ?? 0) <= 0)) throw new Error('Slot ini penuh. Pilih tarikh atau slot lain.');
        }
        const ubah = Object.fromEntries(Object.entries(baru).filter(([k, val]) => (o as Record<string, unknown>)[k] !== val));
        if (!Object.keys(ubah).length) return;
        await tx.update(s.order).set(ubah).where(eq(s.order.id, id));
        await rekodAudit(a.userId, 'kemaskini', 'order', id, Object.fromEntries(Object.keys(ubah).map((k) => [k, [(o as Record<string, unknown>)[k], ubah[k]]])), tx);
      },
      { isolationLevel: 'serializable' },
    );
  } catch (e) {
    const m = e instanceof Error ? e.message : '';
    if (m.startsWith('Slot ini penuh') || m.startsWith('Kedai tutup')) return { ok: false, ralat: m };
    if ((e as { code?: string })?.code === '40001') return { ok: false, ralat: 'Slot ini penuh. Pilih tarikh atau slot lain.' };
    throw e;
  }
  segar(id);
  return { ok: true, mesej: 'Butiran disimpan.' };
}

export async function tandaBayar(id: string, dibayar: boolean): Promise<HasilAdmin> {
  const a = await requireAdminTindakan();
  const o = await ambil(id);
  if (!o) return { ok: false, ralat: 'Tempahan tidak dijumpai.' };
  const paidAt = dibayar ? new Date() : null;
  await db.transaction(async (tx) => {
    await tx.update(s.order).set({ paidAt }).where(eq(s.order.id, id));
    await rekodAudit(a.userId, dibayar ? 'tanda_bayar' : 'batal_bayar', 'order', id, { paidAt: [o.paidAt, paidAt] }, tx);
  });
  segar(id);
  return { ok: true, mesej: dibayar ? 'Ditanda sudah bayar.' : 'Tanda bayar dibuang.' };
}

/** Pautan WhatsApp ke pelanggan dengan templat ikut status semasa. */
export async function pautanBalas(id: string): Promise<string> {
  await requireAdminTindakan();
  const o = await ambil(id);
  if (!o?.phone) return '';
  return binaPautanBalas(o);
}
