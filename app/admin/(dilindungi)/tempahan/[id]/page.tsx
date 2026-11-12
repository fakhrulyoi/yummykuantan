import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ButiranTempahan } from '@/components/admin/ButiranTempahan';
import { LencanaStatus } from '@/components/admin/JadualTempahan';
import { LangkahStatus } from '@/components/admin/LangkahStatus';
import { requireAdmin } from '@/lib/auth/admin';
import { binaPautanBalas, butiranTempahan, LABEL_STATUS } from '@/lib/data/adminTempahan';
import { senaraiSlot } from '@/lib/data/tetapan';
import type { OrderStatus } from '@/lib/tempahan/jenis';
import { tarikhPenuh } from '@/lib/tempahan/tarikh';
import { formatRM } from '@/lib/tempahan/wang';

export const metadata = { title: 'Butiran tempahan' };

const MEDAN: Record<string, string> = {
  status: 'Status', date: 'Tarikh', timeSlotId: 'Slot', customerName: 'Nama', phone: 'Telefon', address: 'Alamat', deliveryFeeSen: 'Caj hantar', paidAt: 'Bayaran',
};

function nilai(k: string, v: unknown): string {
  if (v === null || v === undefined || v === '') return 'kosong';
  if (k === 'status') return LABEL_STATUS[v as OrderStatus] ?? String(v);
  if (k === 'deliveryFeeSen') return formatRM(Number(v));
  if (k === 'paidAt') return 'dibayar';
  if (k === 'timeSlotId') return 'ditukar';
  return String(v);
}

