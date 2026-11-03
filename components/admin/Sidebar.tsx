'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logKeluar } from '@/app/admin/login/actions';

const NAV: { href: string; label: string; d: string }[] = [
  { href: '/admin', label: 'Papan pemuka', d: 'M4 13h6V4H4zM14 20h6v-9h-6zM14 4h6v4h-6zM4 20h6v-3H4z' },
  { href: '/admin/tempahan', label: 'Tempahan', d: 'M5 4h14v16H5zM9 9h6M9 13h6M9 17h4' },
  { href: '/admin/produk', label: 'Produk', d: 'M4 20h16v-8H4zM6 12V9h12v3M12 9V5' },
  { href: '/admin/meja', label: 'Gambar meja kek', d: 'M3 10h18M5 10v9M19 10v9M8 10V7a4 4 0 018 0v3' },
  { href: '/admin/kandungan', label: 'Kandungan laman', d: 'M4 5h16v14H4zM8 9h8M8 13h5' },
  { href: '/admin/soalan', label: 'Soalan lazim', d: 'M9.5 9a2.5 2.5 0 115 0c0 2-2.5 2-2.5 4M12 17h.01M12 21a9 9 0 100-18 9 9 0 000 18z' },
  { href: '/admin/tetapan', label: 'Tetapan', d: 'M12 15a3 3 0 100-6 3 3 0 000 6zM4 12h2M18 12h2M12 4v2M12 18v2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M6.3 17.7l1.4-1.4M16.3 7.7l1.4-1.4' },
];

export function Sidebar({ nama, peranan }: { nama: string; peranan: 'OWNER' | 'STAFF' }) {
  const laluan = usePathname();
  const aktif = (h: string) => (h === '/admin' ? laluan === '/admin' : laluan.startsWith(h));
  return (
    <aside aria-label="Menu admin" className="bg-[#4B141B] text-[#F2E7DE] lg:flex-[0_0_248px] lg:min-h-screen lg:sticky lg:top-0 lg:self-start lg:h-screen px-3.5 py-3 lg:py-[22px] flex flex-col gap-3 lg:gap-5">
      <div className="px-2.5 flex items-center gap-3">
        <Image src="/logo-krim.png" alt="" width={58} height={58} className="h-10 lg:h-[58px] w-auto" />
        <div>
          <p className="font-serif text-lg lg:text-xl leading-[1.1]">Yummy Kuantan</p>
          <p className="text-[12.5px] text-[#D3B1AB]">Panel admin</p>
        </div>
      </div>
      <nav className="ad-nav flex lg:flex-col gap-0.5 overflow-x-auto -mx-3.5 px-3.5 lg:mx-0 lg:px-0">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} aria-current={aktif(n.href) ? 'page' : undefined} className="flex-none">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d={n.d} /></svg>
            {n.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center justify-between gap-3 px-2.5 pt-2 border-t border-[#74343C] text-[13px] text-[#D3B1AB] lg:block lg:mt-auto lg:p-3">
        <p><span className="text-[#F2E7DE] font-semibold lg:block">{nama}</span> <span className="lg:block">{peranan === 'OWNER' ? 'Pemilik' : 'Staf'}</span></p>
        <div className="flex gap-3 lg:mt-2.5">
          <Link href="/" className="!text-[#E2CEC6] text-[13px]" target="_blank">Lihat laman</Link>
          <form action={logKeluar}>
            <button type="submit" className="bg-transparent border-0 p-0 text-[13px] text-[#E2CEC6] underline cursor-pointer">Log keluar</button>
          </form>
        </div>
      </div>
    </aside>
  );
}
