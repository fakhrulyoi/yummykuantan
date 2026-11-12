'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import type { ProdukPapar } from '@/lib/data/produk';
import { KadKek } from './KadKek';

type Susun = 'pop' | 'low' | 'high';
const HARGA: { nama: string; dari: number; hingga: number }[] = [
  { nama: 'Semua harga', dari: 0, hingga: Infinity },
  { nama: 'Bawah RM 60', dari: 0, hingga: 5999 },
  { nama: 'RM 60 hingga RM 150', dari: 6000, hingga: 15000 },
  { nama: 'Atas RM 150', dari: 15001, hingga: Infinity },
];

export function Koleksi({ produk, kategori, kategoriAwal }: { produk: ProdukPapar[]; kategori: { slug: string; name: string }[]; kategoriAwal: string | null }) {
  const [kat, setKat] = useState<string | null>(kategori.some((k) => k.slug === kategoriAwal) ? kategoriAwal : null);
  const [q, setQ] = useState('');
  const [harga, setHarga] = useState(0);
  const [susun, setSusun] = useState<Susun>('pop');
  const router = useRouter();
  const laluan = usePathname();

  const pilihKat = (slug: string | null) => {
    setKat(slug);
    router.replace(slug ? `${laluan}?kategori=${slug}` : laluan, { scroll: false });
  };

  const senarai = useMemo(() => {
    const cari = q.trim().toLowerCase();
    const h = HARGA[harga];
    return produk
      .filter((p) => (!kat || p.categorySlug === kat) && p.hargaDari >= h.dari && p.hargaDari <= h.hingga)
      .filter((p) => !cari || `${p.name} ${p.description} ${p.category}`.toLowerCase().includes(cari))
      .sort((a, b) => (susun === 'low' ? a.hargaDari - b.hargaDari : susun === 'high' ? b.hargaDari - a.hargaDari : b.popularity - a.popularity));
  }, [produk, kat, q, harga, susun]);

  const namaKat = kategori.find((k) => k.slug === kat)?.name;
  const kosongkan = () => {
    setQ('');
    setHarga(0);
    pilihKat(null);
  };

  return (
    <div className="lg:max-w-[1360px] lg:mx-auto lg:px-10 lg:pt-10 lg:pb-24">
      <nav aria-label="Laluan" className="hidden lg:block text-[15px] text-yk-muted">
        <Link href="/" className="text-yk-muted">Utama</Link>
        <span aria-hidden="true" className="mx-2.5">/</span>
        <span>Koleksi</span>
      </nav>
      <div className="flex flex-wrap items-center px-4 pt-4 lg:p-0 lg:mt-4 lg:items-end lg:gap-x-2.5">
        <div className="w-full lg:w-auto lg:flex-1 lg:mr-6">
          <h1 className="text-[40px] leading-none lg:text-[72px]">{namaKat ?? 'Koleksi'}</h1>
          <p className="text-yk-muted text-[15px] mt-1 lg:text-base lg:mt-2.5">
            <span className="lg:hidden">Setiap kek dibakar ikut tempahan. Tempah terus melalui WhatsApp.</span>
            <span className="hidden lg:inline">Semua kek dibakar ikut tempahan. Tekan Tempah untuk terus WhatsApp kami.</span>
          </p>
        </div>
        <div className="w-full mt-3.5 lg:mt-0 lg:w-[300px]">
          <label htmlFor="q" className="sr-only">Cari kek</label>
          <input id="q" className="b-in" type="search" placeholder="Cari nama kek atau rasa" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="order-4 w-full flex gap-2 items-center pt-2 lg:order-3 lg:w-auto lg:pt-0">
          <label htmlFor="susun" className="text-[15px] lg:text-[15px] text-yk-muted">Susun</label>
          <select id="susun" className="b-in flex-1 !min-h-11 lg:!w-[210px] lg:!min-h-[50px]" value={susun} onChange={(e) => setSusun(e.target.value as Susun)}>
            <option value="pop">Paling kerap ditempah</option>
            <option value="low">Harga rendah ke tinggi</option>
            <option value="high">Harga tinggi ke rendah</option>
          </select>
        </div>
        <div className="order-3 w-[calc(100%+2rem)] -mx-4 flex gap-2 overflow-x-auto px-4 pt-3 pb-1 lg:order-4 lg:w-full lg:mx-0 lg:px-0 lg:mt-7">
          {[{ slug: null, name: 'Semua' }, ...kategori].map((k) => (
            <button key={k.slug ?? 'semua'} type="button" className="b-chip flex-none" aria-pressed={kat === k.slug} onClick={() => pilihKat(k.slug)}>
              {k.name} <span className="opacity-70">{k.slug ? produk.filter((p) => p.categorySlug === k.slug).length : produk.length}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="lg:flex lg:flex-wrap lg:gap-10 lg:mt-8 lg:items-start">
        <aside aria-label="Tapis harga" className="hidden lg:block lg:flex-[0_1_220px]">
          <p className="font-bold text-[15px]">Harga</p>
          <div className="grid gap-1.5 mt-2.5">
            {HARGA.map((h, i) => (
              <button key={h.nama} type="button" className="b-pill w-full" aria-pressed={harga === i} onClick={() => setHarga(i)}>
                {h.nama}
              </button>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-yk-line">
            <p className="font-serif text-2xl leading-[1.15]">Nak rekaan sendiri?</p>
            <p className="text-[15px] text-yk-muted mt-2">Hantar gambar contoh di WhatsApp. Kami bantu rekakan.</p>
            <Link href="/reka" className="inline-block mt-3 font-semibold underline-offset-[5px]">Tempahan rekaan khas</Link>
          </div>
        </aside>

        <section aria-label="Senarai kek" className="px-4 pt-4 pb-10 lg:p-0 lg:flex-[999_1_640px] lg:min-w-0">
          <p role="status" className="text-[15px] text-yk-muted">{senarai.length} kek</p>
          {senarai.length === 0 && (
            <div className="mt-5 py-10 px-4 lg:py-16 lg:px-6 border border-dashed border-yk-line-strong text-center">
              <p className="font-serif text-2xl lg:text-[30px]">Tiada kek sepadan dengan carian ini.</p>
              <p className="text-yk-muted mt-2 text-[15px] lg:text-base">Cuba nama, kategori atau julat harga lain.</p>
              <button type="button" className="b-btn b-line mt-4 lg:mt-5" onClick={kosongkan}>Kosongkan tapisan</button>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2.5 mt-3.5 lg:grid-cols-3 lg:grid-flow-row-dense lg:gap-[18px] lg:mt-[18px]">
            {senarai.map((p, i) => (
              <KadKek
                key={p.id}
                p={p}
                bentuk={{ phone: i % 5 === 0 ? 'lebar' : 'biasa', desktop: i % 7 === 0 ? 'besar' : i % 7 === 4 ? 'lebar' : 'biasa' }}
                kelewatan={Math.min(1.2, 0.05 + i * 0.05)}
                awal={i === 0}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
