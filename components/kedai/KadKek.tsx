'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { ProdukPapar } from '@/lib/data/produk';
import { useSenarai } from '@/lib/senarai/useSenarai';
import { formatRM } from '@/lib/tempahan/wang';

export type BentukKad = 'biasa' | 'besar' | 'lebar';

/** Kad kek dalam koleksi. Phone: jubin bergambar penuh. Desktop: jubin dengan butang yang muncul ketika hover atau fokus. */
export function KadKek({ p, bentuk, kelewatan }: { p: ProdukPapar; bentuk: { phone: 'biasa' | 'lebar'; desktop: BentukKad }; kelewatan: number }) {
  const { senarai, tambah } = useSenarai();
  const satuSaiz = p.sizes.length === 1 ? p.sizes[0] : null;
  const dalam = satuSaiz && senarai.items.some((i) => i.productId === p.id && i.sizeId === satuSaiz.id && !i.cakeMessage);
  const href = `/kek/${p.slug}`;
  const gambar = p.images[0];
  const kls = [
    'yk-tile yk-in',
    bentuk.phone === 'lebar' ? 'col-span-2 aspect-[4/3]' : 'aspect-[3/4]',
    bentuk.desktop === 'besar' ? 'lg:col-span-2 lg:row-span-2 lg:aspect-auto' : bentuk.desktop === 'lebar' ? 'lg:col-span-2 lg:row-span-1 lg:aspect-[2/1.25]' : 'lg:col-span-1 lg:row-span-1 lg:aspect-[4/5]',
  ].join(' ');
  const saizTeks = p.sizes.map((z) => z.label).join(', ');
  return (
    <article className={kls} style={{ animationDelay: `${kelewatan.toFixed(2)}s` }}>
      <Link href={href} tabIndex={-1} aria-hidden="true" className="absolute inset-0">
        {gambar && (
          <Image src={gambar.url} alt="" fill sizes={bentuk.desktop === 'besar' ? '(min-width: 1024px) 640px, 100vw' : '(min-width: 1024px) 320px, 50vw'} />
        )}
      </Link>
      <span aria-hidden="true" className="absolute inset-0 pointer-events-none bg-[linear-gradient(180deg,rgba(42,9,14,0)_42%,rgba(42,9,14,.9)_100%)]" />
      <div className="absolute left-3 right-3 bottom-2.5 lg:left-[18px] lg:right-[18px] lg:bottom-4 pointer-events-none">
        <p className="hidden lg:block text-yk-accent text-[12.5px] font-semibold">{p.category}</p>
        <h2
          className={
            bentuk.phone === 'lebar'
              ? 'text-[28px] leading-[1.08] ' + (bentuk.desktop === 'besar' ? 'lg:text-[40px] lg:leading-[1.05]' : 'lg:text-2xl lg:leading-[1.05]')
              : 'text-lg leading-[1.08] ' + (bentuk.desktop === 'besar' ? 'lg:text-[40px] lg:leading-[1.05]' : 'lg:text-2xl lg:leading-[1.05]')
          }
        >
          <Link href={href} className="no-underline pointer-events-auto">{p.name}</Link>
        </h2>
        <div className="flex justify-between items-center gap-2.5 mt-0.5 lg:mt-2 flex-wrap">
          <span className="text-[12.5px] lg:text-[14.5px] text-[#ECDDD3]">
            dari {formatRM(p.hargaDari)}
            <span className="hidden lg:inline text-yk-muted">, {saizTeks}</span>
          </span>
          <span className="yk-act hidden lg:flex gap-1.5 pointer-events-auto">
            <Link className="b-btn !min-h-10 !px-3.5 !text-[13.5px]" href={href}>
              {satuSaiz ? 'Tempah' : 'Pilih saiz'}
            </Link>
            {satuSaiz && (
              <button
                type="button"
                className="b-btn b-line !min-h-10 !px-3.5 !text-[13.5px] bg-[rgba(60,13,19,.55)]"
                aria-label={dalam ? `${p.name} dalam senarai` : `Tambah ${p.name} ke senarai`}
                onClick={() => !dalam && tambah({ productId: p.id, sizeId: satuSaiz.id, qty: 1 })}
              >
                {dalam ? 'Dalam senarai' : 'Tambah ke senarai'}
              </button>
            )}
          </span>
        </div>
      </div>
    </article>
  );
}
