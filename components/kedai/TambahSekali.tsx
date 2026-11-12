'use client';

import type { AddonInput } from '@/lib/tempahan/jenis';
import { HAD } from '@/lib/tempahan/jenis';
import { formatRM } from '@/lib/tempahan/wang';

export type TambahanPapar = { id: string; name: string; note: string; priceSen: number; textKind: 'NONE' | 'NUMBER' | 'MESSAGE' };

/** Tambahan (lilin, kad, pisau, beg). Nombor lilin dan ucapan kad muncul bila tambahan itu dipilih. */
export function TambahSekali({
  tambahan, pilihan, onUbah,
}: { tambahan: TambahanPapar[]; pilihan: AddonInput[]; onUbah: (id: string, qty: number, text?: string) => void }) {
  if (!tambahan.length) return null;
  const qty = (id: string) => pilihan.find((a) => a.addonId === id)?.qty ?? 0;
  const teks = (id: string) => pilihan.find((a) => a.addonId === id)?.text ?? '';
  const berteks = tambahan.filter((a) => a.textKind !== 'NONE' && qty(a.id) > 0);
  return (
    <div className="mt-5 lg:mt-7">
      <h3 id="h-tambah" className="font-serif font-normal text-xl lg:text-[22px]">Tambah sekali</h3>
      <p className="text-[14.5px] lg:text-[15px] text-yk-muted">Pilihan untuk majlis anda. Dibungkus bersama kek.</p>
      <ul aria-labelledby="h-tambah" className="list-none mt-1.5 p-0 grid lg:grid-cols-2 lg:gap-x-6">
        {tambahan.map((a) => {
          const n = qty(a.id);
          return (
            <li key={a.id} className="flex items-center gap-3 py-3 border-b border-yk-line">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[15px] lg:text-[15px]">{a.name}</p>
                <p className="text-[14px] text-yk-muted">{a.note ? `${a.note}, ` : ''}{formatRM(a.priceSen)}</p>
              </div>
              <div className="flex items-center border border-yk-line-strong">
                <button type="button" className="w-10 h-10 bg-transparent border-0 text-lg cursor-pointer disabled:opacity-40" aria-label={`Kurangkan ${a.name}`} disabled={n === 0} onClick={() => onUbah(a.id, n - 1, teks(a.id) || undefined)}>
                  &#8722;
                </button>
                <span className="min-w-[22px] text-center">{n}</span>
                <button type="button" className="w-10 h-10 bg-transparent border-0 text-lg cursor-pointer disabled:opacity-40" aria-label={`Tambah ${a.name}`} disabled={n >= HAD.qtyMaks} onClick={() => onUbah(a.id, n + 1, teks(a.id) || undefined)}>
                  +
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      {berteks.map((a) =>
        a.textKind === 'NUMBER' ? (
          <div key={a.id} className="mt-3.5">
            <label className="b-lbl" htmlFor={`teks-${a.id}`}>Nombor untuk lilin</label>
            <input
              id={`teks-${a.id}`}
              className="b-in"
              inputMode="numeric"
              placeholder="Contoh: 25"
              value={teks(a.id)}
              onChange={(e) => onUbah(a.id, qty(a.id), e.target.value.replace(/[^0-9 ,]/g, '').slice(0, HAD.lilinNombor))}
            />
          </div>
        ) : (
          <div key={a.id} className="mt-3.5">
            <label className="b-lbl flex justify-between" htmlFor={`teks-${a.id}`}>
              <span>Ucapan dalam kad</span>
              <span className="font-normal text-yk-muted">{teks(a.id).length}/{HAD.kadUcapan}</span>
            </label>
            <textarea
              id={`teks-${a.id}`}
              className="b-in"
              maxLength={HAD.kadUcapan}
              placeholder="Contoh: Selamat hari jadi, mak. Sayang mak selalu."
              value={teks(a.id)}
              onChange={(e) => onUbah(a.id, qty(a.id), e.target.value.slice(0, HAD.kadUcapan))}
            />
          </div>
        ),
      )}
    </div>
  );
}
