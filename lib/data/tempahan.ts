import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { and, eq, gt, ne, sql } from 'drizzle-orm';
import type { BarisItem, KodRalat, OrderStatus } from '@/lib/tempahan/jenis';
import { kiraHarga } from '@/lib/tempahan/harga';
import { binaMesejWhatsApp, waUrl } from '@/lib/tempahan/mesej';
import { formatRujukan } from '@/lib/tempahan/rujukan';
import { medanRalat, skemaSemak, skemaTempahan, skemaTempahanCepat } from '@/lib/tempahan/skema';
import { bakiSlot } from '@/lib/tempahan/slot';
import { tarikhDibenarkan } from '@/lib/tempahan/tarikh';
import { empatAkhir } from '@/lib/tempahan/telefon';
import { db } from './db';
import { hadKadar, hashIp } from './hadKadar';
import { katalogSaiz, katalogTambahan, uuidSah } from './produk';
import * as s from './skema';
import { bacaTetapan, senaraiHariTutup } from './tetapan';

export type HasilTempahan =
  | { ok: true; ref: string; token: string; waUrl: string; totalSen: number; hargaBerubah: boolean }
  | {
      ok: false;
      ralat: KodRalat | 'SLOT_PENUH' | 'HARI_PENUH' | 'TERLALU_AWAL' | 'HARI_TUTUP' | 'HAD_KADAR' | 'INPUT';
      indeks?: number;
      medan?: Record<string, string>;
    };

const HAD_TEMPAH = { had: 10, saat: 3600 };
const HAD_SEMAK = { had: 20, saat: 3600 };
const TEMPOH_PENDUA_MS = 10 * 60_000;

const sha = (t: string) => createHash('sha256').update(t).digest('hex');

class Ditolak extends Error {
  constructor(public hasil: Extract<HasilTempahan, { ok: false }>) {
    super(hasil.ralat);
  }
}

function ralatSerialisasi(e: unknown): boolean {
  const kod = (e as { code?: string; cause?: { code?: string } })?.code ?? (e as { cause?: { code?: string } })?.cause?.code;
  return kod === '40001' || kod === '40P01';
}

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

async function cariPendua(tx: Tx, dedupeKey: string, now: Date) {
  const [o] = await tx
    .select({ ref: s.order.ref, token: s.order.token, totalSen: s.order.totalSen, waMessage: s.order.waMessage })
    .from(s.order)
    .where(and(eq(s.order.dedupeKey, dedupeKey), gt(s.order.createdAt, new Date(now.getTime() - TEMPOH_PENDUA_MS)), ne(s.order.status, 'DIBATALKAN')))
    .limit(1);
  return o;
}

async function denganCubaSemula<T>(fn: () => Promise<T>, gagal: () => T): Promise<T> {
  for (let cuba = 0; cuba < 3; cuba++) {
    try {
      return await fn();
    } catch (e) {
      if (e instanceof Ditolak) return e.hasil as T;
      if (!ralatSerialisasi(e)) throw e;
    }
  }
  return gagal();
}

