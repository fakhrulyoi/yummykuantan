import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { GaleriKek } from '@/components/kedai/GaleriKek';
import { PilihSaiz } from '@/components/kedai/PilihSaiz';
import { TeksTbc } from '@/components/kedai/TeksTbc';
import { sudahDiisi } from '@/lib/kandungan/kurungan';
import { bakiTarikh } from '@/lib/data/kapasiti';
import { bacaTetapan } from '@/lib/data/tetapan';
import { hariIniMYT, tambahHari } from '@/lib/tempahan/tarikh';
import { produkAktif, produkIkutSlug, type ProdukPapar } from '@/lib/data/produk';
import { formatRM } from '@/lib/tempahan/wang';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ slug: string }>; searchParams?: Promise<{ saiz?: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const p = await produkIkutSlug((await params).slug);
  if (!p) return { title: 'Kek tidak dijumpai' };
  return {
    title: p.name,
    description: `${p.description} Dari ${formatRM(p.hargaDari)}. Tempah di WhatsApp, Kuantan dan Pekan.`,
    openGraph: p.images[0] ? { images: [p.images[0].url] } : undefined,
  };
}

function berkaitan(p: ProdukPapar, semua: ProdukPapar[]): ProdukPapar[] {
  const lain = semua.filter((x) => x.id !== p.id);
  const sama = lain.filter((x) => x.categorySlug === p.categorySlug);
  const popular = lain.filter((x) => x.categorySlug !== p.categorySlug).sort((a, b) => b.popularity - a.popularity);
  return [...sama, ...popular].slice(0, 4);
}

export default async function HalamanKek({ params, searchParams }: Params) {
  const [{ slug }, sp] = await Promise.all([params, searchParams ?? Promise.resolve({} as { saiz?: string })]);
  const [p, semua, tetapan] = await Promise.all([produkIkutSlug(slug), produkAktif(), bacaTetapan()]);
  if (!p) notFound();
  // 14 hari bermula dari tarikh paling awal untuk kek ini, dengan baki kapasiti.
  const now = new Date();
  const awal = tambahHari(hariIniMYT(now), Math.max(tetapan.minLeadDays, p.leadDays));
  const { hari } = await bakiTarikh(Array.from({ length: 14 }, (_, i) => tambahHari(awal, i)), now);
  const jalur = hari.map((h) => ({ tarikh: h.tarikh, status: h.tutup ? ('tutup' as const) : h.jumlahSlot <= 0 ? ('penuh' as const) : ('ada' as const), baki: h.jumlahSlot }));
  const lain = berkaitan(p, semua);
  const saizHarga = p.sizes.map((z) => `${z.label} ${formatRM(z.priceSen)}`).join(', ');

  return (
    <div className="pb-28 lg:pb-24 lg:max-w-[1360px] lg:mx-auto lg:px-10 lg:pt-8">
      <nav aria-label="Laluan" className="hidden lg:block text-[15px] text-yk-muted">
        <Link href="/" className="text-yk-muted">Utama</Link>
        <span aria-hidden="true" className="mx-2.5">/</span>
        <Link href={`/koleksi?kategori=${p.categorySlug}`} className="text-yk-muted">{p.category}</Link>
        <span aria-hidden="true" className="mx-2.5">/</span>
        <span>{p.name}</span>
      </nav>

      <div className="lg:flex lg:flex-wrap lg:gap-14 lg:mt-6 lg:items-start">
        <GaleriKek nama={p.name} gambar={p.images} />

        <section aria-labelledby="nama-kek" className="px-5 pt-1 lg:p-0 lg:flex-[1_1_400px] lg:max-w-[520px]">
          <p className="text-yk-accent text-[15px] lg:text-[15px] font-semibold">{p.category}</p>
          <h1 id="nama-kek" className="text-[42px] lg:text-[64px] leading-none mt-1 lg:mt-2">{p.name}</h1>
          <PilihSaiz
            productId={p.id}
            sizes={p.sizes}
            allowMessage={p.allowMessage}
            leadDays={p.leadDays}
            hari={jalur}
            saizAwal={typeof sp.saiz === 'string' ? sp.saiz : undefined}
            penerangan={<p className="mt-2.5 lg:mt-[18px] text-yk-cream-2 lg:text-[16.5px]">{p.description}</p>}
          />

          {p.allowDesign && (
            <p className="text-[15px] mt-4">
              Nak warna atau hiasan lain? <Link href="/reka" className="font-semibold">Tempahan rekaan khas</Link>
            </p>
          )}

          <div className="mt-[18px] lg:mt-[22px] px-3.5 py-3 lg:px-4 lg:py-3.5 border border-yk-line bg-yk-panel text-[15px] lg:text-[15px] text-yk-cream-2">
            Rekaan dan warna mungkin tidak 100% sama dengan gambar, kerana setiap kek dibuat dengan tangan.
          </div>

          <div className="mt-[18px] lg:mt-[26px]">
            <details open>
              <summary>Butiran</summary>
              <p className="pb-4 text-yk-cream-2 text-[15.5px] lg:text-[15px]">
                {saizHarga}.<TeksTbc teks={p.allergens} sebelum=" Alergen: " />
              </p>
            </details>
            {sudahDiisi(p.storage) && (
              <details>
                <summary>Penyimpanan</summary>
                <p className="pb-4 text-yk-cream-2 text-[15.5px] lg:text-[15px]">{p.storage}</p>
              </details>
            )}
            <details>
              <summary>Ambil dan penghantaran</summary>
              <p className="pb-4 text-yk-cream-2 text-[15.5px] lg:text-[15px]">
                Ambil sendiri tanpa caj, atau penghantaran ke{' '}
                {tetapan.deliveryAreas.map((k) => (tetapan.deliveryFees[k] != null ? `${k} (${formatRM(tetapan.deliveryFees[k])})` : k)).join(' dan ')}.
                {tetapan.deliveryAreas.some((k) => tetapan.deliveryFees[k] == null) ? ' Caj penghantaran dimaklumkan di WhatsApp.' : ''} Cara bayar disahkan di WhatsApp.
              </p>
            </details>
          </div>
        </section>
      </div>

      {lain.length > 0 && (
        <section aria-labelledby="h-lain" className="pt-8 lg:pt-0 lg:mt-24">
          <h2 id="h-lain" className="text-[26px] lg:text-[40px] px-5 lg:px-0">Mungkin anda juga suka</h2>
          <div className="flex gap-3 overflow-x-auto px-5 pt-3.5 pb-1 lg:grid lg:grid-cols-[repeat(auto-fill,minmax(240px,1fr))] lg:gap-5 lg:p-0 lg:mt-6 lg:overflow-visible">
            {lain.map((x) => (
              <Link key={x.id} href={`/kek/${x.slug}`} className="b-card flex-none w-40 lg:w-auto no-underline block">
                <div className="relative h-[200px] lg:h-auto lg:aspect-[4/5] overflow-hidden bg-[#561920]">
                  {x.images[0] && <Image src={x.images[0].url} alt="" fill sizes="(min-width: 1024px) 320px, 160px" className="object-cover" />}
                </div>
                <p className="text-[15.5px] lg:font-serif lg:text-[22px] mt-1.5 lg:mt-3 leading-tight">{x.name}</p>
                <p className="text-[14.5px] lg:text-[15.5px] text-yk-muted">dari {formatRM(x.hargaDari)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
