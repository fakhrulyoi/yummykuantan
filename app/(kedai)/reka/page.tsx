import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { IkonWhatsApp } from '@/components/kedai/Ikon';
import { bacaKandungan } from '@/lib/data/kandungan';
import { produkAktif } from '@/lib/data/produk';
import { waUrl } from '@/lib/tempahan/mesej';
import { formatRM } from '@/lib/tempahan/wang';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Tempahan rekaan khas',
  description: 'Kek dengan rekaan, warna dan hiasan anda sendiri. Hantar gambar contoh dan tarikh majlis di WhatsApp, kami bantu rekakan.',
};

const LANGKAH = [
  { t: 'Hantar gambar contoh', d: 'WhatsApp gambar kek yang anda suka, tarikh majlis dan bilangan tetamu.' },
  { t: 'Kami cadangkan rekaan', d: 'Kami balas dengan saiz, rasa, hiasan dan harga yang sesuai.' },
  { t: 'Sahkan dan siap', d: 'Setuju dengan rekaan, bayar di WhatsApp, kemudian ambil atau kami hantar.' },
];

export default async function HalamanReka() {
  const [hubungi, produk] = await Promise.all([bacaKandungan('hubungi'), produkAktif()]);
  const wa = waUrl(hubungi.whatsapp, 'Salam Yummy Kuantan, saya nak tempah kek rekaan khas.\nTarikh majlis: \nBilangan tetamu: \nSaya lampirkan gambar contoh.');
  const contoh = produk.filter((p) => p.allowDesign && p.images[0]).sort((a, b) => b.popularity - a.popularity).slice(0, 6);

  return (
    <>
      <section className="b-light bg-yk-cream text-yk-bg">
        <div className="px-5 py-9 lg:max-w-[1360px] lg:mx-auto lg:px-10 lg:py-20 lg:grid lg:grid-cols-[1fr_440px] lg:gap-16 lg:items-center">
          <div>
            <p className="text-[14.5px] tracking-[.2em] uppercase text-[#7C3C44]">Rekaan khas</p>
            <h1 className="text-[40px] lg:text-[64px] leading-none mt-2 text-yk-bg">Tempahan rekaan khas</h1>
            <p className="mt-4 text-[#6A2E36] text-[17px] lg:text-[18px] max-w-[540px]">
              Ada gambar kek idaman, tema majlis atau warna tertentu? Hantar kepada kami di WhatsApp. Kami bantu rekakan kek yang sesuai dengan majlis dan bajet anda.
            </p>
            <div className="flex flex-wrap gap-2.5 mt-6">
              <a className="b-btn b-dark w-full sm:w-auto" href={wa} target="_blank" rel="noopener noreferrer">
                <IkonWhatsApp /> <span>WhatsApp gambar contoh</span>
              </a>
              <Link className="b-btn b-line !border-yk-bg !text-yk-bg w-full sm:w-auto" href="/koleksi">Lihat koleksi</Link>
            </div>
          </div>
          <ol className="list-none p-0 m-0 mt-9 lg:mt-0 grid gap-3">
            {LANGKAH.map((l, i) => (
              <li key={l.t} className="flex gap-4 items-start border-t border-[rgba(75,20,27,.18)] pt-4">
                <span className="font-serif text-[34px] leading-none text-[#7C3C44] w-8 flex-none">{i + 1}</span>
                <span>
                  <span className="block font-bold text-[17px]">{l.t}</span>
                  <span className="block text-[16px] text-[#6A2E36] mt-0.5">{l.d}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {contoh.length > 0 && (
        <section aria-labelledby="h-contoh" className="px-5 py-10 lg:max-w-[1360px] lg:mx-auto lg:px-10 lg:py-20">
          <h2 id="h-contoh" className="text-[30px] lg:text-[44px]">Contoh rekaan yang pernah kami buat</h2>
          <p className="text-yk-cream-2 text-[16px] mt-1.5">Boleh jadi titik mula. Tukar warna, tulisan atau hiasan ikut citarasa anda.</p>
          <ul className="list-none p-0 m-0 mt-6 grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-5">
            {contoh.map((p) => (
              <li key={p.id}>
                <Link href={`/kek/${p.slug}`} className="block no-underline">
                  <div className="relative aspect-[4/5] overflow-hidden bg-[#561920]">
                    <Image src={p.images[0].url} alt="" fill sizes="(min-width: 1024px) 400px, 50vw" className="object-cover" />
                  </div>
                  <p className="font-serif text-[19px] lg:text-[24px] leading-tight mt-2">{p.name}</p>
                  <p className="text-[15px] text-yk-cream-2">dari {formatRM(p.hargaDari)}</p>
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-[15px] text-yk-cream-2 mt-8">Studio reka 3D, untuk reka dan pusing kek sendiri, sedang dibina.</p>
        </section>
      )}
    </>
  );
}
