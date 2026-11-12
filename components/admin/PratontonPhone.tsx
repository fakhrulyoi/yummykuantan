/* eslint-disable @next/next/no-img-element -- pratonton kecil */
import type { NilaiKandungan } from '@/lib/kandungan/jenis';

/** Pratonton bahagian utama laman di phone (390 px, dikecilkan). Menggunakan nilai draf semasa. */
export function PratontonPhone({ hero }: { hero: NilaiKandungan['hero'] }) {
  const g = hero.gambar[0];
  return (
    <figure className="m-0" aria-label="Pratonton phone">
      <div className="w-[234px] h-[470px] rounded-[30px] border-[6px] border-[#1E1611] overflow-hidden bg-[#4B141B] relative shadow-[0_10px_30px_rgba(30,22,17,.18)]">
        <div className="absolute inset-x-0 top-0 h-9 flex items-center justify-center bg-[#4B141B] z-[2]">
          <img src="/logo-krim.png" alt="" className="h-6 w-auto" />
        </div>
        {g && <img src={g.url} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: g.posisi ?? '50% 50%' }} />}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(42,9,14,.1)_30%,rgba(42,9,14,.92)_88%)]" />
        <div className="absolute inset-x-3 bottom-4 text-[#F2E7DE]">
          <p data-testid="pratonton-tajuk" className="font-serif text-[25px] leading-[1.04]">{hero.tajuk}</p>
          <span className="block w-14 h-px bg-[#F2E7DE] my-2.5" />
          <p className="text-[10.5px] text-[#ECDDD3]">{hero.ayatPendek}</p>
          <div className="grid grid-cols-2 gap-1.5 mt-2.5">
            <span className="h-7 grid place-items-center bg-[#EBCFC3] text-[#4B141B] text-[10px] font-semibold">Lihat koleksi</span>
            <span className="h-7 grid place-items-center border border-[#F2E7DE] text-[10px] font-semibold">Rekaan khas</span>
          </div>
        </div>
      </div>
      <figcaption className="text-[12.5px] text-[#6B5B4E] mt-2 text-center">Pratonton phone (draf)</figcaption>
    </figure>
  );
}
