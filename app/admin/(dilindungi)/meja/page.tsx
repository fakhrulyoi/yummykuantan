/* eslint-disable @next/next/no-img-element -- gambar meja kecil, latar lutsinar */
import { asc, eq, or } from 'drizzle-orm';
import Link from 'next/link';
import { TajukAdmin } from '@/components/admin/TajukAdmin';
import { requireAdmin } from '@/lib/auth/admin';
import { db } from '@/lib/data/db';
import * as s from '@/lib/data/skema';

export const metadata = { title: 'Gambar meja kek' };

export default async function HalamanMeja() {
  await requireAdmin();
  const p = await db
    .select({ id: s.product.id, name: s.product.name, active: s.product.active, onTable: s.product.onTable, pos: s.product.tablePosition, url: s.product.tableImageUrl, draf: s.product.tableImageDraftUrl })
    .from(s.product)
    .where(or(eq(s.product.onTable, true)))
    .orderBy(asc(s.product.tablePosition));
  return (
    <>
      <TajukAdmin tajuk="Gambar meja kek" sub="Kek yang dipaparkan di atas meja laman utama, ikut kedudukan dari kiri. Tekan satu untuk tukar gambar." />
      {p.length === 0 ? (
        <p className="ad-card p-6 text-center text-[#6B5B4E]">Belum ada kek di meja. Buka produk dan hidupkan &ldquo;Paparkan di meja kek&rdquo;.</p>
      ) : (
        <ul className="list-none p-0 m-0 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5" aria-label="Kek di meja">
          {p.map((k) => (
            <li key={k.id}>
              <Link href={`/admin/produk/${k.id}`} className="ad-card block p-3 !no-underline hover:border-[#C9B9A8]">
                <div className="relative h-[180px] rounded-lg overflow-hidden bg-[radial-gradient(ellipse_80%_70%_at_50%_70%,#5A1C24_0%,#3A0E14_60%,#22060A_100%)]">
                  {(k.draf ?? k.url) ? (
                    <img src={(k.draf ?? k.url)!} alt="" className="absolute left-1/2 bottom-2 -translate-x-1/2 h-[160px] w-auto object-contain" />
                  ) : (
                    <p className="absolute inset-0 grid place-items-center text-[#E6CFC6] text-[13px] p-3 text-center">Tiada gambar meja. Kek ini tidak muncul di meja.</p>
                  )}
                </div>
                <p className="font-semibold mt-2">{k.pos ?? '-'}. {k.name}</p>
                <p className="text-[12.5px] text-[#6B5B4E]">{!k.active ? 'Tidak aktif' : k.draf ? 'Ada gambar draf' : k.url ? 'Di laman' : 'Perlu gambar'}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
