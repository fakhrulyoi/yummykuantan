import { and, eq, inArray } from 'drizzle-orm';
import type { AddonKatalog, SaizKatalog } from '@/lib/tempahan/jenis';
import { db } from './db';
import * as s from './skema';

type Pelaksana = Pick<typeof db, 'select'>;

/** Harga dan status saiz dari DB untuk kiraan server. Saiz aktif hanya jika produk juga aktif. */
export async function katalogSaiz(sizeIds: string[], q: Pelaksana = db): Promise<Map<string, SaizKatalog>> {
  const ids = [...new Set(sizeIds)].filter(uuidSah);
  if (!ids.length) return new Map();
  const r = await q
    .select({
      sizeId: s.productSize.id,
      productId: s.product.id,
      productName: s.product.name,
      label: s.productSize.label,
      priceSen: s.productSize.priceSen,
      sizeActive: s.productSize.active,
      productActive: s.product.active,
      leadDays: s.product.leadDays,
      allowMessage: s.product.allowMessage,
    })
    .from(s.productSize)
    .innerJoin(s.product, eq(s.product.id, s.productSize.productId))
    .where(inArray(s.productSize.id, ids));
  return new Map(
    r.map(({ sizeActive, productActive, ...z }) => [z.sizeId, { ...z, active: sizeActive && productActive }]),
  );
}

export async function katalogTambahan(addonIds: string[], q: Pelaksana = db): Promise<Map<string, AddonKatalog>> {
  const ids = [...new Set(addonIds)].filter(uuidSah);
  if (!ids.length) return new Map();
  const r = await q
    .select({ addonId: s.addon.id, name: s.addon.name, priceSen: s.addon.priceSen, textKind: s.addon.textKind, active: s.addon.active })
    .from(s.addon)
    .where(inArray(s.addon.id, ids));
  return new Map(r.map((a) => [a.addonId, a]));
}

export async function tambahanAktif() {
  return db.select().from(s.addon).where(and(eq(s.addon.active, true))).orderBy(s.addon.sortOrder);
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const uuidSah = (v: string) => UUID.test(v);
