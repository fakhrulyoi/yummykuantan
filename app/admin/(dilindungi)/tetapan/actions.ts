'use server';

import { count, eq } from 'drizzle-orm';
import { revalidatePath, revalidateTag } from 'next/cache';
import { z } from 'zod';
import { requireAdminTindakan } from '@/lib/auth/admin';
import { rekodAudit } from '@/lib/data/audit';
import { TAG } from '@/lib/data/cache';
import { db } from '@/lib/data/db';
import * as s from '@/lib/data/skema';
import { bacaTetapan } from '@/lib/data/tetapan';

export type HasilTetapan = { ok: true; mesej?: string } | { ok: false; ralat: string };

const segar = () => revalidatePath('/admin/tetapan');
const ralat = (e: z.ZodError): HasilTetapan => ({ ok: false, ralat: e.issues[0]?.message ?? 'Sila semak borang.' });

const skemaUmum = z.object({
  minLeadDays: z.number().int().min(0, { error: 'Tempah awal 0 hingga 30 hari' }).max(30, { error: 'Tempah awal 0 hingga 30 hari' }),
  dailyCapacity: z.number().int().min(1, { error: 'Kapasiti sehari 1 hingga 200' }).max(200, { error: 'Kapasiti sehari 1 hingga 200' }),
  holdHours: z.number().int().min(1, { error: 'Tempoh pegangan 1 hingga 168 jam' }).max(168, { error: 'Tempoh pegangan 1 hingga 168 jam' }),
  whatsappNumber: z.string().trim().regex(/^601\d{8,9}$/, { error: 'Nombor WhatsApp tidak sah. Format: 601XXXXXXXX' }),
});

export async function simpanTetapan(v: z.input<typeof skemaUmum>): Promise<HasilTetapan> {
  const a = await requireAdminTindakan('OWNER');
  const p = skemaUmum.safeParse(v);
  if (!p.success) return ralat(p.error);
  const lama = await bacaTetapan();
  await db.transaction(async (tx) => {
    await tx.update(s.settings).set(p.data).where(eq(s.settings.id, 1));
    if (lama.whatsappNumber !== p.data.whatsappNumber) {
      // Satu sumber nombor WhatsApp: selaraskan kandungan "hubungi" (versi terbit dan draf).
      const [h] = await tx.select().from(s.siteContent).where(eq(s.siteContent.key, 'hubungi'));
      if (h) {
        await tx
          .update(s.siteContent)
          .set({
            value: { ...(h.value as object), whatsapp: p.data.whatsappNumber },
            draft: h.draft ? { ...(h.draft as object), whatsapp: p.data.whatsappNumber } : null,
          })
          .where(eq(s.siteContent.key, 'hubungi'));
      }
    }
    await rekodAudit(a.userId, 'tetapan', 'settings', '1', Object.fromEntries(Object.entries(p.data).map(([k, x]) => [k, [(lama as Record<string, unknown>)[k], x]])), tx);
  });
  revalidateTag(TAG.kandungan);
  segar();
  return { ok: true, mesej: 'Tetapan disimpan.' };
}

const masa = z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, { error: 'Masa tidak sah' });
const skemaSlot = z.object({
  id: z.uuid().optional(),
  label: z.string().trim().min(3, { error: 'Isi label slot' }).max(60),
  startsAt: masa,
  endsAt: masa,
  capacity: z.number().int().min(0, { error: 'Kapasiti 0 hingga 50' }).max(50, { error: 'Kapasiti 0 hingga 50' }),
  active: z.boolean(),
});

