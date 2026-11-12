'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { IkonWhatsApp } from './Ikon';

const SEMBUNYI = ['/kek/', '/senarai', '/tempahan/', '/reka'];

/**
 * Bar bawah untuk phone: WhatsApp dan pautan ke koleksi. Halaman yang ada bar tindakan sendiri tidak memaparkannya.
 * Di laman utama, bar muncul hanya selepas butang hero ditatal keluar supaya "Lihat koleksi" tidak berganda.
 */
export function BarWhatsApp({ waHref }: { waHref: string }) {
  const laluan = usePathname();
  const utama = laluan === '/';
  const [lepasHero, setLepasHero] = useState(false);
  useEffect(() => {
    if (!utama) return;
    const semak = () => setLepasHero(window.scrollY > window.innerHeight * 0.75);
    semak();
    window.addEventListener('scroll', semak, { passive: true });
    return () => window.removeEventListener('scroll', semak);
  }, [utama]);
  if (SEMBUNYI.some((p) => laluan.startsWith(p))) return null;
  if (utama && !lepasHero) return null;
  return (
    <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 flex gap-2 px-4 pt-3 pb-4 bg-[rgba(60,13,19,.97)] border-t border-yk-line">
      <a className="b-btn b-line !px-4" href={waHref} aria-label="WhatsApp kami"><IkonWhatsApp /></a>
      <Link className="b-btn flex-1" href="/koleksi">Lihat koleksi</Link>
    </div>
  );
}
