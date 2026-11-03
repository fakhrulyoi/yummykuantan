import { asc, eq } from 'drizzle-orm';
import Image from 'next/image';
import Link from 'next/link';
import { TajukAdmin } from '@/components/admin/TajukAdmin';
import { requireAdmin } from '@/lib/auth/admin';
import { db } from '@/lib/data/db';
import * as s from '@/lib/data/skema';
import { formatRM } from '@/lib/tempahan/wang';
import { tambahProduk } from './actions';

export const metadata = { title: 'Produk' };

export default async function HalamanProduk({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireAdmin();
  const { q: qRaw } = await searchParams;
  const q = (typeof qRaw === 'string' ? qRaw : '').trim().toLowerCase();
  const [produk, saiz, gambar] = await Promise.all([
    db.select({ p: s.product, kat: s.category.name }).from(s.product).innerJoin(s.category, eq(s.category.id, s.product.categoryId)).orderBy(asc(s.category.sortOrder), asc(s.product.name)),
    db.select({ productId: s.productSize.productId, priceSen: s.productSize.priceSen }).from(s.productSize).where(eq(s.productSize.active, true)),
    db.select({ productId: s.productImage.productId, url: s.productImage.url, sortOrder: s.productImage.sortOrder }).from(s.productImage).orderBy(asc(s.productImage.sortOrder)),
  ]);
  const senarai = produk.filter(({ p, kat }) => !q || `${p.name} ${kat}`.toLowerCase().includes(q));
  return (
    <>
      <TajukAdmin tajuk="Produk" sub={`${produk.length} kek. Perubahan disimpan sebagai draf dan hanya muncul di laman selepas diterbitkan.`}>
        <form action="/admin/produk" role="search">
          <label htmlFor="pq" className="sr-only">Cari produk</label>
          <input id="pq" name="q" type="search" defaultValue={q} className="ad-in lg:!w-[260px]" placeholder="Cari produk" />
        </form>
        <form action={tambahProduk}>
          <button type="submit" className="ad-btn">Tambah produk</button>
        </form>
      </TajukAdmin>
      <section className="ad-card overflow-hidden" aria-label="Senarai produk">
        {senarai.length === 0 && <p className="px-4 py-8 text-center text-[#6B5B4E]">Tiada produk sepadan.</p>}
        {senarai.map(({ p, kat }) => {
          const harga = saiz.filter((z) => z.productId === p.id).map((z) => z.priceSen);
          const img = gambar.find((g) => g.productId === p.id)?.url;
          return (
            <Link key={p.id} href={`/admin/produk/${p.id}`} className="ad-row !no-underline grid-cols-[48px_1fr_auto]">
              <span className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#ECE5DB]">{img && <Image src={img} alt="" fill sizes="48px" className="object-cover" />}</span>
              <span className="min-w-0">
                <span className="block font-semibold truncate">{p.name}</span>
                <span className="block text-[13px] text-[#6B5B4E]">{kat}{harga.length ? `, dari ${formatRM(Math.min(...harga))}` : ''}</span>
              </span>
              <span className="flex gap-1.5 flex-wrap justify-end">
                {!p.active && <span className="ad-badge bg-[#F1E8E6] text-[#7A6A66]">Tidak aktif</span>}
                {p.draft !== null && <span className="ad-badge bg-[#FBEFD9] text-[#7A4E10]">Draf</span>}
                {p.onTable && <span className="ad-badge bg-[#E3EFE1] text-[#22562B]">Di meja {p.tablePosition ?? ''}</span>}
              </span>
            </Link>
          );
        })}
      </section>
    </>
  );
}
