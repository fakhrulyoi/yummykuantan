'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

export function Galeri({ gambar, instagram, tiktok }: { gambar: string[]; instagram: string; tiktok: string }) {
  const [main, setMain] = useState(true);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setMain(false);
  }, []);
  const baris = (senarai: string[], w: number, h: number, sizes: string) =>
    [false, true].flatMap((salinan) =>
      senarai.map((g, i) => (
        <Image key={`${salinan}-${i}`} src={g} alt="" width={w} height={h} sizes={sizes} aria-hidden={salinan || undefined} className="object-cover shrink-0" style={{ width: w, height: h }} />
      )),
    );
  return (
    <section id="tentang" aria-labelledby="h-dapur" className={`${main ? '' : 'yk-paused'} pt-10 lg:border-t lg:border-yk-line lg:pt-20 lg:pb-24 scroll-mt-4`}>
      <div className="flex justify-between items-center px-5 lg:max-w-[1360px] lg:mx-auto lg:px-10 lg:items-end lg:gap-4 lg:flex-wrap">
        <div>
          <h2 id="h-dapur" className="text-[28px] lg:text-5xl">Dari dapur kami</h2>
          <p className="hidden lg:block mt-2 text-yk-muted">
            Ikuti <a href={`https://instagram.com/${instagram}`}>Instagram @{instagram}</a> dan <a href={`https://www.tiktok.com/@${tiktok}`}>TikTok @{tiktok}</a>
          </p>
        </div>
        <button className="b-btn b-line !min-h-10 !px-3 !text-[14.5px] lg:!min-h-11 lg:!px-[26px] lg:!text-[15px]" onClick={() => setMain((m) => !m)}>
          {main ? 'Jeda' : 'Main'}
        </button>
      </div>
      <div className="yk-mqwrap mt-3.5 lg:hidden">
        <div className="yk-mq gap-2 pr-2" style={{ ['--d' as string]: '55s' }}>{baris(gambar, 180, 230, '180px')}</div>
      </div>
      <div className="hidden lg:block">
        <div className="yk-mqwrap mt-8">
          <div className="yk-mq gap-3.5 pr-3.5" style={{ ['--d' as string]: '70s' }}>{baris(gambar, 300, 380, '300px')}</div>
        </div>
        <div className="yk-mqwrap mt-3.5">
          <div className="yk-mq rev gap-3.5 pr-3.5" style={{ ['--d' as string]: '80s' }}>{baris([...gambar].reverse(), 240, 240, '240px')}</div>
        </div>
      </div>
      <p className="lg:hidden px-5 pt-3 text-[15px] text-yk-muted">
        <a href={`https://instagram.com/${instagram}`}>Instagram @{instagram}</a>, <a href={`https://www.tiktok.com/@${tiktok}`}>TikTok @{tiktok}</a>
      </p>
    </section>
  );
}
