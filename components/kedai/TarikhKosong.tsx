'use client';

import Link from 'next/link';
import { useState } from 'react';

export type HariPapar = { tarikh: string; hari: string; tarikhNo: number; bulan: string; status: 'tutup' | 'penuh' | 'ada'; baki: number };
export const KUNCI_TARIKH = 'yk-tarikh-pilihan';

export function TarikhKosong({ hari }: { hari: HariPapar[] }) {
  const pertama = hari.findIndex((h) => h.status === 'ada');
  const [pilih, setPilih] = useState(pertama);
  const dipilih = pilih >= 0 ? hari[pilih] : null;
  const simpan = (t: string) => {
    try {
      sessionStorage.setItem(KUNCI_TARIKH, t);
    } catch {
      /* abaikan */
    }
  };
  const butang = (h: HariPapar, i: number) => {
    const warna = h.status !== 'ada' ? '#B0827F' : h.baki <= 3 ? '#F2C28E' : '#BCD7AE';
    const teks = h.status === 'tutup' ? 'Tutup' : h.status === 'penuh' ? 'Penuh' : `${h.baki} slot`;
    return (
      <button
        key={h.tarikh}
        data-tarikh={h.tarikh}
        className="b-day relative flex-none w-[86px] !min-h-[84px] lg:w-auto lg:!min-h-[88px]"
        aria-pressed={pilih === i}
        disabled={h.status !== 'ada'}
        onClick={() => {
          setPilih(i);
          simpan(h.tarikh);
        }}
      >
        <span className="text-yk-muted text-[12.5px] lg:text-[13px]">{h.hari}<span className="sr-only"> </span></span>
        <span className="font-serif whitespace-nowrap text-[22px] lg:text-[25px] leading-[1.15] lg:leading-[1.1]">{h.tarikhNo} {h.bulan}<span className="sr-only">, </span></span>
        <span className="text-xs lg:text-[13px]" style={{ color: warna }}>{teks}</span>
      </button>
    );
  };
  return (
    <section id="slot" aria-labelledby="h-slot" className="pt-7 lg:pt-0 lg:border-b lg:border-yk-line scroll-mt-4">
      <div className="lg:max-w-[1360px] lg:mx-auto lg:px-10 lg:py-12 lg:flex lg:flex-wrap lg:gap-8 lg:items-center">
        <div className="px-5 lg:px-0 lg:flex-[1_1_240px] lg:max-w-[300px]">
          <h2 id="h-slot" className="text-[28px] lg:text-4xl leading-[1.05]">Tarikh yang masih kosong</h2>
          <p className="hidden lg:block mt-2 text-yk-muted text-[15px]">Bilangan kek sehari terhad. Tempah awal.</p>
        </div>
        <div className="flex gap-2 overflow-x-auto px-5 pt-3.5 pb-1 lg:p-0 lg:flex-[999_1_640px] lg:grid lg:grid-cols-7 lg:overflow-visible">
          {hari.map(butang)}
        </div>
        <div className="hidden lg:flex lg:flex-[1_1_200px] justify-end">
          <Link className="b-btn" href="/koleksi" onClick={() => dipilih && simpan(dipilih.tarikh)}>
            {dipilih ? `Tempah untuk ${dipilih.tarikhNo} ${dipilih.bulan}` : 'Lihat koleksi'}
          </Link>
        </div>
      </div>
    </section>
  );
}
