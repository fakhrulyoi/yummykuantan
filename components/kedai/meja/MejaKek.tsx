'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react';
import { useNampak } from '@/lib/useNampak';
import { formatRM } from '@/lib/tempahan/wang';
import { IkonKanan, IkonKembali } from '../Ikon';
import { DialogKek } from './DialogKek';
import type { KekMeja, MejaKekProps } from './jenis';
import { AWAL, mejaReducer, type AksiMeja, type KeadaanMeja } from './useMejaKek';

const LEBAR_D = 1320;
const SELANG_AUTO = 2600;

function useMedia(q: string) {
  const [ya, setYa] = useState(false);
  useEffect(() => {
    const m = window.matchMedia(q);
    const f = () => setYa(m.matches);
    f();
    m.addEventListener('change', f);
    return () => m.removeEventListener('change', f);
  }, [q]);
  return ya;
}

export function MejaKek({ items, autoplay = true }: MejaKekProps) {
  const n = items.length;
  const [s, hantar] = useReducer((st: KeadaanMeja, a: AksiMeja) => mejaReducer(st, a, n), AWAL);
  const desktop = useMedia('(min-width: 1024px)');
  const [refMeja, nampak] = useNampak<HTMLDivElement>();
  const kayu = nampak ? 'url(/meja/kayu.webp)' : undefined;
  const kurangGerak = useMedia('(prefers-reduced-motion: reduce)');
  const kekRef = useRef<Record<string, HTMLButtonElement | null>>({});
  const fokusSelepas = useRef(false);

  // Main automatik: desktop sahaja, bukan bila kurang pergerakan.
  useEffect(() => {
    hantar({ t: 'auto', on: autoplay && desktop && !kurangGerak });
  }, [autoplay, desktop, kurangGerak]);
  useEffect(() => {
    if (!s.auto) return;
    const t = setInterval(() => hantar({ t: 'tik' }), SELANG_AUTO);
    return () => clearInterval(t);
  }, [s.auto]);

  // Fokus ikut kek yang menyala bila pengguna guna papan kekunci.
  useEffect(() => {
    if (!fokusSelepas.current || s.lit === null) return;
    fokusSelepas.current = false;
    kekRef.current[`${desktop ? 'd' : 'p'}${s.lit}`]?.focus();
  }, [s.lit, desktop]);

  const kekunci = (e: React.KeyboardEvent) => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    fokusSelepas.current = true;
    hantar({ t: 'kekunci', key: e.key });
  };

  const tekan = (i: number) => (s.lit === i ? hantar({ t: 'buka', i }) : hantar({ t: 'nyala', i }));

  if (!n) return null;
  const lit = s.lit === null ? null : items[s.lit];
  const buka = s.open === null ? null : items[s.open];
  const label = (k: KekMeja) => `${k.name}, dari ${formatRM(Math.min(...k.sizes.map((z) => z.priceSen)))}. Tekan untuk lihat.`;

  const maklumat = (
    <div aria-live="polite" className="relative z-[3] min-h-[150px] px-5 pt-[18px] lg:p-0 lg:text-center lg:min-h-32 lg:max-w-[560px]">
      {lit ? (
        <>
          <p className="font-serif text-[26px] lg:text-[32px] leading-[1.1]">
            {lit.name}
            <span className="hidden lg:inline ml-3 align-middle"><span className="mj-tag font-sans">dari {formatRM(Math.min(...lit.sizes.map((z) => z.priceSen)))}</span></span>
          </p>
          <p className="mt-1.5 lg:hidden"><span className="mj-tag">dari {formatRM(Math.min(...lit.sizes.map((z) => z.priceSen)))}</span></p>
          <p className="text-yk-cream-2 mt-2 text-[15px] lg:text-[15.5px] lg:mt-1.5">{lit.description}</p>
          <button className="b-btn w-full mt-3.5 lg:w-auto lg:mt-4 lg:min-h-12" onClick={() => hantar({ t: 'buka', i: s.lit! })}>
            Lihat kek ini
          </button>
        </>
      ) : (
        <p className="text-yk-cream-2">Halakan tetikus pada kek untuk nyalakan lampu. Tekan kek untuk lihat saiz, harga dan tempah.</p>
      )}
    </div>
  );

  return (
    <div ref={refMeja}>
      {desktop ? (
        <PentasDesktop items={items} s={s} kekunci={kekunci} tekan={tekan} hantar={hantar} label={label} kekRef={kekRef} maklumat={maklumat} kayu={kayu} />
      ) : (
        <PentasPhone items={items} s={s} kekunci={kekunci} tekan={tekan} hantar={hantar} label={label} kekRef={kekRef} maklumat={maklumat} kayu={kayu} />
      )}
      {buka && (
        <DialogKek
          kek={buka}
          no={s.open! + 1}
          jumlah={n}
          saiz={s.saiz}
          pilihSaiz={(k) => hantar({ t: 'saiz', k })}
          tutup={() => hantar({ t: 'tutup' })}
          pencetus={() => kekRef.current[`${desktop ? 'd' : 'p'}${s.open}`] ?? null}
        />
      )}
    </div>
  );
}

