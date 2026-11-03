import { and, asc, eq, inArray } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';
import type { AddonKatalog, SaizKatalog } from '@/lib/tempahan/jenis';
import { TAG } from './cache';
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

// ---------- bacaan katalog untuk halaman kedai (dicache, tag 'produk') ----------

export type SaizPapar = { id: string; label: string; priceSen: number };
export type ProdukPapar = {
  id: string; slug: string; name: string; category: string; categorySlug: string; description: string;
  leadDays: number; allowDesign: boolean; allowMessage: boolean; popularity: number; allergens: string | null; storage: string | null;
  onTable: boolean; tablePosition: number | null; tableImage: string | null;
  sizes: SaizPapar[]; images: { url: string; alt: string }[]; hargaDari: number;
};

async function semuaProdukAktif(): Promise<ProdukPapar[]> {
  const [prod, saiz, gambar] = await Promise.all([
    db
      .select({ p: s.product, category: s.category.name, categorySlug: s.category.slug, catOrder: s.category.sortOrder })
      .from(s.product)
      .innerJoin(s.category, eq(s.category.id, s.product.categoryId))
      .where(eq(s.product.active, true))
      .orderBy(asc(s.category.sortOrder), asc(s.product.name)),
    db.select().from(s.productSize).where(eq(s.productSize.active, true)).orderBy(asc(s.productSize.sortOrder)),
    db.select().from(s.productImage).orderBy(asc(s.productImage.sortOrder)),
  ]);
  return prod
    .map(({ p, category, categorySlug }) => {
      const sizes = saiz.filter((z) => z.productId === p.id).map((z) => ({ id: z.id, label: z.label, priceSen: z.priceSen }));
      return {
        id: p.id, slug: p.slug, name: p.name, category, categorySlug, description: p.description, leadDays: p.leadDays,
        allowDesign: p.allowDesign, allowMessage: p.allowMessage, popularity: p.popularity, allergens: p.allergens, storage: p.storage,
        onTable: p.onTable, tablePosition: p.tablePosition, tableImage: p.tableImageUrl,
        sizes, images: gambar.filter((g) => g.productId === p.id).map((g) => ({ url: g.url, alt: g.alt })),
        hargaDari: sizes.length ? Math.min(...sizes.map((z) => z.priceSen)) : 0,
      };
    })
    .filter((p) => p.sizes.length > 0);
}

export const produkAktif = unstable_cache(semuaProdukAktif, ['produk-aktif'], { tags: [TAG.produk] });

export async function kekMeja(): Promise<ProdukPapar[]> {
  return (await produkAktif())
    .filter((p) => p.onTable && p.tableImage)
    .sort((a, b) => (a.tablePosition ?? 99) - (b.tablePosition ?? 99));
}

export async function produkIkutSlug(slug: string): Promise<ProdukPapar | undefined> {
  return (await produkAktif()).find((p) => p.slug === slug);
}
