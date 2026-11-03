'use client';

import { tarikhPendek, tarikhPenuh } from '@/lib/tempahan/tarikh';

export type HariJalur = { tarikh: string; status: 'ada' | 'penuh' | 'tutup' | 'awal'; baki: number };

/** Jalur tarikh untuk senarai tempahan: 14 hari dengan baki slot. Phone: leret mendatar. Desktop: grid 7 lajur. */
export function JalurTarikh({ hari, pilih, onPilih }: { hari: HariJalur[]; pilih: string | null; onPilih: (t: string) => void }) {
  const bulan = [...new Set(hari.map((h) => tarikhPenuh(h.tarikh).split(' ').slice(-2).join(' ')))].join(' dan ');
  return (
    <>
      <h3 id="h-tarikh" className="font-serif font-normal text-2xl lg:text-[13.5px] lg:font-sans lg:font-semibold lg:text-yk-cream-2 px-4 lg:px-0 lg:mt-5 lg:mb-1.5">
        Tarikh<span className="hidden lg:inline">, {bulan}</span>
      </h3>
      <div role="group" aria-label="Tarikh" className="flex gap-1.5 overflow-x-auto px-4 pt-2.5 pb-1 lg:grid lg:grid-cols-7 lg:p-0 lg:overflow-visible">
        {hari.map((h) => {
          const p = tarikhPendek(h.tarikh);
          const teks = h.status === 'tutup' ? 'Tutup' : h.status === 'penuh' ? 'Penuh' : h.status === 'awal' ? 'Terlalu awal' : `${h.baki} slot`;
          const warna = h.status !== 'ada' ? '#B0827F' : h.baki <= 3 ? '#F2C28E' : '#BCD7AE';
          return (
            <button
              key={h.tarikh}
              type="button"
              data-tarikh={h.tarikh}
              className="b-day relative flex-none w-[70px] !min-h-[76px] !p-2 lg:w-auto lg:!px-2.5"
              aria-pressed={pilih === h.tarikh}
              disabled={h.status !== 'ada'}
              onClick={() => onPilih(h.tarikh)}
            >
              <span className="text-xs lg:text-[12.5px] text-yk-muted">{p.hari}<span className="sr-only"> </span></span>
              <span className="font-serif text-[22px] leading-[1.1] whitespace-nowrap">
                {p.tarikh}<span className="hidden lg:inline"> {p.bulan}</span><span className="sr-only lg:hidden"> {p.bulan}</span>
                <span className="sr-only">, </span>
              </span>
              <span className="text-[11.5px] lg:text-xs" style={{ color: warna }}>{teks}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
