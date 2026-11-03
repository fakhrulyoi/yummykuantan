import type { Metadata } from 'next';
import { SemakStatus } from '@/components/kedai/SemakStatus';
import { bacaKandungan } from '@/lib/data/kandungan';
import { waUrl } from '@/lib/tempahan/mesej';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Semak tempahan', robots: { index: false } };

export default async function HalamanSemak({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const [{ ref }, hubungi] = await Promise.all([searchParams, bacaKandungan('hubungi')]);
  return (
    <div className="px-5 pt-6 pb-20 lg:max-w-[880px] lg:mx-auto lg:px-10 lg:pt-14 lg:pb-24">
      <h1 className="text-[40px] lg:text-[64px] leading-none">Semak tempahan</h1>
      <p className="mt-2.5 text-yk-cream-2 lg:text-[17px]">
        Masukkan rujukan tempahan (bermula YK-) dan 4 digit akhir nombor telefon yang anda berikan.
      </p>
      <SemakStatus refAwal={typeof ref === 'string' ? ref.slice(0, 12) : ''} />
      <p className="mt-10 text-sm text-yk-muted">
        Tempah melalui meja kek atau halaman kek? Status boleh disemak selepas kami simpan nombor telefon anda.{' '}
        <a href={waUrl(hubungi.whatsapp, 'Salam Yummy Kuantan, saya nak tanya tentang tempahan saya.')} className="font-semibold text-yk-cream">Tanya di WhatsApp</a>
      </p>
    </div>
  );
}