type PentasProps = {
  items: KekMeja[];
  s: KeadaanMeja;
  kekunci: (e: React.KeyboardEvent) => void;
  tekan: (i: number) => void;
  hantar: (a: AksiMeja) => void;
  label: (k: KekMeja) => string;
  kekRef: React.RefObject<Record<string, HTMLButtonElement | null>>;
  maklumat: React.ReactNode;
  kayu?: string;
};

function Kek({ k, i, s, tekan, hantar, label, kekRef, kunci, w, h, sizes, phone }: Omit<PentasProps, 'items' | 'kekunci' | 'maklumat' | 'kayu'> & {
  k: KekMeja; i: number; kunci: string; w: number; h: number; sizes: string; phone: boolean;
}) {
  const on = s.lit === i;
  return (
    <button
      ref={(el) => {
        kekRef.current[kunci] = el;
      }}
      className="mj-cake"
      aria-pressed={on}
      tabIndex={on || (s.lit === null && i === 0) ? 0 : -1}
      aria-label={label(k)}
      onMouseEnter={phone ? undefined : () => s.lit !== i && hantar({ t: 'nyala', i })}
      onFocus={() => s.lit !== i && hantar({ t: 'nyala', i })}
      onClick={() => tekan(i)}
      style={{ width: w, height: h }}
    >
      <Image src={k.tableImage} alt="" width={600} height={900} sizes={sizes} loading="lazy" />
    </button>
  );
}

