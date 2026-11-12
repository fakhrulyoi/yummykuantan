import 'server-only';
import { and, asc, desc, eq, gte, ilike, inArray, isNull, lt, lte, ne, notInArray, or, sql, type SQL } from 'drizzle-orm';
import { STATUS_TEMPAHAN, type OrderStatus } from '@/lib/tempahan/jenis';
import { isiTemplat, waUrl } from '@/lib/tempahan/mesej';
import { formatRM } from '@/lib/tempahan/wang';
import { bacaKandungan } from './kandungan';
import { hariIniMYT, tambahHari } from '@/lib/tempahan/tarikh';
import { db } from './db';
import * as s from './skema';
import { bacaTetapan } from './tetapan';

export { LABEL_STATUS, WARNA_STATUS } from './labelStatus';

/** Awal hari ini (MYT, UTC+8) sebagai Date. */
function awalHariMYT(now: Date): Date {
  return new Date(`${hariIniMYT(now)}T00:00:00+08:00`);
}

/** Syarat "tersembunyi": BARU_WA yang lebih lama daripada tempoh pegangan (lalai 48 jam). */
function syaratNampak(now: Date, holdHours: number): SQL {
  return or(ne(s.order.status, 'BARU_WA'), gte(s.order.createdAt, new Date(now.getTime() - holdHours * 3600_000)))!;
}

export type BarisAdmin = {
  id: string; ref: string; kind: 'QUICK' | 'LIST'; status: OrderStatus; customerName: string | null; phone: string | null;
  date: string | null; mode: string | null; totalSen: number; deliveryFeeSen: number | null; kek: string; createdAt: Date;
};

async function denganKek<T extends { id: string }>(rows: T[]): Promise<(T & { kek: string })[]> {
  if (!rows.length) return [];
  const items = await db
    .select({ orderId: s.orderItem.orderId, name: s.orderItem.productName, qty: s.orderItem.qty })
    .from(s.orderItem)
    .where(inArray(s.orderItem.orderId, rows.map((r) => r.id)));
  return rows.map((r) => ({
    ...r,
    kek: items.filter((i) => i.orderId === r.id).map((i) => (i.qty > 1 ? `${i.name} x${i.qty}` : i.name)).join(', ') || '-',
  }));
}

const PILIH = {
  id: s.order.id, ref: s.order.ref, kind: s.order.kind, status: s.order.status, customerName: s.order.customerName, phone: s.order.phone,
  date: s.order.date, mode: s.order.mode, totalSen: s.order.totalSen, deliveryFeeSen: s.order.deliveryFeeSen, createdAt: s.order.createdAt,
};

export async function senaraiTempahanAdmin(o: { q?: string; status?: string; semua?: boolean; now?: Date }) {
  const now = o.now ?? new Date();
  const t = await bacaTetapan();
  const syarat: SQL[] = [];
  if (!o.semua) syarat.push(syaratNampak(now, t.holdHours));
  const q = o.q?.trim().slice(0, 60);
  if (q) {
    const digit = q.replace(/\D/g, '');
    syarat.push(or(ilike(s.order.ref, `%${q}%`), ilike(s.order.customerName, `%${q}%`), ...(digit.length >= 3 ? [ilike(s.order.phone, `%${digit}%`)] : []))!);
  }
  const asas = syarat.length ? and(...syarat) : undefined;
  const status = (STATUS_TEMPAHAN as readonly string[]).includes(o.status ?? '') ? (o.status as OrderStatus) : null;

  const [rows, kiraan] = await Promise.all([
    db.select(PILIH).from(s.order).where(status ? and(asas, eq(s.order.status, status)) : asas).orderBy(desc(s.order.createdAt)).limit(200),
    db.select({ status: s.order.status, n: sql<number>`count(*)::int` }).from(s.order).where(asas).groupBy(s.order.status),
  ]);
  const bil = Object.fromEntries(STATUS_TEMPAHAN.map((k) => [k, 0])) as Record<OrderStatus, number>;
  for (const k of kiraan) bil[k.status] = k.n;
  const tersembunyi = o.semua
    ? 0
    : (await db.select({ n: sql<number>`count(*)::int` }).from(s.order).where(and(eq(s.order.status, 'BARU_WA'), lt(s.order.createdAt, new Date(now.getTime() - t.holdHours * 3600_000)))))[0].n;
  return { rows: await denganKek(rows), bil, jumlah: Object.values(bil).reduce((a, n) => a + n, 0), status, tersembunyi, holdHours: t.holdHours };
}

