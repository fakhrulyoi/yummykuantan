import { CaraTempah } from '@/components/kedai/CaraTempah';
import { CtaWhatsApp } from '@/components/kedai/CtaWhatsApp';
import { Galeri } from '@/components/kedai/Galeri';
import { Hero } from '@/components/kedai/Hero';
import { JalurReka } from '@/components/kedai/JalurReka';
import { MejaKek } from '@/components/kedai/meja/MejaKek';
import { PilihJenis } from '@/components/kedai/PilihJenis';
import { SoalanLazim } from '@/components/kedai/SoalanLazim';
import { TarikhKosong, type HariPapar } from '@/components/kedai/TarikhKosong';
import { Ticker } from '@/components/kedai/Ticker';
import { Ulasan } from '@/components/kedai/Ulasan';
import { bakiTarikh } from '@/lib/data/kapasiti';
import { bacaKandungan, senaraiKategori } from '@/lib/data/kandungan';
import { kekMeja, produkAktif } from '@/lib/data/produk';
import { senaraiSoalanTerbit } from '@/lib/data/soalan';
import { bacaTetapan } from '@/lib/data/tetapan';
import { waUrl } from '@/lib/tempahan/mesej';
import { tambahHari, tarikhAwal, tarikhPendek } from '@/lib/tempahan/tarikh';

export const dynamic = 'force-dynamic';

export default async function LamanUtama() {
  const now = new Date();
  const [hero, hubungi, galeri, ulasan, meja, produk, kategori, soalan, tetapan] = await Promise.all([
    bacaKandungan('hero'),
    bacaKandungan('hubungi'),
    bacaKandungan('galeri'),
    bacaKandungan('ulasan'),
    kekMeja(),
    produkAktif(),
    senaraiKategori(),
    senaraiSoalanTerbit(),
    bacaTetapan(),
  ]);
  const mula = tarikhAwal(now, [], tetapan.minLeadDays);
  const { hari } = await bakiTarikh(Array.from({ length: 7 }, (_, i) => tambahHari(mula, i)), now);
  const hariPapar: HariPapar[] = hari.map((h) => {
    const p = tarikhPendek(h.tarikh);
    return {
      tarikh: h.tarikh, hari: p.hari, tarikhNo: p.tarikh, bulan: p.bulan,
      status: h.tutup ? 'tutup' : h.jumlahSlot <= 0 ? 'penuh' : 'ada', baki: h.jumlahSlot,
    };
  });
  const jenis = kategori
    .map((k) => {
      const ahli = produk.filter((p) => p.categorySlug === k.slug);
      return { slug: k.slug, name: k.name, blurb: k.description, img: k.imageUrl ?? ahli[0]?.images[0]?.url ?? null, count: ahli.length, dari: Math.min(...ahli.map((p) => p.hargaDari)) };
    })
    .filter((j) => j.count > 0);
  const wa = waUrl(hubungi.whatsapp, 'Salam Yummy Kuantan, saya ada soalan tentang tempahan kek.');

  return (
    <>
      <Hero hero={hero} />
      <Ticker nama={hero.ticker} />
      <TarikhKosong hari={hariPapar} />
      {meja.length > 0 && (
        <section className="mj-room pt-9 pb-8 lg:pt-16 lg:pb-14" aria-labelledby="mj-h">
          <header className="px-5 lg:px-10 lg:text-center relative z-[3]">
            <p className="text-[11px] lg:text-xs tracking-[.24em] lg:tracking-[.28em] uppercase text-yk-muted">
              Paling kerap ditempah &nbsp;·&nbsp; {meja.length} kek<span className="hidden lg:inline"> di atas meja</span>
            </p>
            <h2 id="mj-h" className="text-[34px] lg:text-[56px] leading-[1.04] lg:leading-[1.02] mt-2.5 lg:mt-3.5">Pilih kek terus dari meja kami.</h2>
          </header>
          <MejaKek
            items={meja.map((p) => ({
              id: p.id, name: p.name, category: p.category, description: p.description, tableImage: p.tableImage!,
              sizes: p.sizes, leadDays: p.leadDays, allowDesign: p.allowDesign, href: `/kek/${p.slug}`,
            }))}
          />
        </section>
      )}
      <PilihJenis jenis={jenis} />
      <JalurReka />
      <CaraTempah />
      <Ulasan ulasan={ulasan} />
      <SoalanLazim soalan={soalan} waHref={wa} />
      <Galeri gambar={galeri.gambar} instagram={hubungi.instagram} tiktok={hubungi.tiktok} />
      <CtaWhatsApp waHref={wa} papar={hubungi.whatsappPapar} kawasan={hubungi.kawasan} />
    </>
  );
}
