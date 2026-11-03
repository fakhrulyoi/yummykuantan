'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { muatNaikGambar } from '@/lib/muatNaik';

type Gambar = { url: string; alt: string };

/** Gambar produk: seret untuk susun (atau butang anak panah), yang pertama jadi gambar utama. */
export function SusunGambar({ gambar, onUbah, nama, bucket = 'produk', label = 'Gambar (seret untuk susun, yang pertama jadi gambar utama)', maks = 12 }: { gambar: Gambar[]; onUbah: (g: Gambar[]) => void; nama: string; bucket?: 'produk' | 'hero'; label?: string; maks?: number }) {
  const [seret, setSeret] = useState<number | null>(null);
  const [ralat, setRalat] = useState<string | null>(null);
  const [sibuk, setSibuk] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const alih = (dari: number, ke: number) => {
    if (ke < 0 || ke >= gambar.length || dari === ke) return;
    const g = [...gambar];
    const [x] = g.splice(dari, 1);
    g.splice(ke, 0, x);
    onUbah(g);
  };

  const pilih = async (fail: FileList | null) => {
    if (!fail?.length) return;
    setRalat(null);
    setSibuk(true);
    const baru: Gambar[] = [];
    for (const f of Array.from(fail).slice(0, maks - gambar.length)) {
      const r = await muatNaikGambar(f, bucket);
      if (!r.ok) {
        setRalat(r.ralat);
        break;
      }
      baru.push({ url: r.url, alt: '' });
    }
    if (baru.length) onUbah([...gambar, ...baru]);
    setSibuk(false);
    if (input.current) input.current.value = '';
  };

  return (
    <div>
      <p className="ad-lbl" id={`lbl-${bucket}`}>{label}</p>
      <ul aria-labelledby={`lbl-${bucket}`} className="list-none p-0 m-0 flex gap-2.5 flex-wrap">
        {gambar.map((g, i) => (
          <li
            key={g.url}
            draggable
            onDragStart={() => setSeret(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (seret !== null) alih(seret, i);
              setSeret(null);
            }}
            className={`relative w-24 rounded-lg overflow-hidden bg-[#ECE5DB] ${seret === i ? 'opacity-50' : ''}`}
          >
            <div className="relative h-[116px] cursor-grab">
              <Image src={g.url} alt={`${nama}, gambar ${i + 1}`} fill sizes="96px" className="object-cover" />
              {i === 0 && <span className="absolute left-1 top-1 ad-badge !h-5 !text-[11px] bg-white">Utama</span>}
            </div>
            <div className="flex justify-between bg-white border-t border-[#EFE7DD]">
              <button type="button" className="w-8 h-8 border-0 bg-transparent cursor-pointer disabled:opacity-30" aria-label={`Alih gambar ${i + 1} ke kiri`} disabled={i === 0} onClick={() => alih(i, i - 1)}>&larr;</button>
              <button type="button" className="w-8 h-8 border-0 bg-transparent cursor-pointer text-[#8E2620]" aria-label={`Buang gambar ${i + 1}`} onClick={() => onUbah(gambar.filter((_, k) => k !== i))}>&times;</button>
              <button type="button" className="w-8 h-8 border-0 bg-transparent cursor-pointer disabled:opacity-30" aria-label={`Alih gambar ${i + 1} ke kanan`} disabled={i === gambar.length - 1} onClick={() => alih(i, i + 1)}>&rarr;</button>
            </div>
          </li>
        ))}
        {gambar.length < maks && (
          <li>
            <label className="ad-btn ad-btn2 !w-24 !h-[148px] flex-col !whitespace-normal text-center cursor-pointer" htmlFor={`tambah-${bucket}`}>
              {sibuk ? 'Memuat naik…' : <>+<span className="text-[12.5px]">Tambah gambar</span></>}
            </label>
            <input id={`tambah-${bucket}`} ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple className="sr-only" onChange={(e) => pilih(e.target.files)} disabled={sibuk} />
          </li>
        )}
      </ul>
      <div aria-live="polite">{ralat && <p role="alert" className="text-[13px] text-[#8E2620] mt-1.5">{ralat}</p>}</div>
    </div>
  );
}
