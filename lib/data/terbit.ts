import { and, asc, count, eq, inArray, like, notInArray } from 'drizzle-orm';
import { z } from 'zod';
import { rekodAudit } from './audit';
import { db } from './db';
import * as s from './skema';
import { urlGambarSah } from './urlGambar';

const skemaDraf = z.object({
  name: z.string().trim().min(1, { error: 'Isi nama kek' }).max(80),
  categoryId: z.uuid({ error: 'Pilih kategori' }),
  description: z.string().trim().max(600),
  leadDays: z.number().int().min(0).max(60),
  allergens: z.string().trim().max(300).nullable().optional(),
  storage: z.string().trim().max(300).nullable().optional(),
  active: z.boolean(),
  onTable: z.boolean(),
  tablePosition: z.number().int().min(1).max(20).nullable().optional(),
  allowDesign: z.boolean(),
  allowMessage: z.boolean(),
  sizes: z
    .array(z.object({ id: z.uuid().optional(), label: z.string().trim().min(1, { error: 'Isi nama saiz' }).max(40), priceSen: z.number().int().min(100, { error: 'Harga minimum RM 1' }).max(10_000_00) }))
    .min(1, { error: 'Sekurang-kurangnya satu saiz' })
    .max(12),
  images: z.array(z.object({ url: z.string().min(1).max(500).refine(urlGambarSah, { error: 'Alamat gambar tidak sah' }), alt: z.string().max(200) })).max(12),
});

export type DrafProduk = z.infer<typeof skemaDraf>;
export type HasilProduk = { ok: true } | { ok: false; ralat: string };

/** Draf yang disimpan, atau nilai yang sedang diterbitkan jika tiada draf. */
export async function bacaDrafProduk(id: string): Promise<(DrafProduk & { adaDraf: boolean }) | null> {
  if (!z.uuid().safeParse(id).success) return null;
  const [p] = await db.select().from(s.product).where(eq(s.product.id, id));
  if (!p) return null;
  if (p.draft) {
    const d = skemaDraf.safeParse(p.draft);
    if (d.success) return { ...d.data, adaDraf: true };
  }
  const [sizes, images] = await Promise.all([
    db.select().from(s.productSize).where(and(eq(s.productSize.productId, id), eq(s.productSize.active, true))).orderBy(asc(s.productSize.sortOrder)),
    db.select().from(s.productImage).where(eq(s.productImage.productId, id)).orderBy(asc(s.productImage.sortOrder)),
  ]);
  return {
    name: p.name, categoryId: p.categoryId, description: p.description, leadDays: p.leadDays, allergens: p.allergens, storage: p.storage,
    active: p.active, onTable: p.onTable, tablePosition: p.tablePosition, allowDesign: p.allowDesign, allowMessage: p.allowMessage,
    sizes: sizes.map((z) => ({ id: z.id, label: z.label, priceSen: z.priceSen })),
    images: images.map((g) => ({ url: g.url, alt: g.alt })),
    adaDraf: false,
  };
}

function ralatPertama(e: z.ZodError): string {
  return e.issues[0]?.message ?? 'Sila semak borang.';
}

export async function simpanDrafProduk(id: string, draf: unknown, userId: string): Promise<HasilProduk> {
  const p = skemaDraf.safeParse(draf);
  if (!p.success) return { ok: false, ralat: ralatPertama(p.error) };
  const r = await db.update(s.product).set({ draft: p.data }).where(eq(s.product.id, id)).returning({ id: s.product.id });
  if (!r.length) return { ok: false, ralat: 'Produk tidak dijumpai.' };
  await rekodAudit(userId, 'simpan_draf', 'product', id, { draf: p.data.name });
  return { ok: true };
}

