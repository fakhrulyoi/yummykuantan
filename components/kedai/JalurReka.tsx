'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useNampak } from '@/lib/useNampak';

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
  const [ref, nampak] = useNampak<HTMLElement>();
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
        style={{ backgroundImage: nampak ? `url(/reka/pusing-${warna}.webp)` : undefined, backgroundSize: '800% auto', backgroundPosition: `${((sudut * 100) / 7).toFixed(4)}% 30%` }}
      />
      <button onClick={() => setPusing((p) => !p)} className="b-btn b-dark absolute right-2.5 top-2.5 lg:right-3.5 lg:top-3.5 !min-h-10 !px-3 lg:!px-3.5 !text-[14px] lg:!text-[14.5px]">
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
    <section ref={ref} aria-labelledby="h-3d" className="b-light mt-11 lg:mt-0 bg-yk-cream text-yk-bg">
      <div className="px-5 py-8 lg:max-w-[1360px] lg:mx-auto lg:px-10 lg:py-24 lg:flex lg:flex-wrap lg:gap-16 lg:items-center">
        <div className="lg:flex-[1_1_380px] lg:max-w-[460px]">
          <h2 id="h-3d" className="text-[34px] leading-none lg:text-[60px] lg:leading-[.98] text-yk-bg">Nak rekaan sendiri? Kami bantu rekakan.</h2>
          <p className="hidden lg:block mt-5 text-[#7C3C44] text-[17px]">
            Hantar gambar contoh, tema dan warna di WhatsApp. Kami cadangkan saiz, rasa dan hiasan yang sesuai. Pusing contoh di sebelah untuk lihat warna krim.
          </p>
          <div className="lg:hidden mt-[18px]">{pratonton('1')}</div>
          <p className="hidden lg:block mt-[26px] font-bold text-[15px]">Warna krim</p>
          {swatch}
          <p className="mt-2 lg:mt-2.5 text-[14.5px] lg:text-[15px] text-[#86464E]">
            Krim segar hanya dalam warna lembut.<span className="hidden lg:inline"> Warna terlalu gelap atau terang menjejaskan rasa.</span>
          </p>
          <Link className="b-btn b-dark mt-4 w-full lg:w-auto lg:mt-8" href="/reka">Tempahan rekaan khas</Link>
        </div>
        <div className="hidden lg:block lg:flex-[1_1_520px]">
          {pratonton('8 / 9', 660)}
          <div className="flex items-center gap-4 mt-3.5">
            <label htmlFor="rot" className="text-[15px] font-bold whitespace-nowrap">Pusing 360°</label>
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
