import Link from 'next/link';
import type { NilaiKandungan } from '@/lib/kandungan/jenis';
import { Logo } from './Logo';
import { TeksTbc } from './TeksTbc';

type Kat = { name: string; slug: string };

export function Footer({ hubungi, footer, kategori }: { hubungi: NilaiKandungan['hubungi']; footer: NilaiKandungan['footer']; kategori: Kat[] }) {
  const hubung = (
    <>
      <p><a href={`https://wa.me/${hubungi.whatsapp}`} className="!text-yk-muted">WhatsApp {hubungi.whatsappPapar}</a></p>
      <p><a href={`https://instagram.com/${hubungi.instagram}`} className="!text-yk-muted">Instagram @{hubungi.instagram}</a></p>
      <p><a href={`https://www.tiktok.com/@${hubungi.tiktok}`} className="!text-yk-muted">TikTok @{hubungi.tiktok}</a></p>
    </>
  );
  return (
    <footer className="border-t border-yk-line bg-[#3F1017] text-yk-muted">
      <div className="max-w-[1360px] mx-auto px-5 pt-7 pb-8 lg:px-10 lg:pt-14 lg:pb-6 grid gap-8 lg:grid-cols-4 text-[14.5px] lg:text-[15px]">
        <div>
          <div className="lg:hidden"><Logo tinggi={92} /></div>
          <div className="hidden lg:block"><Logo tinggi={110} /></div>
          <p className="mt-3.5"><TeksTbc teks={hubungi.alamat} />, Kuantan, Pahang</p>
          <p><TeksTbc teks={hubungi.waktu} /></p>
          <p>Penghantaran: {hubungi.kawasan}</p>
          <p className="mt-2.5 max-w-[300px] hidden lg:block">{footer.ayat}</p>
          <div className="mt-2.5 lg:hidden">{hubung}</div>
        </div>
        <div className="hidden lg:block">
          <p className="text-yk-cream font-semibold">Kek</p>
          <ul className="mt-2">
            {kategori.map((k) => (
              <li key={k.slug}><Link className="!text-yk-muted no-underline hover:!text-yk-accent" href={`/koleksi?kategori=${k.slug}`}>{k.name}</Link></li>
            ))}
          </ul>
        </div>
        <div className="hidden lg:block">
          <p className="text-yk-cream font-semibold">Bantuan</p>
          <ul className="mt-2">
            <li><Link className="!text-yk-muted no-underline hover:!text-yk-accent" href="/#cara">Cara tempah</Link></li>
            <li><Link className="!text-yk-muted no-underline hover:!text-yk-accent" href="/semak">Semak tempahan</Link></li>
            <li><Link className="!text-yk-muted no-underline hover:!text-yk-accent" href="/#soalan">Soalan lazim</Link></li>
          </ul>
        </div>
        <div className="hidden lg:block">
          <p className="text-yk-cream font-semibold">Hubungi</p>
          <div className="mt-2">{hubung}</div>
        </div>
      </div>
      <div className="max-w-[1360px] mx-auto px-5 lg:px-10 pt-4 pb-28 lg:pb-7 border-t border-[#64262E] flex justify-between flex-wrap gap-3 text-[13.5px] text-[#C0948F]">
        <span>© {new Date().getFullYear()} Yummy Kuantan</span>
      </div>
    </footer>
  );
}