export async function simpanTempahan(input: unknown, ctx: { ip: string; now?: Date; hargaPelanggan?: number }): Promise<HasilTempahan> {
  const now = ctx.now ?? new Date();
  const p = skemaTempahan.safeParse(input);
  if (!p.success) return { ok: false, ralat: 'INPUT', medan: medanRalat(p.error) };
  const v = p.data;
  const ipHash = hashIp(ctx.ip);

  if (!(await hadKadar(`tempah:${ipHash}`, HAD_TEMPAH.had, HAD_TEMPAH.saat, now))) return { ok: false, ralat: 'HAD_KADAR' };

  const [saiz, tambahan, tetapan, tutup] = await Promise.all([
    katalogSaiz(v.items.map((i) => i.sizeId)),
    katalogTambahan(v.addons.map((a) => a.addonId)),
    bacaTetapan(),
    senaraiHariTutup(),
  ]);
  const h = kiraHarga(v.items, v.addons, saiz, tambahan);
  if (!h.ok) return { ok: false, ralat: h.ralat, ...(h.indeks !== undefined ? { indeks: h.indeks } : {}) };

  const t = tarikhDibenarkan(v.date, now, h.items.map((i) => i.leadDays), tetapan.minLeadDays, tutup);
  if (!t.ok) {
    if (t.sebab === 'FORMAT') return { ok: false, ralat: 'INPUT', medan: { date: 'Pilih tarikh' } };
    return { ok: false, ralat: t.sebab };
  }
  if (v.mode === 'DELIVERY' && !tetapan.deliveryAreas.includes(v.area!)) {
    return { ok: false, ralat: 'INPUT', medan: { area: 'Pilih kawasan penghantaran' } };
  }
  if (!uuidSah(v.timeSlotId)) return { ok: false, ralat: 'INPUT', medan: { timeSlotId: 'Pilih slot masa' } };

  const caj = v.mode === 'DELIVERY' ? (tetapan.deliveryFees[v.area!] ?? null) : null;
  const dedupeKey = sha(['LIST', v.phone, v.date, ...v.items.map((i) => i.productId).sort()].join('|'));
  const hargaBerubah = ctx.hargaPelanggan !== undefined && ctx.hargaPelanggan !== h.totalSen;

  return denganCubaSemula<HasilTempahan>(
    () =>
      db.transaction(
        async (tx) => {
          await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${dedupeKey}))`);
          const ada = await cariPendua(tx, dedupeKey, now);
          if (ada) {
            return { ok: true as const, ref: ada.ref, token: ada.token, waUrl: waUrl(tetapan.whatsappNumber, ada.waMessage), totalSen: ada.totalSen, hargaBerubah: ctx.hargaPelanggan !== undefined && ctx.hargaPelanggan !== ada.totalSen };
          }

          const [slot] = await tx.select().from(s.timeSlot).where(eq(s.timeSlot.id, v.timeSlotId));
          if (!slot || !slot.active) throw new Ditolak({ ok: false, ralat: 'SLOT_PENUH' });
          const semuaSlot = await tx.select({ id: s.timeSlot.id, capacity: s.timeSlot.capacity, active: s.timeSlot.active }).from(s.timeSlot);
          const sedia = await tx
            .select({ date: s.order.date, timeSlotId: s.order.timeSlotId, status: s.order.status, createdAt: s.order.createdAt })
            .from(s.order)
            .where(and(eq(s.order.date, v.date), ne(s.order.status, 'DIBATALKAN')));
          const baki = bakiSlot(v.date, semuaSlot, tetapan.dailyCapacity, sedia.map((o) => ({ ...o, date: o.date! })), now, tetapan.holdHours);
          if (baki.harian <= 0) throw new Ditolak({ ok: false, ralat: 'HARI_PENUH' });
          if ((baki.slot[slot.id] ?? 0) <= 0) throw new Ditolak({ ok: false, ralat: 'SLOT_PENUH' });

          const ref = await rujukanBaru(tx);
          const token = randomBytes(16).toString('hex');
          const waMessage = binaMesejWhatsApp({
            ref, kind: 'LIST', items: h.items, addons: h.addons, totalSen: h.totalSen,
            tarikh: v.date, slotLabel: slot.label, mode: v.mode, area: v.area, address: v.address, name: v.name, cajHantarSen: caj,
          });
          const [o] = await tx
            .insert(s.order)
            .values({
              ref, token, kind: 'LIST', customerName: v.name, phone: v.phone, mode: v.mode, area: v.area ?? null,
              address: v.address ?? null, date: v.date, timeSlotId: slot.id, notes: v.notes ?? null, deliveryFeeSen: caj,
              cakeSubtotalSen: h.cakeSubtotalSen, addonSubtotalSen: h.addonSubtotalSen, totalSen: h.totalSen,
              waMessage, ipHash, dedupeKey, createdAt: now, updatedAt: now,
            })
            .returning({ id: s.order.id });
          await tx.insert(s.orderItem).values(h.items.map((i) => barisItem(i, o.id)));
          if (h.addons.length) await tx.insert(s.orderAddon).values(h.addons.map((a) => ({ ...a, orderId: o.id, text: a.text ?? null })));
          return { ok: true as const, ref, token, waUrl: waUrl(tetapan.whatsappNumber, waMessage), totalSen: h.totalSen, hargaBerubah };
        },
        { isolationLevel: 'serializable' },
      ),
    () => ({ ok: false, ralat: 'SLOT_PENUH' }),
  );
}

export async function simpanTempahanCepat(input: unknown, ctx: { ip: string; now?: Date }): Promise<HasilTempahan> {
  const now = ctx.now ?? new Date();
  const p = skemaTempahanCepat.safeParse(input);
  if (!p.success) return { ok: false, ralat: 'INPUT', medan: medanRalat(p.error) };
  const v = p.data;
  const ipHash = hashIp(ctx.ip);
  if (!(await hadKadar(`tempah:${ipHash}`, HAD_TEMPAH.had, HAD_TEMPAH.saat, now))) return { ok: false, ralat: 'HAD_KADAR' };

  const [saiz, tetapan, tutup] = await Promise.all([katalogSaiz([v.sizeId]), bacaTetapan(), senaraiHariTutup()]);
  const h = kiraHarga([{ productId: v.productId, sizeId: v.sizeId, qty: v.qty, cakeMessage: v.cakeMessage }], [], saiz, new Map());
  if (!h.ok) return { ok: false, ralat: h.ralat, ...(h.indeks !== undefined ? { indeks: h.indeks } : {}) };
  const t = tarikhDibenarkan(v.date, now, h.items.map((i) => i.leadDays), tetapan.minLeadDays, tutup);
  if (!t.ok) {
    if (t.sebab === 'FORMAT') return { ok: false, ralat: 'INPUT', medan: { date: 'Pilih tarikh' } };
    return { ok: false, ralat: t.sebab };
  }

  const dedupeKey = sha(['QUICK', ipHash, v.productId, v.sizeId, v.date].join('|'));
  return denganCubaSemula<HasilTempahan>(
    () =>
      db.transaction(async (tx) => {
        await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${dedupeKey}))`);
        const ada = await cariPendua(tx, dedupeKey, now);
        if (ada) return { ok: true as const, ref: ada.ref, token: ada.token, waUrl: waUrl(tetapan.whatsappNumber, ada.waMessage), totalSen: ada.totalSen, hargaBerubah: false };
        // Kapasiti harian (slot masa disahkan kemudian di WhatsApp).
        const sedia = await tx
          .select({ date: s.order.date, timeSlotId: s.order.timeSlotId, status: s.order.status, createdAt: s.order.createdAt })
          .from(s.order)
          .where(and(eq(s.order.date, v.date), ne(s.order.status, 'DIBATALKAN')));
        if (bakiSlot(v.date, [], tetapan.dailyCapacity, sedia.map((o) => ({ ...o, date: o.date! })), now, tetapan.holdHours).harian <= 0) {
          throw new Ditolak({ ok: false, ralat: 'HARI_PENUH' });
        }
        const ref = await rujukanBaru(tx);
        const token = randomBytes(16).toString('hex');
        const waMessage = binaMesejWhatsApp({ ref, kind: 'QUICK', items: h.items, addons: [], totalSen: h.totalSen, tarikh: v.date });
        const [o] = await tx
          .insert(s.order)
          .values({
            ref, token, kind: 'QUICK', date: v.date, cakeSubtotalSen: h.cakeSubtotalSen, addonSubtotalSen: 0, totalSen: h.totalSen,
            waMessage, ipHash, dedupeKey, createdAt: now, updatedAt: now,
          })
          .returning({ id: s.order.id });
        await tx.insert(s.orderItem).values(h.items.map((i) => barisItem(i, o.id)));
        return { ok: true as const, ref, token, waUrl: waUrl(tetapan.whatsappNumber, waMessage), totalSen: h.totalSen, hargaBerubah: false };
      }, { isolationLevel: 'serializable' }),
    () => ({ ok: false, ralat: 'HAD_KADAR' }),
  );
}

