'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { mesejRalat } from '@/lib/tempahan/mesejRalat';
import { formatRM } from '@/lib/tempahan/wang';
import { IkonKanan, IkonTutup, IkonWhatsApp } from '../Ikon';
import { useKurungFokus } from '../useKurungFokus';
import type { KekMeja } from './jenis';
import { skalaSaiz } from './useMejaKek';

type Props = {
  kek: KekMeja;
  no: number;
  jumlah: number;
  saiz: number;
  pilihSaiz: (k: number) => void;
  tutup: () => void;
  tempah: (sizeId: string) => Promise<void>;
  pencetus: () => HTMLElement | null;
};

export function DialogKek({ kek, no, jumlah, saiz, pilihSaiz, tutup, tempah, pencetus }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [sibuk, setSibuk] = useState(false);
  const [ralat, setRalat] = useState('');
  useKurungFokus(ref, true, tutup, pencetus);
  const zi = Math.min(saiz, kek.sizes.length - 1);
  const z = kek.sizes[zi];
  const pad = (n: number) => String(n).padStart(2, '0');

  async function tekanTempah() {
    setSibuk(true);
    setRalat('');
    try {
      await tempah(z.id);
    } catch (e) {
      setRalat(mesejRalat(e instanceof Error ? e.message : ''));
    } finally {
      setSibuk(false);
    }
  }

  return (
    <div ref={ref} className="mj-dialog" role="dialog" aria-modal="true" aria-labelledby="mj-dt">
      <div className="mj-backdrop" onClick={tutup} />
      <button
        onClick={tutup}
        className="absolute right-3 top-3 lg:right-7 lg:top-6 z-[2] inline-flex items-center gap-2 min-h-11 px-4 border border-yk-line-strong rounded-full bg-[rgba(42,9,14,.6)] text-yk-cream text-[13px] font-semibold"
      >
        Tutup <IkonTutup size={16} />
      </button>
      <div className="relative w-full max-w-[1040px] flex flex-wrap items-center justify-center gap-2 pt-12 lg:gap-x-[72px] lg:gap-y-6 lg:pt-0">
        <div className="relative flex-none w-[300px] h-[360px] lg:w-[420px] lg:h-[520px]">
          <div className="mj-beam" style={{ ['--glow' as string]: 1, top: '-40%', width: '150%', height: '130%' }} />
          <div className="mj-pool" style={{ ['--glow' as string]: 1, top: '97%', width: '130%', height: 70 }} />
          <div className="mj-shadow" style={{ top: '98%', width: '70%', height: 26 }} />
          <div className="mj-fig absolute inset-0">
            <Image
              src={kek.tableImage}
              alt={kek.name}
              fill
              sizes="(min-width: 1024px) 420px, 300px"
              className="object-contain object-bottom"
              style={{ transform: `scale(${skalaSaiz(zi, kek.sizes.length).toFixed(3)})` }}
            />
          </div>
        </div>
        <div className="mj-info flex-[1_1_300px] lg:flex-[1_1_340px] max-w-[420px] text-left px-1 pb-6 lg:p-0">
          <p className="text-xs tracking-[.2em] text-yk-muted tabular-nums">
            {pad(no)} / {pad(jumlah)} &nbsp;·&nbsp; {kek.category}
          </p>
          <h3 id="mj-dt" className="text-[34px] lg:text-[48px] leading-[1.02] mt-2.5">{kek.name}</h3>
          <p className="text-yk-cream-2 mt-2.5 text-[14.5px] lg:text-base">{kek.description}</p>
          <p className="b-lbl mt-5">
            Saiz{kek.sizes.length > 1 && <span className="font-normal text-yk-muted">, kek berubah ikut saiz dipilih</span>}
          </p>
          <div role="group" aria-label="Saiz" className="flex flex-wrap gap-2">
            {kek.sizes.map((x, k) => (
              <button key={x.id} className="b-pill" aria-pressed={k === zi} onClick={() => pilihSaiz(k)}>
                {x.label}
                <span className="block text-[12.5px] text-yk-muted">{formatRM(x.priceSen)}</span>
              </button>
            ))}
          </div>
          <ul className="flex flex-wrap gap-2 mt-4 text-[12.5px] text-yk-cream-2">
            <li className="border border-yk-line rounded-full px-3 py-1">Tempah {kek.leadDays} hari awal</li>
            <li className="border border-yk-line rounded-full px-3 py-1">Ambil sendiri atau hantar ke Kuantan dan Pekan</li>
          </ul>
          <p className="font-serif text-[30px] lg:text-[38px] mt-[18px]" aria-live="polite">{formatRM(z.priceSen)}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            <button className="b-btn flex-[1_1_200px]" onClick={tekanTempah} disabled={sibuk} aria-busy={sibuk}>
              <IkonWhatsApp /> {sibuk ? 'Membuka WhatsApp…' : 'Tempah di WhatsApp'}
            </button>
            <Link className="b-btn b-line flex-[1_1_100%] lg:flex-[0_1_auto]" href={kek.href}>Lihat kek</Link>
          </div>
          {ralat && <p role="alert" className="mt-3 text-yk-error text-sm">{ralat}</p>}
          {kek.allowDesign && (
            <Link href="/reka" className="inline-flex items-center gap-1.5 mt-3 min-h-11 font-semibold text-sm">
              Nak ubah rekaan? Reka sendiri dalam 3D <IkonKanan size={18} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
