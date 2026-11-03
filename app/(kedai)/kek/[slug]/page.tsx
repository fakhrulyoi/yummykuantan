import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { GaleriKek } from '@/components/kedai/GaleriKek';
import { PilihSaiz } from '@/components/kedai/PilihSaiz';
import { TeksTbc } from '@/components/kedai/TeksTbc';
import { bacaKandungan } from '@/lib/data/kandungan';
import { produkAktif, produkIkutSlug, type ProdukPapar } from '@/lib/data/produk';
import { formatRM } from '@/lib/tempahan/wang';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ slug: string }> };

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

export default async function HalamanKek({ params }: Params) {
  const { slug } = await params;
  const [p, semua, hubungi] = await Promise.all([produkIkutSlug(slug), produkAktif(), bacaKandungan('hubungi')]);
  if (!p) notFound();
  const lain = berkaitan(p, semua);
  const saizHarga = p.sizes.map((z) => `${z.label} ${formatRM(z.priceSen)}`).join(', ');

  return (
    <div className="pb-28 lg:pb-24 lg:max-w-[1360px] lg:mx-auto lg:px-10 lg:pt-8">
      <nav aria-label="Laluan" className="hidden lg:block text-sm text-yk-muted">
        <Link href="/" className="text-yk-muted">Utama</Link>
        <span aria-hidden="true" className="mx-2.5">/</span>
        <Link href={`/koleksi?kategori=${p.categorySlug}`} className="text-yk-muted">{p.category}</Link>
        <span aria-hidden="true" className="mx-2.5">/</span>
        <span>{p.name}</span>
      </nav>

      <div className="lg:flex lg:flex-wrap lg:gap-14 lg:mt-6 lg:items-start">
        <GaleriKek nama={p.name} gambar={p.images} />

        <section aria-labelledby="nama-kek" className="px-5 pt-1 lg:p-0 lg:flex-[1_1_400px] lg:max-w-[520px]">
          <p className="text-yk-accent text-[13.5px] lg:text-sm font-semibold">{p.category}</p>
          <h1 id="nama-kek" className="text-[42px] lg:text-[64px] leading-none mt-1 lg:mt-2">{p.name}</h1>
          <PilihSaiz
            productId={p.id}
            sizes={p.sizes}
            allowMessage={p.allowMessage}
            leadDays={p.leadDays}
            penerangan={<p className="mt-2.5 lg:mt-[18px] text-yk-cream-2 lg:text-[16.5px]">{p.description}</p>}
          />

          {p.allowDesign && (
            <p className="text-sm mt-4">
              Nak warna atau hiasan lain? <Link href="/reka" className="font-semibold">Reka versi anda dalam 3D</Link>
            </p>
          )}

          <div className="mt-[18px] lg:mt-[22px] px-3.5 py-3 lg:px-4 lg:py-3.5 border border-yk-line bg-yk-panel text-[13.5px] lg:text-sm text-yk-cream-2">
            Rekaan dan warna mungkin tidak 100% sama dengan gambar, kerana setiap kek dibuat dengan tangan.
          </div>

          <div className="mt-[18px] lg:mt-[26px]">
            <details open>
              <summary>Butiran</summary>
              <p className="pb-4 text-yk-cream-2 text-[14.5px] lg:text-[15px]">
                {saizHarga}. <TeksTbc teks={p.allergens ?? '[Kandungan alergen disahkan oleh pemilik.]'} />
              </p>
            </details>
            <details>
              <summary>Penyimpanan</summary>
              <p className="pb-4 text-yk-cream-2 text-[14.5px] lg:text-[15px]">
                <TeksTbc teks={p.storage ?? '[Cara simpan dan tempoh terbaik disahkan oleh pemilik.]'} />
              </p>
            </details>
            <details>
              <summary>Ambil dan penghantaran</summary>
              <p className="pb-4 text-yk-cream-2 text-[14.5px] lg:text-[15px]">
                Ambil di dapur kami di Kuantan, atau penghantaran sekitar {hubungi.kawasan}. Caj penghantaran dan cara bayar dimaklumkan di WhatsApp.
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
                <p className="text-[14.5px] lg:font-serif lg:text-[22px] mt-1.5 lg:mt-3 leading-tight">{x.name}</p>
                <p className="text-[13px] lg:text-[14.5px] text-yk-muted">dari {formatRM(x.hargaDari)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
