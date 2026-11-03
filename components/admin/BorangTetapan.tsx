'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import type { HasilTetapan } from '@/app/admin/(dilindungi)/tetapan/actions';

/** Jalankan tindakan tetapan dan papar mesej; kongsi oleh borang tetapan. */
export function useTindakan() {
  const router = useRouter();
  const [sibuk, mula] = useTransition();
  const [mesej, setMesej] = useState<{ ok: boolean; teks: string } | null>(null);
  const jalan = (f: () => Promise<HasilTetapan>, selepas?: () => void) =>
    mula(async () => {
      setMesej(null);
      const r = await f().catch(() => ({ ok: false as const, ralat: 'Tak dapat simpan. Cuba lagi.' }));
      if (!r.ok) return setMesej({ ok: false, teks: r.ralat });
      setMesej({ ok: true, teks: r.mesej ?? 'Disimpan.' });
      selepas?.();
      router.refresh();
    });
  const papar = mesej && (
    <p role={mesej.ok ? 'status' : 'alert'} className={`text-[13px] mt-1.5 ${mesej.ok ? 'text-[#22562B]' : 'text-[#8E2620]'}`}>{mesej.teks}</p>
  );
  return { sibuk, jalan, papar };
}

export function Kad({ id, tajuk, nota, children }: { id: string; tajuk: string; nota?: string; children: React.ReactNode }) {
  return (
    <section className="ad-card p-5" aria-labelledby={id}>
      <h2 id={id} className="text-base font-bold">{tajuk}</h2>
      {nota && <p className="text-[13px] text-[#6B5B4E] mt-0.5">{nota}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

type Umum = { minLeadDays: number; dailyCapacity: number; holdHours: number; whatsappNumber: string };

export function BorangUmum({ awal, bolehUbah, simpan }: { awal: Umum; bolehUbah: boolean; simpan: (v: Umum) => Promise<HasilTetapan> }) {
  const [v, setV] = useState(awal);
  const { sibuk, jalan, papar } = useTindakan();
  const nombor = (k: keyof Umum, label: string, min: number, max: number, nota: string) => (
    <div>
      <label className="ad-lbl" htmlFor={`u-${k}`}>{label}</label>
      <input id={`u-${k}`} className="ad-in" type="number" min={min} max={max} value={v[k]} onChange={(e) => setV({ ...v, [k]: Number(e.target.value) })} />
      <p className="text-[12.5px] text-[#6B5B4E] mt-1">{nota}</p>
    </div>
  );
  return (
    <Kad id="h-umum" tajuk="Tempahan" nota="Peraturan yang digunakan oleh jalur tarikh dan semakan tempahan.">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          jalan(() => simpan(v));
        }}
      >
        <fieldset disabled={!bolehUbah || sibuk} className="grid gap-3 sm:grid-cols-2 border-0 p-0 m-0">
          {nombor('minLeadDays', 'Tempah awal (hari)', 0, 30, 'Tarikh paling awal = hari ini + bilangan hari ini (atau lebih untuk kek tertentu).')}
          {nombor('dailyCapacity', 'Kapasiti sehari (bilangan tempahan)', 1, 200, 'Bila penuh, tarikh dipapar "Penuh".')}
          {nombor('holdHours', 'Tempoh pegangan (jam)', 1, 168, 'Tempahan "Baru di WhatsApp" dikira dalam kapasiti selama tempoh ini.')}
          <div>
            <label className="ad-lbl" htmlFor="u-wa">Nombor WhatsApp kedai</label>
            <input id="u-wa" className="ad-in" inputMode="numeric" value={v.whatsappNumber} onChange={(e) => setV({ ...v, whatsappNumber: e.target.value.replace(/\s/g, '') })} />
            <p className="text-[12.5px] text-[#6B5B4E] mt-1">Format 601XXXXXXXX. Semua butang WhatsApp di laman guna nombor ini.</p>
          </div>
          {bolehUbah && <div className="sm:col-span-2"><button type="submit" className="ad-btn">Simpan tetapan</button></div>}
        </fieldset>
      </form>
      {papar}
    </Kad>
  );
}
