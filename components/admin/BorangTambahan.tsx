'use client';

import { useState } from 'react';
import { simpanTambahan } from '@/app/admin/(dilindungi)/tetapan/actions';
import { Kad, useTindakan } from './BorangTetapan';

type Tambahan = { id?: string; name: string; note: string; priceSen: number; textKind: 'NONE' | 'NUMBER' | 'MESSAGE'; active: boolean };

function Baris({ awal, bolehUbah, baru, onSelesai }: { awal: Tambahan; bolehUbah: boolean; baru?: boolean; onSelesai?: () => void }) {
  const [v, setV] = useState({ ...awal, harga: (awal.priceSen / 100).toFixed(2) });
  const { sibuk, jalan, papar } = useTindakan();
  const k = awal.id ?? 'baru';
  const n = baru ? 'tambahan baru' : awal.name;
  return (
    <li className="border-t border-[#EFE7DD] py-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const priceSen = Math.round(Number(v.harga.replace(',', '.')) * 100);
          jalan(() => simpanTambahan({ id: awal.id, name: v.name, note: v.note, priceSen: Number.isFinite(priceSen) ? priceSen : -1, textKind: v.textKind, active: v.active }), onSelesai);
        }}
      >
        <fieldset disabled={!bolehUbah || sibuk} className="grid gap-2 grid-cols-2 sm:grid-cols-[1.2fr_1.4fr_100px_130px_auto_auto] items-end border-0 p-0 m-0">
          <div className="col-span-2 sm:col-span-1"><label className="ad-lbl" htmlFor={`tn-${k}`}>Nama</label><input id={`tn-${k}`} className="ad-in" maxLength={60} value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} /></div>
          <div className="col-span-2 sm:col-span-1"><label className="ad-lbl" htmlFor={`tt-${k}`}>Nota</label><input id={`tt-${k}`} className="ad-in" maxLength={120} value={v.note} onChange={(e) => setV({ ...v, note: e.target.value })} /></div>
          <div><label className="ad-lbl" htmlFor={`th-${k}`}>Harga {baru ? '' : awal.name} (RM)</label><input id={`th-${k}`} className="ad-in" inputMode="decimal" value={v.harga} onChange={(e) => setV({ ...v, harga: e.target.value })} /></div>
          <div>
            <label className="ad-lbl" htmlFor={`tj-${k}`}>Teks pelanggan</label>
            <select id={`tj-${k}`} className="ad-in" value={v.textKind} onChange={(e) => setV({ ...v, textKind: e.target.value as Tambahan['textKind'] })}>
              <option value="NONE">Tiada</option>
              <option value="NUMBER">Nombor (lilin)</option>
              <option value="MESSAGE">Ucapan (kad)</option>
            </select>
          </div>
          <label className="flex items-center gap-1.5 text-[13px] min-h-[42px]"><input type="checkbox" checked={v.active} onChange={(e) => setV({ ...v, active: e.target.checked })} /> Aktif</label>
          {bolehUbah && <button type="submit" className="ad-btn ad-btn2" aria-label={`Simpan ${n}`}>Simpan</button>}
        </fieldset>
      </form>
      {papar}
    </li>
  );
}

export function BorangTambahan({ tambahan, bolehUbah }: { tambahan: Tambahan[]; bolehUbah: boolean }) {
  const [tambah, setTambah] = useState(false);
  return (
    <Kad id="h-tambahan" tajuk="Tambahan" nota="Lilin, kad, pisau dan beg yang pelanggan boleh tambah dalam senarai tempahan.">
      <ul className="list-none m-0 p-0" aria-label="Senarai tambahan">
        {tambahan.map((a) => <Baris key={a.id} awal={a} bolehUbah={bolehUbah} />)}
        {tambah && <Baris baru awal={{ name: '', note: '', priceSen: 0, textKind: 'NONE', active: true }} bolehUbah={bolehUbah} onSelesai={() => setTambah(false)} />}
      </ul>
      {bolehUbah && !tambah && <button type="button" className="ad-btn ad-btn2 mt-2" onClick={() => setTambah(true)}>Tambah tambahan</button>}
    </Kad>
  );
}