function PentasDesktop({ items, s, kekunci, tekan, hantar, label, kekRef, maklumat, kayu }: PentasProps) {
  const bekas = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(1);
  useLayoutEffect(() => {
    const el = bekas.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setK(Math.min(1, e.contentRect.width / LEBAR_D)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const n = items.length;
  return (
    <>
      <div ref={bekas} className="mt-7 mx-[60px]" style={{ height: 640 * k }}>
        <div
          className="mj-stage"
          role="group"
          aria-label="Meja kek. Guna anak panah kiri dan kanan untuk tukar kek."
          onKeyDown={kekunci}
          style={{ width: LEBAR_D, height: 640, transform: `scale(${k})`, transformOrigin: '0 0' }}
        >
          <div className="mj-rail" aria-hidden="true" style={{ left: -60, right: -60 }} />
          <div aria-hidden="true" className="mj-top" style={{ top: 470, height: 110, backgroundImage: kayu }} />
          <div aria-hidden="true" className="mj-edge" style={{ top: 580, height: 26, backgroundImage: kayu }} />
          {items.map((c, i) => {
            const on = s.lit === i;
            const anjak = s.lit === null || on ? 0 : (i < s.lit ? -1 : 1) * 16;
            return (
              <div
                key={c.id}
                className="mj-slot"
                style={{ left: `${(((i + 0.5) / n) * 100).toFixed(3)}%`, top: 0, width: 180, height: 520, ['--glow' as string]: on ? 1 : 0, ['--tx' as string]: `${anjak}px`, ['--lift' as string]: on ? '-8px' : '0px' }}
              >
                <span className="mj-fix" aria-hidden="true" />
                <span className="mj-beam" aria-hidden="true" style={{ width: 300, height: 510 }} />
                <span className="mj-pool" aria-hidden="true" style={{ top: 520, width: 300, height: 74 }} />
                <span className="mj-shadow" aria-hidden="true" style={{ top: 518, width: '70%', height: 22 }} />
                <Kek k={c} i={i} s={s} tekan={tekan} hantar={hantar} label={label} kekRef={kekRef} kunci={`d${i}`} w={180} h={270} sizes="180px" phone={false} />
              </div>
            );
          })}
        </div>
      </div>
      <div className="relative z-[3] grid grid-cols-[1fr_auto_1fr] items-start gap-6 px-[60px] mt-2">
        <div>
          <button
            onClick={() => hantar({ t: 'auto', on: !s.auto })}
            className="min-h-11 px-3.5 border border-yk-line rounded-full bg-transparent text-yk-muted text-[14.5px] font-semibold"
          >
            {s.auto ? 'Jeda' : 'Main'} lampu automatik
          </button>
        </div>
        {maklumat}
        <div className="justify-self-end">
          <Link className="b-btn b-line !min-h-11 !px-[18px] !text-[15px]" href="/koleksi">Semua koleksi</Link>
        </div>
      </div>
    </>
  );
}

function PentasPhone({ items, s, kekunci, tekan, hantar, label, kekRef, maklumat, kayu }: PentasProps) {
  const mula = useRef<number | null>(null);
  // Petunjuk pertama: hilang selepas sentuhan pertama atau 7 saat.
  const [petunjuk, setPetunjuk] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setPetunjuk(false), 7000);
    return () => clearTimeout(t);
  }, []);
  const lit = s.lit ?? 0;
  const butang = 'absolute top-[250px] z-[4] w-11 h-11 rounded-full border border-yk-line-strong bg-[rgba(42,9,14,.7)] text-yk-cream inline-flex items-center justify-center';
  return (
    <>
      <div
        className="mj-stage mt-3.5 overflow-hidden touch-pan-y"
        role="group"
        aria-label="Meja kek. Sapu ke kiri atau kanan."
        onKeyDown={kekunci}
        onPointerDown={(e) => {
          mula.current = e.clientX;
          setPetunjuk(false);
        }}
        onPointerUp={(e) => {
          if (mula.current === null) return;
          const dx = e.clientX - mula.current;
          mula.current = null;
          if (Math.abs(dx) > 40) hantar({ t: 'sapu', arah: dx < 0 ? 1 : -1 });
        }}
        onPointerCancel={() => {
          mula.current = null;
        }}
        style={{ height: 540 }}
      >
        <div className="mj-rail" aria-hidden="true" />
        <p
          aria-hidden="true"
          className={`absolute left-1/2 top-3 z-[5] -translate-x-1/2 whitespace-nowrap rounded-full border border-yk-line-strong bg-[rgba(42,9,14,.82)] px-4 py-2 text-[14px] font-semibold text-yk-cream transition-opacity duration-500 ${petunjuk ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          <span className="mj-leret inline-block">&larr;</span> Leret untuk lihat {items.length} kek <span className="mj-leret inline-block">&rarr;</span>
        </p>
        <div aria-hidden="true" className="mj-top" style={{ top: 398, height: 92, backgroundImage: kayu, backgroundSize: '600px auto' }} />
        <div aria-hidden="true" className="mj-edge" style={{ top: 490, height: 20, backgroundImage: kayu, backgroundSize: '600px auto' }} />
        <div className="absolute inset-0 transition-transform duration-[600ms] ease-[cubic-bezier(.2,.75,.2,1)]" style={{ transform: `translateX(${-lit * 62}%)` }}>
          {items.map((c, i) => {
            const on = s.lit === i;
            return (
              <div
                key={c.id}
                className="mj-slot"
                style={{ left: `${19 + i * 62 + 31}%`, top: 0, width: 250, height: 446, ['--glow' as string]: on ? 1 : 0, ['--tx' as string]: '0px', ['--lift' as string]: on ? '-8px' : '0px' }}
              >
                <span className="mj-fix" aria-hidden="true" />
                <span className="mj-beam" aria-hidden="true" style={{ width: 290, height: 436 }} />
                <span className="mj-pool" aria-hidden="true" style={{ top: 446, width: 290, height: 74 }} />
                <span className="mj-shadow" aria-hidden="true" style={{ top: 444, width: '70%', height: 22 }} />
                <Kek k={c} i={i} s={s} tekan={tekan} hantar={hantar} label={label} kekRef={kekRef} kunci={`p${i}`} w={250} h={375} sizes="250px" phone />
              </div>
            );
          })}
        </div>
        <button onClick={() => { setPetunjuk(false); hantar({ t: 'sebelum' }); }} aria-label="Kek sebelum" className={`${butang} left-2`}>
          <IkonKembali size={18} />
        </button>
        <button onClick={() => { setPetunjuk(false); hantar({ t: 'seterusnya' }); }} aria-label="Kek seterusnya" className={`${butang} right-2`}>
          <IkonKanan size={18} />
        </button>
      </div>
      <div className="flex justify-center gap-1.5 mt-1 relative z-[3]">
        {items.map((c, i) => (
          <button
            key={c.id}
            className="mj-dot"
            aria-pressed={s.lit === i}
            aria-label={`Kek ${i + 1}`}
            onClick={() => hantar({ t: 'nyala', i })}
            style={{ width: s.lit === i ? 22 : 7 }}
          />
        ))}
      </div>
      {maklumat}
      <div className="relative z-[3] px-5 mt-3">
        <Link className="b-btn b-line w-full" href="/koleksi">Lihat semua kek</Link>
      </div>
    </>
  );
}
