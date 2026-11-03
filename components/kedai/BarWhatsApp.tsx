'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IkonWhatsApp } from './Ikon';

const SEMBUNYI = ['/kek/', '/senarai', '/tempahan/'];

/** Bar bawah untuk phone: WhatsApp dan pautan ke koleksi. Halaman yang ada bar tindakan sendiri tidak memaparkannya. */
export function BarWhatsApp({ waHref }: { waHref: string }) {
  const laluan = usePathname();
  if (SEMBUNYI.some((p) => laluan.startsWith(p))) return null;
  return (
    <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 flex gap-2 px-4 pt-3 pb-4 bg-[rgba(60,13,19,.97)] border-t border-yk-line">
      <a className="b-btn b-line !px-4" href={waHref} aria-label="WhatsApp kami"><IkonWhatsApp /></a>
      <Link className="b-btn flex-1" href="/koleksi">Lihat koleksi</Link>
    </div>
  );
}
