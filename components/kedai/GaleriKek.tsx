'use client';

import Image from 'next/image';
import { useState } from 'react';
import { IkonKanan, IkonKembali } from './Ikon';

/** Galeri halaman kek. Phone: satu gambar dengan anak panah dan titik. Desktop: lajur gambar kecil di kiri. */
export function GaleriKek({ nama, gambar }: { nama: string; gambar: { url: string; alt: string }[] }) {
  const [i, setI] = useState(0);
  const n = gambar.length;
  if (!n) {
    return <div className="yk-tile aspect-[3/4] lg:flex-[1.15_1_540px] grid place-items-center text-yk-muted">Gambar akan ditambah</div>;
  }
  const g = gambar[i];
  const pergi = (k: number) => setI(((k % n) + n) % n);
  return (
    <section aria-label="Gambar" className="relative lg:flex-[1.15_1_540px] lg:flex lg:gap-3.5 lg:flex-wrap-reverse">
      {n > 1 && (
        <div className="hidden lg:flex flex-col gap-2 max-h-[760px] overflow-y-auto">
          {gambar.map((x, k) => (
            <button
              key={x.url}
              type="button"
              className="w-[78px] h-24 p-0 flex-none overflow-hidden bg-[#561920] border border-transparent aria-pressed:border-yk-accent aria-pressed:shadow-[0_0_0_1px_#EBCFC3] cursor-pointer"
              aria-pressed={k === i}
              aria-label={`Gambar ${k + 1}`}
              onClick={() => setI(k)}
            >
              <Image src={x.url} alt="" width={78} height={96} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
      <div className="yk-tile aspect-[3/4] lg:flex-[1_1_400px] lg:max-h-[760px]">
        <Image
          key={g.url}
          src={g.url}
          alt={`${g.alt || nama}, gambar ${i + 1} daripada ${n}`}
          fill
          priority={i === 0}
          sizes="(min-width: 1024px) 600px, 100vw"
        />
      </div>
      {n > 1 && (
        <>
          <button type="button" className="b-ic lg:!hidden absolute left-2 top-[45%] !bg-[rgba(60,13,19,.7)]" aria-label="Gambar sebelum" onClick={() => pergi(i - 1)}>
            <IkonKembali />
          </button>
          <button type="button" className="b-ic lg:!hidden absolute right-2 top-[45%] !bg-[rgba(60,13,19,.7)]" aria-label="Gambar seterusnya" onClick={() => pergi(i + 1)}>
            <IkonKanan />
          </button>
          <div className="flex gap-1.5 justify-center py-3 lg:hidden">
            {gambar.map((x, k) => (
              <button
                key={x.url}
                type="button"
                className="relative w-2 h-2 rounded-full border-0 p-0 bg-[#844450] aria-pressed:bg-yk-accent cursor-pointer before:absolute before:-inset-2 before:content-['']"
                aria-pressed={k === i}
                aria-label={`Gambar ${k + 1}`}
                onClick={() => setI(k)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
