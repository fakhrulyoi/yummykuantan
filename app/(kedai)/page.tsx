import { MejaKek } from '@/components/kedai/meja/MejaKek';
import { kekMeja } from '@/lib/data/produk';

export const dynamic = 'force-dynamic';

export default async function LamanUtama() {
  const meja = await kekMeja();
  return (
    <>
      <section className="p-6"><h1 className="text-4xl">Kek yang diingat lama selepas majlis.</h1></section>
      <section className="mj-room py-9 lg:pt-16 lg:pb-14" aria-labelledby="mj-h">
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
    </>
  );
}
