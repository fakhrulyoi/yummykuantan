'use client';

import { useState } from 'react';
import { padamSlot, simpanSlot } from '@/app/admin/(dilindungi)/tetapan/actions';
import { Kad, useTindakan } from './BorangTetapan';

type Slot = { id?: string; label: string; startsAt: string; endsAt: string; capacity: number; active: boolean };

function Baris({ awal, bolehUbah, baru, onSelesai }: { awal: Slot; bolehUbah: boolean; baru?: boolean; onSelesai?: () => void }) {
  const [v, setV] = useState({ ...awal, startsAt: awal.startsAt.slice(0, 5), endsAt: awal.endsAt.slice(0, 5) });
  const { sibuk, jalan, papar } = useTindakan();
  const n = baru ? 'slot baru' : awal.label;
  return (
    <li className="border-t border-[#EFE7DD] py-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          jalan(() => simpanSlot(v), onSelesai);
        }}
      >
        <fieldset disabled={!bolehUbah || sibuk} className="grid gap-2 grid-cols-2 sm:grid-cols-[1.6fr_110px_110px_90px_auto_auto] items-end border-0 p-0 m-0">
          <div className="col-span-2 sm:col-span-1">
            <label className="ad-lbl" htmlFor={`sl-${awal.id ?? 'baru'}`}>Label</label>
            <input id={`sl-${awal.id ?? 'baru'}`} className="ad-in" maxLength={60} value={v.label} onChange={(e) => setV({ ...v, label: e.target.value })} placeholder="Contoh: 2:00 hingga 4:00 petang" />
          </div>
          <div><label className="ad-lbl" htmlFor={`sm-${awal.id ?? 'baru'}`}>Mula</label><input id={`sm-${awal.id ?? 'baru'}`} className="ad-in" type="time" value={v.startsAt} onChange={(e) => setV({ ...v, startsAt: e.target.value })} /></div>
          <div><label className="ad-lbl" htmlFor={`st-${awal.id ?? 'baru'}`}>Tamat</label><input id={`st-${awal.id ?? 'baru'}`} className="ad-in" type="time" value={v.endsAt} onChange={(e) => setV({ ...v, endsAt: e.target.value })} /></div>
          <div><label className="ad-lbl" htmlFor={`sk-${awal.id ?? 'baru'}`}>Kapasiti {baru ? '' : awal.label}</label><input id={`sk-${awal.id ?? 'baru'}`} className="ad-in" type="number" min={0} max={50} value={v.capacity} onChange={(e) => setV({ ...v, capacity: Number(e.target.value) })} /></div>
          <label className="flex items-center gap-1.5 text-[13px] min-h-[42px]"><input type="checkbox" checked={v.active} onChange={(e) => setV({ ...v, active: e.target.checked })} /> Aktif</label>
          {bolehUbah && (
            <span className="flex gap-1.5">
              <button type="submit" className="ad-btn ad-btn2" aria-label={`Simpan ${n}`}>Simpan</button>
              {!baru && awal.id && <button type="button" className="ad-btn ad-danger" aria-label={`Padam ${n}`} onClick={() => jalan(() => padamSlot(awal.id!))}>Padam</button>}
            </span>
          )}
        </fieldset>
      </form>
      {papar}
    </li>
  );
}

export function BorangSlot({ slot, bolehUbah }: { slot: Slot[]; bolehUbah: boolean }) {
  const [tambah, setTambah] = useState(false);
  return (
    <Kad id="h-slot" tajuk="Slot masa" nota="Masa ambil atau hantar, dan bilangan tempahan bagi setiap slot. Kapasiti 0 = slot penuh.">
      <ul className="list-none m-0 p-0" aria-label="Senarai slot">
        {slot.map((z) => <Baris key={z.id} awal={z} bolehUbah={bolehUbah} />)}
        {tambah && <Baris baru awal={{ label: '', startsAt: '10:00', endsAt: '12:00', capacity: 2, active: true }} bolehUbah={bolehUbah} onSelesai={() => setTambah(false)} />}
      </ul>
      {bolehUbah && !tambah && <button type="button" className="ad-btn ad-btn2 mt-2" onClick={() => setTambah(true)}>Tambah slot</button>}
    </Kad>
  );
}
