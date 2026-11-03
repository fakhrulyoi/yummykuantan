'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { kemaskiniTempahan, tandaBayar, tukarStatus, type HasilAdmin } from '@/app/admin/(dilindungi)/tempahan/actions';
import { LABEL_STATUS } from '@/lib/data/labelStatus';
import { STATUS_TEMPAHAN, type OrderStatus } from '@/lib/tempahan/jenis';

type Props = {
  id: string;
  kind: 'QUICK' | 'LIST';
  status: OrderStatus;
  mode: string | null;
  date: string | null;
  timeSlotId: string | null;
  customerName: string | null;
  phone: string | null;
  address: string | null;
  deliveryFeeSen: number | null;
  paid: boolean;
  slot: { id: string; label: string }[];
};

function Mesej({ h }: { h: HasilAdmin | null }) {
  if (!h) return null;
  return h.ok ? (
    <p role="status" className="text-[13px] text-[#22562B] mt-1.5">{h.mesej}</p>
  ) : (
    <p role="alert" className="text-[13px] text-[#8E2620] mt-1.5">{h.ralat}</p>
  );
}

/** Borang di halaman butiran tempahan: status, butiran, caj hantar dan bayaran. */
export function ButiranTempahan(p: Props) {
  const router = useRouter();
  const [sibuk, mula] = useTransition();
  const [status, setStatus] = useState<OrderStatus>(p.status);
  const [hStatus, setHStatus] = useState<HasilAdmin | null>(null);
  const [hButiran, setHButiran] = useState<HasilAdmin | null>(null);
  const [hCaj, setHCaj] = useState<HasilAdmin | null>(null);
  const [hBayar, setHBayar] = useState<HasilAdmin | null>(null);
  const [b, setB] = useState({ date: p.date ?? '', timeSlotId: p.timeSlotId ?? '', customerName: p.customerName ?? '', phone: p.phone ?? '', address: p.address ?? '' });
  const [caj, setCaj] = useState(p.deliveryFeeSen === null ? '' : (p.deliveryFeeSen / 100).toFixed(2));

  const jalan = (f: () => Promise<HasilAdmin>, set: (h: HasilAdmin) => void) =>
    mula(async () => {
      try {
        const h = await f();
        set(h);
        if (h.ok) router.refresh();
      } catch {
        set({ ok: false, ralat: 'Tak dapat simpan. Muat semula halaman dan cuba lagi.' });
      }
    });

  const medan = (k: keyof typeof b, label: string, extra: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label className="ad-lbl" htmlFor={`m-${k}`}>{label}</label>
      <input id={`m-${k}`} className="ad-in" value={b[k]} onChange={(e) => setB({ ...b, [k]: e.target.value })} {...extra} />
    </div>
  );

  return (
    <div className="grid gap-4">
      <section aria-labelledby="h-st" className="border-t border-[#EFE7DD] pt-3.5">
        <h2 id="h-st" className="sr-only">Status</h2>
        <label className="ad-lbl" htmlFor="st">Tukar status</label>
        <div className="flex gap-2">
          <select id="st" className="ad-in" value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)}>
            {STATUS_TEMPAHAN.map((k) => <option key={k} value={k}>{LABEL_STATUS[k]}</option>)}
          </select>
          <button type="button" className="ad-btn" disabled={sibuk} onClick={() => jalan(() => tukarStatus(p.id, status), setHStatus)}>Kemas kini status</button>
        </div>
        <Mesej h={hStatus} />
      </section>

      <section aria-labelledby="h-but" className="border-t border-[#EFE7DD] pt-3.5">
        <h2 id="h-but" className="text-[15px] font-bold">Butiran pelanggan</h2>
        {p.kind === 'QUICK' && <p className="text-[12.5px] text-[#6B5B4E] mt-0.5">Lengkapkan tarikh, slot dan nama selepas berbincang di WhatsApp. Tempahan ini dikira dalam kapasiti selepas tarikh diisi.</p>}
        <form
          className="grid gap-3 mt-2.5 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            jalan(() => kemaskiniTempahan(p.id, b), setHButiran);
          }}
        >
          {medan('date', 'Tarikh', { type: 'date' })}
          <div>
            <label className="ad-lbl" htmlFor="m-slot">Slot masa</label>
            <select id="m-slot" className="ad-in" value={b.timeSlotId} onChange={(e) => setB({ ...b, timeSlotId: e.target.value })}>
              <option value="">Belum dipilih</option>
              {p.slot.map((z) => <option key={z.id} value={z.id}>{z.label}</option>)}
            </select>
          </div>
          {medan('customerName', 'Nama pelanggan', { autoComplete: 'off', maxLength: 60 })}
          {medan('phone', 'Telefon', { type: 'tel', inputMode: 'tel', maxLength: 30 })}
          <div className="sm:col-span-2">{medan('address', 'Alamat penghantaran', { maxLength: 300 })}</div>
          <div className="sm:col-span-2">
            <button type="submit" className="ad-btn ad-btn2" disabled={sibuk}>Simpan butiran</button>
            <Mesej h={hButiran} />
          </div>
        </form>
      </section>

      <section aria-labelledby="h-caj" className="border-t border-[#EFE7DD] pt-3.5">
        <h2 id="h-caj" className="sr-only">Caj dan bayaran</h2>
        <form
          className="flex gap-2 items-end"
          onSubmit={(e) => {
            e.preventDefault();
            const n = caj.trim() === '' ? null : Math.round(Number(caj.replace(',', '.')) * 100);
            if (n !== null && (!Number.isFinite(n) || n < 0)) return setHCaj({ ok: false, ralat: 'Masukkan jumlah dalam RM, contoh 15.' });
            jalan(() => kemaskiniTempahan(p.id, { deliveryFeeSen: n }), setHCaj);
          }}
        >
          <div className="flex-1">
            <label className="ad-lbl" htmlFor="caj">Caj penghantaran (RM)</label>
            <input id="caj" className="ad-in" inputMode="decimal" placeholder={p.mode === 'DELIVERY' ? 'Contoh: 15' : 'Ambil sendiri: biarkan kosong'} value={caj} onChange={(e) => setCaj(e.target.value)} />
          </div>
          <button type="submit" className="ad-btn ad-btn2" disabled={sibuk}>Simpan caj</button>
        </form>
        <Mesej h={hCaj} />
        <button type="button" className="ad-btn ad-btn2 w-full mt-3" disabled={sibuk} onClick={() => jalan(() => tandaBayar(p.id, !p.paid), setHBayar)}>
          {p.paid ? 'Buang tanda bayar' : 'Tandakan sudah bayar'}
        </button>
        <Mesej h={hBayar} />
        <p className="text-[12.5px] text-[#6B5B4E] mt-1.5">Bayaran dicatat sendiri selepas diterima di WhatsApp.</p>
      </section>
    </div>
  );
}