export default async function HalamanButiran({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [o, slot] = await Promise.all([butiranTempahan(id), senaraiSlot()]);
  if (!o) notFound();
  const balas = await binaPautanBalas(o);
  const jumlah = o.totalSen + (o.deliveryFeeSen ?? 0);
  const masa = new Intl.DateTimeFormat('ms-MY', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kuala_Lumpur' });

  return (
    <>
      <Link href="/admin/tempahan" className="text-[13.5px] font-semibold">&larr; Semua tempahan</Link>
      <div className="flex flex-wrap gap-4 items-start">
        <section className="ad-card flex-[999_1_520px] min-w-0 p-5 grid gap-4" aria-labelledby="h-ref">
          <div className="flex justify-between items-start gap-3">
            <div>
              <p className="text-[13px] text-[#6B5B4E]">{o.kind === 'QUICK' ? 'Tempahan cepat' : 'Senarai tempahan'} · {masa.format(o.createdAt)}</p>
              <h1 id="h-ref" className="font-serif font-normal text-[30px]">{o.ref}</h1>
            </div>
            <span data-testid="status-lencana"><LencanaStatus status={o.status} /></span>
          </div>
          <p className="sr-only" data-testid="status">{LABEL_STATUS[o.status]}</p>

          <div className="grid grid-cols-2 gap-3 text-[13.5px]">
            <div>
              <p className="text-[#6B5B4E]">Pelanggan</p>
              <p className="font-semibold">{o.customerName ?? 'Belum diisi'}</p>
              <p>{o.phone ? `+${o.phone}` : 'Tiada telefon'}</p>
            </div>
            <div>
              <p className="text-[#6B5B4E]">Tarikh dan masa</p>
              <p className="font-semibold">{o.date ? tarikhPenuh(o.date) : 'Belum diisi'}</p>
              <p>{o.slotLabel ?? ''}</p>
            </div>
            <div>
              <p className="text-[#6B5B4E]">Cara terima</p>
              <p className="font-semibold">{o.mode === 'DELIVERY' ? `Hantar ke ${o.area ?? ''}` : o.mode === 'PICKUP' ? 'Ambil sendiri' : 'Belum diisi'}</p>
              <p>{o.address ?? ''}</p>
            </div>
            <div>
              <p className="text-[#6B5B4E]">Bayaran</p>
              <p className="font-semibold"><span data-testid="jumlah">{formatRM(jumlah)}</span>, {o.paidAt ? 'Dibayar' : 'Belum dibayar'}</p>
              <p>{o.deliveryFeeSen !== null ? `Termasuk caj hantar ${formatRM(o.deliveryFeeSen)}` : o.mode === 'DELIVERY' ? 'Caj hantar belum diisi' : ''}</p>
            </div>
          </div>

          <div className="border-t border-[#EFE7DD] pt-3.5">
            <p className="ad-lbl">Kek</p>
            <ul className="list-none p-0 m-0 grid gap-2.5">
              {o.items.map((i) => (
                <li key={i.id} className="flex gap-3 items-center">
                  <div className="relative w-16 h-[72px] rounded-lg overflow-hidden bg-[#ECE5DB] flex-none">
                    {i.gambar && <Image src={i.gambar} alt="" fill sizes="64px" className="object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{i.productName}</p>
                    <p className="text-[13px] text-[#6B5B4E]">{i.sizeLabel} x{i.qty}{i.cakeMessage ? `, tulisan: ${i.cakeMessage}` : ''}</p>
                  </div>
                  <span className="font-semibold">{formatRM(i.unitPriceSen * i.qty)}</span>
                </li>
              ))}
            </ul>
            {o.addons.length > 0 && (
              <ul className="list-none p-0 m-0 mt-3 grid gap-1 text-[13.5px]">
                {o.addons.map((a) => (
                  <li key={a.id} className="flex justify-between">
                    <span>{a.name} x{a.qty}{a.text ? `: ${a.text}` : ''}</span>
                    <span>{formatRM(a.unitPriceSen * a.qty)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {o.notes && (
            <div>
              <p className="ad-lbl">Nota pelanggan</p>
              <p className="text-[13.5px] bg-[#FBF8F4] rounded-lg px-3 py-2.5">{o.notes}</p>
            </div>
          )}
          <details className="text-[13.5px]">
            <summary className="cursor-pointer font-semibold">Mesej WhatsApp asal</summary>
            <pre className="whitespace-pre-wrap font-sans bg-[#FBF8F4] rounded-lg px-3 py-2.5 mt-2">{o.waMessage}</pre>
          </details>
        </section>

        <aside className="ad-card flex-[1_1_360px] lg:max-w-[460px] p-5 grid gap-3 order-first lg:order-none" aria-label="Tindakan">
          <LangkahStatus id={o.id} status={o.status} mode={o.mode} besar />
          {balas ? (
            <a className="ad-btn" href={balas} target="_blank" rel="noopener noreferrer">Balas di WhatsApp</a>
          ) : (
            <p className="text-[13px] text-[#6B5B4E]">Isi nombor telefon pelanggan untuk balas di WhatsApp.</p>
          )}
          <ButiranTempahan
            id={o.id} kind={o.kind} status={o.status} mode={o.mode} date={o.date} timeSlotId={o.timeSlotId}
            customerName={o.customerName} phone={o.phone} address={o.address} deliveryFeeSen={o.deliveryFeeSen} paid={!!o.paidAt}
            slot={slot.filter((z) => z.active || z.id === o.timeSlotId).map((z) => ({ id: z.id, label: z.label }))}
          />
        </aside>
      </div>

      <section className="ad-card p-5" aria-label="Sejarah perubahan">
        <h2 className="text-[15px] font-bold">Sejarah perubahan</h2>
        {o.sejarah.length === 0 ? (
          <p className="text-[13.5px] text-[#6B5B4E] mt-1.5">Belum ada perubahan.</p>
        ) : (
          <ul className="list-none p-0 m-0 mt-2 grid gap-1.5 text-[13.5px]">
            {o.sejarah.map((h) => (
              <li key={h.id}>
                <span className="text-[#6B5B4E]">{masa.format(h.createdAt)} · {h.nama}:</span>{' '}
                {Object.entries(h.diff as Record<string, [unknown, unknown]>)
                  .map(([k, [lama, baru]]) => `${MEDAN[k] ?? k} ${nilai(k, lama)} → ${nilai(k, baru)}`)
                  .join('; ')}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