export async function ringkasanPapan(now = new Date()) {
  const awal = awalHariMYT(now);
  const nampak = syaratNampak(now, (await bacaTetapan()).holdHours);
  const hariIni = hariIniMYT(now);
  const [[baru], [bayar], [cepat], dekat] = await Promise.all([
    db.select({ n: sql<number>`count(*)::int` }).from(s.order).where(and(gte(s.order.createdAt, awal), ne(s.order.status, 'DIBATALKAN'))),
    db.select({ n: sql<number>`count(*)::int` }).from(s.order).where(eq(s.order.status, 'MENUNGGU_BAYARAN')),
    db.select({ n: sql<number>`count(*)::int` }).from(s.order).where(and(eq(s.order.kind, 'QUICK'), isNull(s.order.customerName), notInArray(s.order.status, ['DIBATALKAN', 'SELESAI']))),
    db
      .select({ ...PILIH, slotLabel: s.timeSlot.label })
      .from(s.order)
      .leftJoin(s.timeSlot, eq(s.timeSlot.id, s.order.timeSlotId))
      .where(and(gte(s.order.date, hariIni), lte(s.order.date, tambahHari(hariIni, 6)), notInArray(s.order.status, ['DIBATALKAN', 'SELESAI']), nampak))
      .orderBy(asc(s.order.date), asc(s.timeSlot.sortOrder)),
  ]);
  const cepatBaru = await db
    .select(PILIH)
    .from(s.order)
    .where(and(eq(s.order.kind, 'QUICK'), isNull(s.order.customerName), notInArray(s.order.status, ['DIBATALKAN', 'SELESAI'])))
    .orderBy(desc(s.order.createdAt))
    .limit(10);
  return { baru: baru.n, menungguBayar: bayar.n, cepat: cepat.n, dekat: await denganKek(dekat), cepatBaru: await denganKek(cepatBaru) };
}

export async function butiranTempahan(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [o] = await db.select({ order: s.order, slotLabel: s.timeSlot.label }).from(s.order).leftJoin(s.timeSlot, eq(s.timeSlot.id, s.order.timeSlotId)).where(eq(s.order.id, id));
  if (!o) return null;
  const [items, addons, sejarah] = await Promise.all([
    db
      .select({ item: s.orderItem, slug: s.product.slug })
      .from(s.orderItem)
      .leftJoin(s.product, eq(s.product.id, s.orderItem.productId))
      .where(eq(s.orderItem.orderId, id)),
    db.select().from(s.orderAddon).where(eq(s.orderAddon.orderId, id)),
    db
      .select({ log: s.auditLog, nama: s.adminProfile.name })
      .from(s.auditLog)
      .leftJoin(s.adminProfile, eq(s.adminProfile.userId, s.auditLog.userId))
      .where(and(eq(s.auditLog.entity, 'order'), eq(s.auditLog.entityId, id)))
      .orderBy(desc(s.auditLog.createdAt))
      .limit(50),
  ]);
  const gambar = items.length
    ? await db.select({ productId: s.productImage.productId, url: s.productImage.url }).from(s.productImage).where(inArray(s.productImage.productId, items.map((i) => i.item.productId))).orderBy(asc(s.productImage.sortOrder))
    : [];
  return {
    ...o.order,
    slotLabel: o.slotLabel,
    items: items.map((i) => ({ ...i.item, slug: i.slug, gambar: gambar.find((g) => g.productId === i.item.productId)?.url ?? null })),
    addons,
    sejarah: sejarah.map((x) => ({ ...x.log, nama: x.nama ?? 'Admin' })),
  };
}
export type ButiranAdmin = NonNullable<Awaited<ReturnType<typeof butiranTempahan>>>;

/** Pautan WhatsApp ke pelanggan dengan templat ikut status semasa. Kosong jika tiada telefon. */
export async function binaPautanBalas(o: { ref: string; status: OrderStatus; phone: string | null; totalSen: number; deliveryFeeSen: number | null }): Promise<string> {
  if (!o.phone) return '';
  const t = await bacaKandungan('waTemplates');
  const jumlah = formatRM(o.totalSen + (o.deliveryFeeSen ?? 0));
  return waUrl(o.phone, isiTemplat(t[o.status] ?? 'Salam, berkenaan tempahan {ref}.', { ref: o.ref, jumlah, caraBayar: t.caraBayar && !t.caraBayar.includes('[') ? t.caraBayar : 'akan kami maklumkan' }));
}
