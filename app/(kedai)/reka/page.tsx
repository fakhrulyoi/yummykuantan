import type { Metadata } from 'next';
import Link from 'next/link';
import { IkonWhatsApp } from '@/components/kedai/Ikon';
import { bacaKandungan } from '@/lib/data/kandungan';
import { waUrl } from '@/lib/tempahan/mesej';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Reka kek', description: 'Studio 3D untuk reka kek sendiri akan datang. Tempahan khas melalui WhatsApp.' };

export default async function HalamanReka() {
  const hubungi = await bacaKandungan('hubungi');
  const wa = waUrl(hubungi.whatsapp, 'Salam Yummy Kuantan, saya nak tempah kek rekaan khas. Saya ada gambar contoh dan tarikh majlis.');
  return (
    <section className="b-light bg-yk-cream text-yk-bg">
      <div className="px-5 py-9 lg:max-w-[1360px] lg:mx-auto lg:px-10 lg:py-24 lg:grid lg:grid-cols-[1fr_520px] lg:gap-16 lg:items-center">
        <div>
          <p className="text-[12px] tracking-[.24em] uppercase text-[#86464E]">Reka kek</p>
          <h1 className="text-[40px] lg:text-[64px] leading-none mt-2 text-yk-bg">Studio 3D akan datang</h1>
          <p className="mt-4 text-[#7C3C44] lg:text-[17px] max-w-[520px]">
            Tidak lama lagi anda boleh pilih bentuk, tingkat, rasa, warna krim dan hiasan, kemudian pusing kek dalam 3D sebelum hantar kepada kami.
            Buat masa ini, hantar gambar contoh dan tarikh majlis di WhatsApp. Kami bantu rekakan.
          </p>
          <div className="flex flex-wrap gap-2.5 mt-6">
            <a className="b-btn b-dark" href={wa} target="_blank" rel="noopener noreferrer">
              <IkonWhatsApp /> <span>WhatsApp untuk tempahan khas</span>
            </a>
            <Link className="b-btn b-line !border-yk-bg !text-yk-bg" href="/koleksi">Lihat koleksi</Link>
          </div>
        </div>
        <div className="relative mt-8 lg:mt-0 aspect-square bg-yk-bg-deep overflow-hidden">
          <div
            role="img"
            aria-label="Pratonton kek dua tingkat"
            className="absolute inset-0 bg-no-repeat"
            style={{ backgroundImage: 'url(/reka/pusing-blush.webp)', backgroundSize: '800% auto', backgroundPosition: '0% 30%' }}
          />
        </div>
      </div>
    </section>
  );
}