export async function simpanSlot(v: z.input<typeof skemaSlot>): Promise<HasilTetapan> {
  const a = await requireAdminTindakan('OWNER');
  const p = skemaSlot.safeParse(v);
  if (!p.success) return ralat(p.error);
  const { id, ...d } = p.data;
  if (d.endsAt <= d.startsAt) return { ok: false, ralat: 'Masa tamat mesti selepas masa mula.' };
  if (id) {
    await db.update(s.timeSlot).set(d).where(eq(s.timeSlot.id, id));
    await rekodAudit(a.userId, 'kemaskini_slot', 'time_slot', id, d);
  } else {
    const [{ n }] = await db.select({ n: count() }).from(s.timeSlot);
    const [x] = await db.insert(s.timeSlot).values({ ...d, sortOrder: n }).returning({ id: s.timeSlot.id });
    await rekodAudit(a.userId, 'tambah_slot', 'time_slot', x.id, d);
  }
  segar();
  return { ok: true, mesej: 'Slot disimpan.' };
}

/** Slot yang pernah ditempah hanya dinyahaktif (rekod tempahan merujuknya). */
export async function padamSlot(id: string): Promise<HasilTetapan> {
  const a = await requireAdminTindakan('OWNER');
  if (!z.uuid().safeParse(id).success) return { ok: false, ralat: 'Slot tidak sah.' };
  const [{ n }] = await db.select({ n: count() }).from(s.order).where(eq(s.order.timeSlotId, id));
  if (n > 0) {
    await db.update(s.timeSlot).set({ active: false }).where(eq(s.timeSlot.id, id));
    await rekodAudit(a.userId, 'nyahaktif_slot', 'time_slot', id, {});
    segar();
    return { ok: true, mesej: 'Slot ini ada tempahan, jadi ia dinyahaktif (tidak dipadam).' };
  }
  await db.delete(s.timeSlot).where(eq(s.timeSlot.id, id));
  await rekodAudit(a.userId, 'padam_slot', 'time_slot', id, {});
  segar();
  return { ok: true, mesej: 'Slot dipadam.' };
}

export async function tambahHariTutup(date: string, reason?: string): Promise<HasilTetapan> {
  const a = await requireAdminTindakan('OWNER');
  if (!z.iso.date().safeParse(date).success) return { ok: false, ralat: 'Pilih tarikh.' };
  const sebab = reason?.trim().slice(0, 80) || null;
  await db.insert(s.closedDate).values({ date, reason: sebab }).onConflictDoUpdate({ target: s.closedDate.date, set: { reason: sebab } });
  await rekodAudit(a.userId, 'tambah_hari_tutup', 'closed_date', date, { reason: sebab });
  segar();
  return { ok: true, mesej: 'Hari tutup ditambah.' };
}

export async function buangHariTutup(date: string): Promise<HasilTetapan> {
  const a = await requireAdminTindakan('OWNER');
  if (!z.iso.date().safeParse(date).success) return { ok: false, ralat: 'Tarikh tidak sah.' };
  await db.delete(s.closedDate).where(eq(s.closedDate.date, date));
  await rekodAudit(a.userId, 'buang_hari_tutup', 'closed_date', date, {});
  segar();
  return { ok: true, mesej: 'Hari tutup dibuang.' };
}

const skemaTambahan = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(2, { error: 'Isi nama tambahan' }).max(60),
  note: z.string().trim().max(120),
  priceSen: z.number().int().min(0, { error: 'Harga tidak sah' }).max(100_000, { error: 'Harga tidak sah' }),
  textKind: z.enum(['NONE', 'NUMBER', 'MESSAGE']),
  active: z.boolean(),
});

export async function simpanTambahan(v: z.input<typeof skemaTambahan>): Promise<HasilTetapan> {
  const a = await requireAdminTindakan('OWNER');
  const p = skemaTambahan.safeParse(v);
  if (!p.success) return ralat(p.error);
  const { id, ...d } = p.data;
  if (id) {
    await db.update(s.addon).set(d).where(eq(s.addon.id, id));
    await rekodAudit(a.userId, 'kemaskini_tambahan', 'addon', id, d);
  } else {
    const [{ n }] = await db.select({ n: count() }).from(s.addon);
    const [x] = await db.insert(s.addon).values({ ...d, sortOrder: n }).returning({ id: s.addon.id });
    await rekodAudit(a.userId, 'tambah_tambahan', 'addon', x.id, d);
  }
  segar();
  return { ok: true, mesej: 'Tambahan disimpan.' };
}