/** Salin draf ke lajur awam dalam satu transaksi. Saiz dikemas kini ikut id (saiz dibuang dinyahaktif supaya senarai pelanggan tidak rosak). */
export async function terbitProduk(id: string, userId: string): Promise<HasilProduk> {
  return db.transaction(async (tx) => {
    const [p] = await tx.select().from(s.product).where(eq(s.product.id, id)).for('update');
    if (!p) return { ok: false as const, ralat: 'Produk tidak dijumpai.' };
    if (!p.draft) return { ok: true as const };
    const d = skemaDraf.safeParse(p.draft);
    if (!d.success) return { ok: false as const, ralat: ralatPertama(d.error) };
    const v = d.data;

    const ada = await tx.select().from(s.productSize).where(eq(s.productSize.productId, id));
    const idAda = new Set(ada.map((z) => z.id));
    const disimpan: string[] = [];
    for (const [i, z] of v.sizes.entries()) {
      if (z.id && idAda.has(z.id)) {
        await tx.update(s.productSize).set({ label: z.label, priceSen: z.priceSen, sortOrder: i, active: true }).where(eq(s.productSize.id, z.id));
        disimpan.push(z.id);
      } else {
        const [n] = await tx.insert(s.productSize).values({ productId: id, label: z.label, priceSen: z.priceSen, sortOrder: i }).returning({ id: s.productSize.id });
        disimpan.push(n.id);
      }
    }
    await tx.update(s.productSize).set({ active: false }).where(and(eq(s.productSize.productId, id), notInArray(s.productSize.id, disimpan)));

    await tx.delete(s.productImage).where(eq(s.productImage.productId, id));
    if (v.images.length) await tx.insert(s.productImage).values(v.images.map((g, i) => ({ productId: id, url: g.url, alt: g.alt, sortOrder: i })));

    const lama = { name: p.name, description: p.description, leadDays: p.leadDays, active: p.active, onTable: p.onTable };
    await tx
      .update(s.product)
      .set({
        name: v.name, categoryId: v.categoryId, description: v.description, leadDays: v.leadDays, allergens: v.allergens || null, storage: v.storage || null,
        active: v.active, onTable: v.onTable, tablePosition: v.onTable ? (v.tablePosition ?? null) : null, allowDesign: v.allowDesign, allowMessage: v.allowMessage,
        draft: null, publishedAt: new Date(),
      })
      .where(eq(s.product.id, id));
    await rekodAudit(userId, 'terbit', 'product', id, { sebelum: lama, harga: v.sizes.map((z) => [z.label, z.priceSen]) }, tx);
    return { ok: true as const };
  });
}

const jadikanSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'kek';

/** Produk baru (tidak aktif sehingga diterbitkan dengan suis Aktif). */
export async function ciptaProduk(nama: string, userId: string): Promise<string> {
  const asas = jadikanSlug(nama);
  const [kat] = await db.select({ id: s.category.id }).from(s.category).orderBy(asc(s.category.sortOrder)).limit(1);
  if (!kat) throw new Error('Tiada kategori');
  const sedia = new Set((await db.select({ slug: s.product.slug }).from(s.product).where(like(s.product.slug, `${asas}%`))).map((r) => r.slug));
  let slug = asas;
  for (let i = 2; sedia.has(slug); i++) slug = `${asas}-${i}`;
  const [p] = await db.insert(s.product).values({ name: nama.trim().slice(0, 80) || 'Kek baru', slug, categoryId: kat.id, active: false }).returning({ id: s.product.id });
  await rekodAudit(userId, 'cipta', 'product', p.id, { name: nama });
  return p.id;
}

/** Padam jika tiada rekod tempahan; jika ada, nyahaktif sahaja (rekod tempahan merujuk produk). */
export async function padamProduk(id: string, userId: string): Promise<{ ok: true; dipadam: boolean } | { ok: false; ralat: string }> {
  const [p] = await db.select({ id: s.product.id, name: s.product.name }).from(s.product).where(eq(s.product.id, id));
  if (!p) return { ok: false, ralat: 'Produk tidak dijumpai.' };
  const [{ n }] = await db.select({ n: count() }).from(s.orderItem).where(inArray(s.orderItem.productId, [id]));
  if (n > 0) {
    await db.update(s.product).set({ active: false, onTable: false, tablePosition: null }).where(eq(s.product.id, id));
    await rekodAudit(userId, 'nyahaktif', 'product', id, { sebab: 'ada rekod tempahan', name: p.name });
    return { ok: true, dipadam: false };
  }
  await db.delete(s.product).where(eq(s.product.id, id));
  await rekodAudit(userId, 'padam', 'product', id, { name: p.name });
  return { ok: true, dipadam: true };
}
