'use client';

import { useState } from 'react';
import { buangHariTutup, tambahHariTutup } from '@/app/admin/(dilindungi)/tetapan/actions';
import { tarikhPenuh } from '@/lib/tempahan/tarikh';
import { Kad, useTindakan } from './BorangTetapan';

export function HariTutup({ hari, bolehUbah }: { hari: { date: string; reason: string | null }[]; bolehUbah: boolean }) {
  const [tarikh, setTarikh] = useState('');
  const [sebab, setSebab] = useState('');
  const { sibuk, jalan, papar } = useTindakan();
  return (
    <Kad id="h-tutup" tajuk="Hari tutup" nota="Tarikh ini dipapar &ldquo;Tutup&rdquo; dan tidak boleh ditempah.">
      {bolehUbah && (
        <form
          className="flex gap-2 flex-wrap items-end"
          onSubmit={(e) => {
            e.preventDefault();
            jalan(() => tambahHariTutup(tarikh, sebab), () => {
              setTarikh('');
              setSebab('');
            });
          }}
        >
          <div><label className="ad-lbl" htmlFor="ht-tarikh">Tarikh tutup</label><input id="ht-tarikh" className="ad-in" type="date" value={tarikh} onChange={(e) => setTarikh(e.target.value)} /></div>
          <div className="flex-1 min-w-[160px]"><label className="ad-lbl" htmlFor="ht-sebab">Sebab (pilihan)</label><input id="ht-sebab" className="ad-in" maxLength={80} value={sebab} onChange={(e) => setSebab(e.target.value)} placeholder="Contoh: Cuti keluarga" /></div>
          <button type="submit" className="ad-btn" disabled={sibuk || !tarikh}>Tambah hari tutup</button>
        </form>
      )}
      {papar}
      {hari.length === 0 ? (
        <p className="text-[13.5px] text-[#6B5B4E] mt-3">Tiada hari tutup akan datang.</p>
      ) : (
        <ul className="list-none m-0 mt-3 p-0" aria-label="Senarai hari tutup">
          {hari.map((h) => (
            <li key={h.date} className="flex justify-between items-center gap-3 border-t border-[#EFE7DD] py-2">
              <span><strong>{tarikhPenuh(h.date)}</strong>{h.reason ? <span className="text-[#6B5B4E]">, {h.reason}</span> : null}</span>
              {bolehUbah && <button type="button" className="ad-btn ad-btn2 !min-h-8" disabled={sibuk} aria-label={`Buang ${tarikhPenuh(h.date)}`} onClick={() => jalan(() => buangHariTutup(h.date))}>Buang</button>}
            </li>
          ))}
        </ul>
      )}
    </Kad>
  );
}
