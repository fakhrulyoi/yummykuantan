'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { formatRM } from '@/lib/tempahan/wang';

export type JenisPapar = { slug: string; name: string; blurb: string; img: string | null; count: number; dari: number };

export function PilihJenis({ jenis }: { jenis: JenisPapar[] }) {
  const [buka, setBuka] = useState(0);
  const ringkas = (j: JenisPapar) => `${j.count} jenis, dari ${formatRM(j.dari)}`;
  return (
    <section aria-labelledby="h-kol" className="pt-10 lg:max-w-[1360px] lg:mx-auto lg:px-10 lg:pt-[72px] lg:pb-24">
      <h2 id="h-kol" className="text-[28px] px-5 lg:px-0 lg:text-5xl">Pilih ikut jenis</h2>
      {/* Phone: jubin yang boleh ditatal */}
      <div className="lg:hidden flex gap-2.5 overflow-x-auto snap-x snap-mandatory px-5 pt-3.5 pb-1.5">
        {jenis.map((j) => (
          <Link key={j.slug} className="yk-tile flex-none w-[220px] h-[300px] snap-start" href={`/koleksi?kategori=${j.slug}`}>
            {j.img && <Image src={j.img} alt="" fill sizes="220px" />}
            <span aria-hidden="true" className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(42,9,14,.05), rgba(42,9,14,.88))' }} />
            <span className="absolute left-3.5 right-3.5 bottom-3">
              <span className="block font-serif text-[26px] leading-[1.05]">{j.name}</span>
              <span className="text-[12.5px] text-yk-accent font-semibold">{ringkas(j)}</span>
            </span>
          </Link>
        ))}
      </div>
      {/* Desktop: panel yang mengembang */}
      <div className="hidden lg:flex gap-2.5 h-[540px] mt-7">
        {jenis.map((j, i) => {
          const on = i === buka;
          return (
            <Link
              key={j.slug}
              className="yk-panel"
              href={`/koleksi?kategori=${j.slug}`}
              data-open={on}
              onMouseEnter={() => setBuka(i)}
              onFocus={() => setBuka(i)}
              style={{ flexGrow: on ? 3.4 : 1, flexBasis: 0 }}
            >
              {j.img && <Image src={j.img} alt="" fill sizes="(min-width: 1360px) 700px, 50vw" style={{ transform: `scale(${on ? 1 : 1.12})` }} />}
              <span aria-hidden="true" className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(42,9,14,.15), rgba(42,9,14,.85))' }} />
              <span
                aria-hidden="true"
                className="yk-pv absolute left-1/2 bottom-7 font-serif text-[26px] whitespace-nowrap"
                style={{ transform: 'translateX(-50%) rotate(180deg)', writingMode: 'vertical-rl' }}
              >
                {j.name}
              </span>
              <span className="yk-pi absolute left-7 right-7 bottom-[26px]">
                <span className="block font-serif text-[44px] leading-none">{j.name}</span>
                <span className="block mt-2 text-[#ECDDD3] max-w-[380px]">{j.blurb}</span>
                <span className="inline-flex gap-4 mt-3.5 text-sm text-yk-accent font-semibold">{ringkas(j)}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
