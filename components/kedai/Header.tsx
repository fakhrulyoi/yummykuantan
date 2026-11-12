import Link from 'next/link';
import { waUrl } from '@/lib/tempahan/mesej';
import { PautanSenaraiDesktop, PautanSenaraiPhone } from './BilSenarai';
import { IkonCari } from './Ikon';
import { Logo } from './Logo';
import { MenuPhone } from './MenuPhone';

const NAV = [
  { href: '/koleksi', label: 'Koleksi' },
  { href: '/reka', label: 'Rekaan khas' },
  { href: '/#slot', label: 'Tarikh kosong' },
  { href: '/#tentang', label: 'Tentang kami' },
];

export function Header({ whatsapp }: { whatsapp: string }) {
  const wa = waUrl(whatsapp, 'Salam Yummy Kuantan, saya ada soalan tentang tempahan kek.');
  return (
    <header className="border-b border-yk-line bg-yk-bg">
      {/* Phone */}
      <div className="lg:hidden flex items-center justify-between px-2 py-1.5">
        <MenuPhone pautan={[...NAV, { href: '/semak', label: 'Semak tempahan' }]} waHref={wa} />
        <Link href="/" aria-label="Yummy Kuantan, laman utama" className="block leading-none">
          <Logo tinggi={50} priority />
        </Link>
        <PautanSenaraiPhone />
      </div>
      {/* Desktop */}
      <div className="hidden lg:grid max-w-[1360px] mx-auto px-10 h-24 grid-cols-[1fr_auto_1fr] items-center gap-6">
        <nav className="b-nav flex gap-7" aria-label="Menu utama">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href}>{n.label}</Link>
          ))}
        </nav>
        <Link href="/" aria-label="Yummy Kuantan, laman utama" className="block leading-none">
          <Logo tinggi={76} priority />
        </Link>
        <div className="flex justify-end items-center gap-1.5">
          <Link className="b-ic" href="/koleksi" aria-label="Cari kek"><IkonCari /></Link>
          <Link className="b-nav text-[15px] font-medium px-2 no-underline" href="/semak">Semak tempahan</Link>
          <PautanSenaraiDesktop />
        </div>
      </div>
    </header>
  );
}
