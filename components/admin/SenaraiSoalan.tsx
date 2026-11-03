'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { padamSoalan, simpanDrafSoalan, susunSoalan, tambahSoalan, terbitSoalan, tunjukSoalan } from '@/app/admin/(dilindungi)/soalan/actions';

type Soalan = { id: string; question: string; answer: string; visible: boolean; draftQuestion: string | null; draftAnswer: string | null };
type Hasil = { ok: true } | { ok: false; ralat: string };

const adaKurungan = (t: string) => t.includes('[');

function Baris({ f, n, pertama, akhir, onAlih, pemilik }: { f: Soalan; n: number; pertama: boolean; akhir: boolean; onAlih: (arah: -1 | 1) => void; pemilik: boolean }) {
  const router = useRouter();
  const [sibuk, mula] = useTransition();
  const [buka, setBuka] = useState(false);
  const [q, setQ] = useState(f.draftQuestion ?? f.question);
  const [a, setA] = useState(f.draftAnswer ?? f.answer);
  const [mesej, setMesej] = useState<{ ok: boolean; teks: string } | null>(null);
  const perlu = adaKurungan(q) || adaKurungan(a);
  const adaDraf = f.draftQuestion !== null || f.draftAnswer !== null;
  const jalan = (fn: () => Promise<Hasil>, berjaya: string) =>
    mula(async () => {
      setMesej(null);
      const r = await fn().catch(() => ({ ok: false as const, ralat: 'Tak dapat simpan. Cuba lagi.' }));
      if (!r.ok) return setMesej({ ok: false, teks: r.ralat });
      setMesej({ ok: true, teks: berjaya });
      router.refresh();
    });

  return (
    <li className="border-b border-[#EFE7DD] py-2.5">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="w-[22px] text-[#B0827F] text-[13px]">{n}</span>
        <button type="button" className="flex-1 min-w-[180px] text-left border-0 bg-transparent font-semibold text-[14.5px] cursor-pointer py-1" aria-expanded={buka} onClick={() => setBuka(!buka)}>
          {f.draftQuestion ?? f.question}
        </button>
        {perlu && <span className="ad-badge !h-[22px] !text-[11.5px] bg-[#FFF1D6] text-[#7A4B00]">Perlu diisi</span>}
        {adaDraf && <span className="ad-badge !h-[22px] !text-[11.5px] bg-[#FBEFD9] text-[#7A4E10]">Draf</span>}
        <span className={`ad-badge !h-[22px] !text-[11.5px] ${f.visible ? 'bg-[#E3EFE1] text-[#22562B]' : 'bg-[#EFE7DD] text-[#6B5A4C]'}`}>{f.visible ? 'Dipapar' : 'Disembunyi'}</span>
        <button type="button" className="ad-btn ad-btn2 !min-h-8 !px-2" aria-label={`Naikkan soalan ${n}`} disabled={pertama || sibuk} onClick={() => onAlih(-1)}>&#8593;</button>
        <button type="button" className="ad-btn ad-btn2 !min-h-8 !px-2" aria-label={`Turunkan soalan ${n}`} disabled={akhir || sibuk} onClick={() => onAlih(1)}>&#8595;</button>
      </div>
      {buka && (
        <div className="pl-[30px] pt-1.5 grid gap-2">
          <div>
            <label className="ad-lbl" htmlFor={`q-${f.id}`}>Soalan</label>
            <input id={`q-${f.id}`} className="ad-in" maxLength={160} value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div>
            <label className="ad-lbl" htmlFor={`a-${f.id}`}>Jawapan</label>
            <textarea id={`a-${f.id}`} className="ad-in" maxLength={800} value={a} onChange={(e) => setA(e.target.value)} />
            {perlu && <p className="text-[12.5px] text-[#7A4B00] mt-1">Ganti teks dalam [kurungan] dengan maklumat sebenar sebelum terbit.</p>}
          </div>
          <div className="flex gap-2 flex-wrap">
            <button type="button" className="ad-btn ad-btn2" disabled={sibuk} onClick={() => jalan(() => simpanDrafSoalan(f.id, q, a), 'Draf disimpan.')}>Simpan draf</button>
            <button
              type="button"
              className="ad-btn"
              disabled={sibuk}
              onClick={() => jalan(async () => { const d = await simpanDrafSoalan(f.id, q, a); return d.ok ? terbitSoalan(f.id) : d; }, 'Diterbitkan dan dipapar di laman.')}
            >
              Terbitkan
            </button>
            {f.visible && <button type="button" className="ad-btn ad-btn2" disabled={sibuk} onClick={() => jalan(() => tunjukSoalan(f.id, false), 'Disembunyikan dari laman.')}>Sembunyikan</button>}
            {pemilik && <button type="button" className="ad-btn ad-danger" disabled={sibuk} onClick={() => jalan(() => padamSoalan(f.id), 'Dipadam.')}>Padam</button>}
          </div>
        </div>
      )}
      <div aria-live="polite" className="pl-[30px]">
        {mesej && <p role={mesej.ok ? 'status' : 'alert'} className={`text-[13px] mt-1 ${mesej.ok ? 'text-[#22562B]' : 'text-[#8E2620]'}`}>{mesej.teks}</p>}
      </div>
    </li>
  );
}

export function SenaraiSoalan({ soalan, pemilik }: { soalan: Soalan[]; pemilik: boolean }) {
  const router = useRouter();
  const [sibuk, mula] = useTransition();
  const alih = (i: number, arah: -1 | 1) =>
    mula(async () => {
      const ids = soalan.map((f) => f.id);
      [ids[i], ids[i + arah]] = [ids[i + arah], ids[i]];
      await susunSoalan(ids);
      router.refresh();
    });
  return (
    <section className="ad-card p-5" aria-labelledby="h-soalan">
      <div className="flex justify-between items-center gap-3 flex-wrap">
        <h2 id="h-soalan" className="text-lg font-bold">Soalan lazim</h2>
        <form action={tambahSoalan}>
          <button type="submit" className="ad-btn ad-btn2" disabled={sibuk}>Tambah soalan</button>
        </form>
      </div>
      <p className="text-[13.5px] text-[#6B5A4C] mt-1">Teks dalam [kurungan] belum disahkan. Ganti dengan maklumat sebenar, kemudian Terbitkan. Hanya soalan yang dipapar muncul di laman.</p>
      <ol aria-label="Senarai soalan" className="list-none m-0 mt-3 p-0 border-t border-[#EFE7DD]">
        {soalan.map((f, i) => (
          <Baris key={`${f.id}-${f.draftQuestion ?? f.question}`} f={f} n={i + 1} pertama={i === 0} akhir={i === soalan.length - 1} onAlih={(arah) => alih(i, arah)} pemilik={pemilik} />
        ))}
      </ol>
    </section>
  );
}
