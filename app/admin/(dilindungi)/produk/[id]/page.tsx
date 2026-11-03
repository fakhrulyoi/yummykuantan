import { asc, eq } from 'drizzle-orm';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BorangProduk } from '@/components/admin/BorangProduk';
import { requireAdmin } from '@/lib/auth/admin';
import { db } from '@/lib/data/db';
import * as s from '@/lib/data/skema';
import { bacaDrafProduk } from '@/lib/data/terbit';

export const metadata = { title: 'Sunting produk' };

export default async function SuntingProduk({ params }: { params: Promise<{ id: string }> }) {
  const a = await requireAdmin();
  const { id } = await params;
  const [draf, kategori] = await Promise.all([bacaDrafProduk(id), db.select({ id: s.category.id, name: s.category.name }).from(s.category).orderBy(asc(s.category.sortOrder))]);
  if (!draf) notFound();
  const [p] = await db.select({ slug: s.product.slug }).from(s.product).where(eq(s.product.id, id));
  return (
    <>
      <Link href="/admin/produk" className="text-[13.5px] font-semibold">&larr; Semua produk</Link>
      <BorangProduk id={id} slug={p.slug} awal={draf} kategori={kategori} pemilik={a.role === 'OWNER'} />
    </>
  );
}
