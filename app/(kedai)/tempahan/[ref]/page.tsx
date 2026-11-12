import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { IkonWhatsApp } from '@/components/kedai/Ikon';
import { SalinMesej } from '@/components/kedai/SalinMesej';
import { cariTempahanUntukPelanggan } from '@/lib/data/tempahan';
import { bacaTetapan } from '@/lib/data/tetapan';
import { waUrl } from '@/lib/tempahan/mesej';
import { tarikhPenuh } from '@/lib/tempahan/tarikh';
import { formatRM } from '@/lib/tempahan/wang';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Tempahan anda', robots: { index: false, follow: false } };

type Props = { params: Promise<{ ref: string }>; searchParams: Promise<{ t?: string }> };

export default async function HalamanSelepasTempah({ params, searchParams }: Props) {
  const [{ ref }, { t }] = await Promise.all([params, searchParams]);
  const o = typeof t === 'string' ? await cariTempahanUntukPelanggan(ref, t) : null;
  if (!o) notFound();
  const tetapan = await bacaTetapan();
  const pautan = waUrl(tetapan.whatsappNumber, o.waMessage);
  const bila =
    o.kind === 'QUICK' || !o.date
      ? 'Tarikh dan cara terima: nyatakan di WhatsApp'
      : `${o.mode === 'DELIVERY' ? `Hantar ke ${o.area}` : 'Ambil sendiri'}, ${tarikhPenuh(o.date)}${o.slotLabel ? `, ${o.slotLabel}` : ''}`;

  return (
    <div className="px-5 pt-6 pb-16 lg:max-w-[1040px] lg:mx-auto lg:px-10 lg:pt-14 lg:pb-24 lg:grid lg:grid-cols-[1fr_400px] lg:gap-14 lg:items-start">
      <section aria-labelledby="h-selesai">
        <p className="text-yk-muted text-[15px]">Tempahan {o.ref}</p>
        <h1 id="h-selesai" className="text-[36px] lg:text-[56px] leading-[1.04] mt-1">Tekan hantar di WhatsApp untuk lengkapkan tempahan.</h1>
        <p className="mt-3 text-yk-cream-2 lg:text-[17px]">
          WhatsApp sudah dibuka dengan mesej siap ditulis. Tempahan hanya diterima selepas mesej itu dihantar. Kami akan sahkan slot, caj penghantaran dan cara bayar.
        </p>
        <div className="grid gap-2 mt-6 lg:max-w-[420px]">
          <a className="b-btn" href={pautan} target="_blank" rel="noopener noreferrer">
            <IkonWhatsApp /> <span>Buka WhatsApp semula</span>
          </a>
          <SalinMesej mesej={o.waMessage} />
        </div>
        <p className="text-[15px] text-yk-muted mt-4">
          Simpan rujukan <strong className="text-yk-cream">{o.ref}</strong>.{' '}
          <Link href={`/semak?ref=${o.ref}`} className="font-semibold text-yk-cream">Semak status tempahan</Link> dengan rujukan dan 4 digit akhir telefon anda.
        </p>
      </section>

      <section aria-label="Ringkasan tempahan" className="mt-8 lg:mt-0 border border-yk-line bg-yk-panel">
        <ul className="list-none m-0 p-0">
          {o.items.map((i) => (
            <li key={i.id} className="p-3.5 border-b border-yk-line">
              <p className="font-serif text-[19px] leading-tight">{i.productName}</p>
              <p className="text-[14.5px] text-yk-muted">
                {i.sizeLabel}{i.qty > 1 ? `, ${i.qty} biji` : ''}{i.cakeMessage ? `, tulisan: ${i.cakeMessage}` : ''}
              </p>
              <p className="text-[15px] mt-0.5">{formatRM(i.unitPriceSen * i.qty)}</p>
            </li>
          ))}
          {o.addons.map((a) => (
            <li key={a.id} className="px-3.5 py-2.5 border-b border-yk-line flex justify-between text-[15px]">
              <span>{a.name} x{a.qty}{a.text ? `: ${a.text}` : ''}</span>
              <span>{formatRM(a.unitPriceSen * a.qty)}</span>
            </li>
          ))}
        </ul>
        <dl className="grid gap-1.5 m-0 p-3.5 text-[15px]">
          {o.deliveryFeeSen != null && (
            <div className="flex justify-between gap-4"><dt className="text-yk-muted">Caj hantar</dt><dd className="m-0">{formatRM(o.deliveryFeeSen)}</dd></div>
          )}
          <div className="flex justify-between gap-4"><dt className="text-yk-muted">Jumlah, dibayar di WhatsApp</dt><dd className="m-0 font-bold">{formatRM(o.totalSen + (o.deliveryFeeSen ?? 0))}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-yk-muted">Bila</dt><dd className="m-0 text-right">{bila}</dd></div>
        </dl>
        <details className="border-t border-yk-line px-3.5">
          <summary className="text-[15px]">Lihat mesej</summary>
          <pre className="m-0 pb-3.5 whitespace-pre-wrap font-sans text-[14.5px] text-[#ECDDD3]">{o.waMessage}</pre>
        </details>
      </section>
    </div>
  );
}
