'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { IkonMenu, IkonTutup } from './Ikon';
import { useKurungFokus } from './useKurungFokus';

export type PautanMenu = { href: string; label: string };

export function MenuPhone({ pautan, waHref }: { pautan: PautanMenu[]; waHref: string }) {
  const [buka, setBuka] = useState(false);
  const butang = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  useKurungFokus(panel, buka, () => setBuka(false), butang);

  useEffect(() => {
    if (!buka) return;
    const asal = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = asal;
    };
  }, [buka]);

  return (
    <>
      <button ref={butang} className="b-ic" aria-label="Buka menu" aria-expanded={buka} onClick={() => setBuka(true)}>
        <IkonMenu size={22} />
      </button>
      {buka && (
        <div ref={panel} role="dialog" aria-modal="true" aria-label="Menu" className="fixed inset-0 z-50 bg-yk-bg-deep/97 flex flex-col">
          <div className="flex justify-end p-2">
            <button className="b-ic" aria-label="Tutup menu" onClick={() => setBuka(false)}>
              <IkonTutup size={22} />
            </button>
          </div>
          <nav aria-label="Menu" className="flex flex-col px-6 pt-2">
            {pautan.map((p) => (
              <Link
                key={p.href}
                href={p.href}
                onClick={() => setBuka(false)}
                className="font-serif text-[32px] leading-tight py-3 border-b border-yk-line no-underline"
              >
                {p.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto p-6">
            <a className="b-btn w-full" href={waHref}>WhatsApp kami</a>
          </div>
        </div>
      )}
    </>
  );
}