function barisItem(i: BarisItem, orderId: string) {
  return { orderId, productId: i.productId, productName: i.productName, sizeLabel: i.sizeLabel, unitPriceSen: i.unitPriceSen, qty: i.qty, cakeMessage: i.cakeMessage ?? null };
}

async function rujukanBaru(tx: Tx): Promise<string> {
  const r = await tx.execute<{ n: string }>(sql`SELECT nextval('order_ref_seq') AS n`);
  return formatRujukan(Number(r.rows[0].n));
}

function tokenSama(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export async function cariTempahanUntukPelanggan(ref: string, token: string) {
  if (!token || !/^YK-\d+$/.test(ref)) return null;
  const [o] = await db
    .select({ order: s.order, slotLabel: s.timeSlot.label })
    .from(s.order)
    .leftJoin(s.timeSlot, eq(s.timeSlot.id, s.order.timeSlotId))
    .where(eq(s.order.ref, ref));
  if (!o || !tokenSama(o.order.token, token)) return null;
  const [items, addons] = await Promise.all([
    db.select().from(s.orderItem).where(eq(s.orderItem.orderId, o.order.id)),
    db.select().from(s.orderAddon).where(eq(s.orderAddon.orderId, o.order.id)),
  ]);
  return { ...o.order, slotLabel: o.slotLabel, items, addons };
}

export type OrderDenganItem = NonNullable<Awaited<ReturnType<typeof cariTempahanUntukPelanggan>>>;

export async function semakStatus(
  ref: string,
  empat: string,
  ip: string,
): Promise<{ ok: true; status: OrderStatus; kind: 'QUICK' | 'LIST'; date: string | null; mode: string | null } | { ok: false; ralat: 'TIADA' | 'HAD_KADAR' }> {
  if (!(await hadKadar(`semak:${hashIp(ip)}`, HAD_SEMAK.had, HAD_SEMAK.saat))) return { ok: false, ralat: 'HAD_KADAR' };
  const p = skemaSemak.safeParse({ ref, empat });
  if (!p.success) return { ok: false, ralat: 'TIADA' };
  const [o] = await db
    .select({ status: s.order.status, kind: s.order.kind, date: s.order.date, mode: s.order.mode, phone: s.order.phone })
    .from(s.order)
    .where(eq(s.order.ref, p.data.ref));
  if (!o || !o.phone || empatAkhir(o.phone) !== p.data.empat) return { ok: false, ralat: 'TIADA' };
  return { ok: true, status: o.status, kind: o.kind, date: o.date, mode: o.mode };
}
