import { BarWhatsApp } from '@/components/kedai/BarWhatsApp';
import { Footer } from '@/components/kedai/Footer';
import { Header } from '@/components/kedai/Header';
import { bacaKandungan, senaraiKategori } from '@/lib/data/kandungan';
import { waUrl } from '@/lib/tempahan/mesej';
import '../kedai.css';

export default async function LayoutKedai({ children }: { children: React.ReactNode }) {
  const [hubungi, footer, kategori] = await Promise.all([bacaKandungan('hubungi'), bacaKandungan('footer'), senaraiKategori()]);
  return (
    <div className="b min-h-screen text-[15.5px] leading-[1.55]">
      <a href="#isi" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-3 focus:bg-yk-cream focus:text-yk-bg">
        Langkau ke kandungan
      </a>
      <Header whatsapp={hubungi.whatsapp} />
      <main id="isi">{children}</main>
      <Footer hubungi={hubungi} footer={footer} kategori={kategori} />
      <BarWhatsApp waHref={waUrl(hubungi.whatsapp, 'Salam Yummy Kuantan, saya ada soalan tentang tempahan kek.')} />
    </div>
  );
}
