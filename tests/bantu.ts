import { asc, eq } from 'drizzle-orm';
import { db, skema as s } from '@/lib/data/db';

export async function saizIkutSlug(slug: string, label: string) {
  const [r] = await db
    .select({ productId: s.product.id, sizeId: s.productSize.id })
    .from(s.productSize)
    .innerJoin(s.product, eq(s.product.id, s.productSize.productId))
    .where(eq(s.product.slug, slug));
  const semua = await db.select().from(s.productSize).where(eq(s.productSize.productId, r.productId));
  const z = semua.find((x) => x.label === label);
  if (!z) throw new Error(`Saiz ${label} tiada untuk ${slug}`);
  return { productId: r.productId, sizeId: z.id };
}

export async function addonIkutNama(nama: string) {
  const [a] = await db.select().from(s.addon).where(eq(s.addon.name, nama));
  return a.id;
}

export async function slotIkutUrutan(i: number) {
  const r = await db.select().from(s.timeSlot).orderBy(asc(s.timeSlot.sortOrder));
  return r[i];
}
