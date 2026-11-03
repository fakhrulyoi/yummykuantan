'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const WARNA = [
  { k: 'ivory', nama: 'Krim putih', hex: '#F3EBDD' },
  { k: 'blush', nama: 'Merah jambu lembut', hex: '#EBC4BA' },
  { k: 'matcha', nama: 'Pistachio', hex: '#C9D3AD' },
  { k: 'sky', nama: 'Biru lembut', hex: '#D4E0EC' },
];

export function JalurReka() {
  const [warna, setWarna] = useState('blush');
  const [sudut, setSudut] = useState(1);
  const [pusing, setPusing] = useState(true);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setPusing(false);
  }, []);
  useEffect(() => {
    if (!pusing) return;
    const t = setInterval(() => setSudut((a) => (a + 1) % 8), 650);
    return () => clearInterval(t);
  }, [pusing]);

  const pratonton = (nisbah: string, hadTinggi?: number) => (
    <div className="relative overflow-hidden bg-yk-bg-deep" style={{ aspectRatio: nisbah, maxHeight: hadTinggi }}>
      <div
        role="img"
        aria-label="Pratonton 3D kek dua tingkat yang sedang berpusing"
        className="w-full h-full bg-no-repeat"
        style={{ backgroundImage: `url(/reka/pusing-${warna}.webp)`, backgroundSize: '800% auto', backgroundPosition: `${((sudut * 100) / 7).toFixed(4)}% 30%` }}
      />
      <button onClick={() => setPusing((p) => !p)} className="b-btn b-dark absolute right-2.5 top-2.5 lg:right-3.5 lg:top-3.5 !min-h-10 !px-3 lg:!px-3.5 !text-[12.5px] lg:!text-[13px]">
        {pusing ? 'Jeda' : 'Pusing'}
      </button>
    </div>
  );

  const swatch = (
    <div className="flex gap-3 mt-3.5 lg:mt-2.5">
      {WARNA.map((w) => (
        <button
          key={w.k}
          className="b-sw"
          aria-pressed={warna === w.k}
          aria-label={w.nama}
          title={w.nama}
          onClick={() => setWarna(w.k)}
          style={{ background: w.hex, borderColor: 'rgba(60,13,19,.25)' }}
        />
      ))}
    </div>
  );

  return (
    <section aria-labelledby="h-3d" className="b-light mt-11 lg:mt-0 bg-yk-cream text-yk-bg">
      <div className="px-5 py-8 lg:max-w-[1360px] lg:mx-auto lg:px-10 lg:py-24 lg:flex lg:flex-wrap lg:gap-16 lg:items-center">
        <div className="lg:flex-[1_1_380px] lg:max-w-[460px]">
          <h2 id="h-3d" className="text-[34px] leading-none lg:text-[60px] lg:leading-[.98] text-yk-bg">Nak rekaan sendiri? Tengok dulu dalam 3D.</h2>
          <p className="hidden lg:block mt-5 text-[#7C3C44] text-[17px]">
            Pilih bentuk, tingkat, rasa, warna krim dan hiasan. Pusing kek, lihat setiap sudut, kemudian hantar reka kepada kami di WhatsApp.
          </p>
          <div className="lg:hidden mt-[18px]">{pratonton('1')}</div>
          <p className="hidden lg:block mt-[26px] font-bold text-sm">Warna krim</p>
          {swatch}
          <p className="mt-2 lg:mt-2.5 text-[13px] lg:text-[13.5px] text-[#86464E]">
            Krim segar hanya dalam warna lembut.<span className="hidden lg:inline"> Warna terlalu gelap atau terang menjejaskan rasa.</span>
          </p>
          <Link className="b-btn b-dark mt-4 w-full lg:w-auto lg:mt-8" href="/reka">Buka studio 3D</Link>
        </div>
        <div className="hidden lg:block lg:flex-[1_1_520px]">
          {pratonton('8 / 9', 660)}
          <div className="flex items-center gap-4 mt-3.5">
            <label htmlFor="rot" className="text-sm font-bold whitespace-nowrap">Pusing 360°</label>
            <input
              id="rot"
              type="range"
              min={0}
              max={7}
              value={sudut}
              onChange={(e) => {
                setPusing(false);
                setSudut(Number(e.target.value));
              }}
              className="flex-1 accent-yk-bg"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
