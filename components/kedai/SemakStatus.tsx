'use client';

import { useState } from 'react';
import { semakTempahan } from '@/app/(kedai)/actions';
import type { OrderStatus } from '@/lib/tempahan/jenis';
import { mesejRalat } from '@/lib/tempahan/mesejRalat';
import { tarikhPenuh } from '@/lib/tempahan/tarikh';

type Hasil = { status: OrderStatus; kind: 'QUICK' | 'LIST'; date: string | null; mode: string | null };

const KEDUDUKAN: Record<OrderStatus, number> = {
  BARU_WA: 0, MENUNGGU_BAYARAN: 0, DISAHKAN: 1, DALAM_PENYEDIAAN: 2, SEDIA_DIAMBIL: 3, DALAM_PENGHANTARAN: 3, SELESAI: 4, DIBATALKAN: -1,
};

function tajuk(h: Hasil): string {
  if (h.status === 'DIBATALKAN') return 'Tempahan ini telah dibatalkan.';
  if (h.status === 'MENUNGGU_BAYARAN') return 'Kami sedang menunggu bayaran anda.';
  return [
    'Kami terima tempahan anda di WhatsApp.',
    'Tempahan disahkan.',
    'Kek anda sedang disediakan.',
    h.mode === 'DELIVERY' ? 'Kek anda dalam perjalanan.' : 'Kek anda sedia untuk diambil.',
    'Selesai. Terima kasih!',
  ][KEDUDUKAN[h.status]];
}

export function SemakStatus({ refAwal }: { refAwal: string }) {
  const [ref, setRef] = useState(refAwal);
  const [empat, setEmpat] = useState('');
  const [hasil, setHasil] = useState<Hasil | null>(null);
  const [ralat, setRalat] = useState<string | null>(null);
  const [sibuk, setSibuk] = useState(false);

  const semak = async () => {
    setSibuk(true);
    setRalat(null);
    try {
      const r = await semakTempahan({ ref, empat });
      if (r.ok) setHasil(r);
      else {
        setHasil(null);
        setRalat(r.ralat === 'HAD_KADAR' ? mesejRalat('HAD_KADAR') : 'Tiada tempahan sepadan. Semak rujukan (contoh YK-24117) dan 4 digit akhir telefon.');
      }
    } catch {
      setRalat('Tak dapat semak sekarang. Cuba lagi atau WhatsApp kami.');
    } finally {
      setSibuk(false);
    }
  };

  const langkah = hasil
    ? ['Dihantar di WhatsApp', 'Disahkan dan dibayar', 'Dalam penyediaan', hasil.mode === 'DELIVERY' ? 'Dalam penghantaran' : 'Sedia untuk diambil', 'Selesai']
    : [];
  const di = hasil ? KEDUDUKAN[hasil.status] : -1;

  return (
    <>
      <form
        className="mt-5 grid gap-3 lg:grid-cols-[1fr_200px_auto] lg:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          if (!sibuk) void semak();
        }}
      >
        <div>
          <label className="b-lbl" htmlFor="ref">Rujukan tempahan</label>
          <input id="ref" className="b-in uppercase" placeholder="YK-24117" autoComplete="off" maxLength={12} value={ref} onChange={(e) => setRef(e.target.value)} />
        </div>
        <div>
          <label className="b-lbl" htmlFor="empat">4 digit akhir telefon</label>
          <input id="empat" className="b-in" inputMode="numeric" autoComplete="off" maxLength={4} value={empat} onChange={(e) => setEmpat(e.target.value.replace(/\D/g, '').slice(0, 4))} />
        </div>
        <button type="submit" className="b-btn" disabled={sibuk}>{sibuk ? 'Menyemak…' : 'Semak'}</button>
      </form>
      <div aria-live="polite">
        {ralat && <p role="alert" className="mt-3 text-sm text-yk-error">{ralat}</p>}
        {hasil && (
          <section aria-labelledby="h-status" className="mt-8">
            <p className="text-yk-muted text-[13.5px]">Tempahan {ref.trim().toUpperCase()}</p>
            <h2 id="h-status" className="text-[30px] lg:text-[40px] leading-[1.05] mt-1">{tajuk(hasil)}</h2>
            <p className="mt-2 text-yk-cream-2">
              {hasil.date
                ? `${hasil.mode === 'DELIVERY' ? 'Penghantaran' : 'Ambil sendiri'}, ${tarikhPenuh(hasil.date)}`
                : 'Tarikh akan disahkan di WhatsApp.'}
            </p>
            {hasil.status !== 'DIBATALKAN' && (
              <ol aria-label="Status tempahan" className="list-none p-0 m-0 mt-6">
                {langkah.map((n, i) => (
                  <li key={n} className="flex gap-3.5" aria-current={i === di ? 'step' : undefined}>
                    <div className="flex flex-col items-center">
                      <span
                        className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-none"
                        style={{ borderColor: i <= di ? '#EBCFC3' : '#8A4A52', background: i < di ? '#EBCFC3' : 'transparent' }}
                      >
                        {i < di && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4B141B" strokeWidth="3.5" aria-hidden="true"><path d="M5 12l4 4 10-10" /></svg>
                        )}
                      </span>
                      {i < langkah.length - 1 && <span className="w-0.5 flex-1 min-h-[26px]" style={{ background: i < di ? '#EBCFC3' : '#74343C' }} />}
                    </div>
                    <p className={`pb-4 ${i === di ? 'font-bold' : 'font-medium'} ${i <= di ? 'text-yk-cream' : 'text-[#B0827F]'}`}>
                      {n}
                      {i < di && <span className="sr-only"> (selesai)</span>}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </section>
        )}
      </div>
    </>
  );
}
