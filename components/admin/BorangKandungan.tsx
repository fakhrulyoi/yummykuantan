'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { buangDraf, simpanDrafKandungan } from '@/app/admin/(dilindungi)/kandungan/actions';
import { LABEL_STATUS } from '@/lib/data/labelStatus';
import type { KunciKandungan, NilaiKandungan } from '@/lib/kandungan/jenis';
import { STATUS_TEMPAHAN } from '@/lib/tempahan/jenis';
import { PratontonPhone } from './PratontonPhone';
import { SusunGambar } from './SusunGambar';

type Props<K extends KunciKandungan> = { kunci: K; awal: NilaiKandungan[K]; terbit: NilaiKandungan[K]; adaDraf: boolean; tajuk: string };

const Medan = ({ id, label, nilai, onUbah, panjang, baris, nota }: { id: string; label: string; nilai: string; onUbah: (v: string) => void; panjang: number; baris?: number; nota?: string }) => (
  <div>
    <label className="ad-lbl" htmlFor={id}>{label}</label>
    {baris ? (
      <textarea id={id} className="ad-in" style={{ minHeight: baris * 26 + 20 }} maxLength={panjang} value={nilai} onChange={(e) => onUbah(e.target.value)} />
    ) : (
      <input id={id} className="ad-in" maxLength={panjang} value={nilai} onChange={(e) => onUbah(e.target.value)} />
    )}
    {nota && <p className="text-[12.5px] text-[#6B5B4E] mt-1">{nota}</p>}
  </div>
);

export function BorangKandungan<K extends KunciKandungan>({ kunci, awal, terbit, adaDraf: adaAwal, tajuk }: Props<K>) {
  const router = useRouter();
  const [sibuk, mula] = useTransition();
  const [v, setV] = useState<NilaiKandungan[K]>(awal);
  const [adaDraf, setAdaDraf] = useState(adaAwal);
  const [mesej, setMesej] = useState<{ ok: boolean; teks: string } | null>(null);
  const set = (u: Record<string, unknown>) => setV((x) => ({ ...x, ...u }) as NilaiKandungan[K]);

  const jalan = (f: () => Promise<{ ok: true } | { ok: false; ralat: string }>, berjaya: string, draf: boolean) =>
    mula(async () => {
      setMesej(null);
      const r = await f().catch(() => ({ ok: false as const, ralat: 'Tak dapat simpan. Muat semula dan cuba lagi.' }));
      if (!r.ok) return setMesej({ ok: false, teks: r.ralat });
      setAdaDraf(draf);
      setMesej({ ok: true, teks: berjaya });
      router.refresh();
    });

  let isi: React.ReactNode = null;
  if (kunci === 'hero') {
    const h = v as NilaiKandungan['hero'];
    isi = (
      <div className="flex gap-5 flex-wrap items-start">
        <div className="flex-[1_1_360px] grid gap-3.5 min-w-0">
          <Medan id="h-tajuk" label="Tajuk" nilai={h.tajuk} onUbah={(x) => set({ tajuk: x })} panjang={90} baris={2} />
          <Medan id="h-ayat" label="Penerangan (komputer)" nilai={h.ayat} onUbah={(x) => set({ ayat: x })} panjang={240} baris={3} />
          <Medan id="h-pendek" label="Penerangan pendek (phone)" nilai={h.ayatPendek} onUbah={(x) => set({ ayatPendek: x })} panjang={120} />
          <SusunGambar
            bucket="hero"
            maks={8}
            label="Gambar utama (bertukar setiap 6 saat, yang pertama dipapar dahulu)"
            nama="Gambar utama"
            gambar={h.gambar.map((g) => ({ url: g.url, alt: g.nama }))}
            onUbah={(g) => set({ gambar: g.map((x) => ({ url: x.url, nama: x.alt, posisi: h.gambar.find((y) => y.url === x.url)?.posisi ?? '50% 50%' })) })}
          />
          {h.gambar.map((g, i) => (
            <Medan key={g.url} id={`h-nama-${i}`} label={`Nama kek dalam gambar ${i + 1}`} nilai={g.nama} panjang={80} onUbah={(x) => set({ gambar: h.gambar.map((y, k) => (k === i ? { ...y, nama: x } : y)) })} />
          ))}
          <Medan id="h-ticker" label="Jalur nama kek (satu setiap baris)" nilai={h.ticker.join('\n')} panjang={700} baris={4} onUbah={(x) => set({ ticker: x.split('\n').map((y) => y.trim()).filter(Boolean) })} />
        </div>
        <PratontonPhone hero={h} />
      </div>
    );
  } else if (kunci === 'hubungi') {
    const h = v as NilaiKandungan['hubungi'];
    const f = (k: keyof typeof h, label: string, panjang: number, nota?: string) => (
      <Medan id={`c-${k}`} label={label} nilai={h[k]} panjang={panjang} nota={nota} onUbah={(x) => set({ [k]: x })} />
    );
    isi = (
      <div className="grid gap-3.5 sm:grid-cols-2">
        <div>
          <p className="ad-lbl">Nombor WhatsApp (untuk pautan)</p>
          <p className="ad-in flex items-center bg-[#FBF8F4]">{h.whatsapp}</p>
          <p className="text-[12.5px] text-[#6B5B4E] mt-1">Ditukar di Tetapan (satu nombor untuk semua butang dan mesej tempahan).</p>
        </div>
        {f('whatsappPapar', 'Nombor WhatsApp (dipapar)', 30, 'Contoh: +60 11-2302 3447')}
        {f('instagram', 'Instagram', 30, 'Tanpa @')}
        {f('tiktok', 'TikTok', 30, 'Tanpa @')}
        <div className="sm:col-span-2">{f('alamat', 'Alamat dapur', 200)}</div>
        {f('waktu', 'Waktu operasi', 120)}
        {f('kawasan', 'Kawasan penghantaran', 80)}
      </div>
    );
  } else if (kunci === 'footer') {
    const h = v as NilaiKandungan['footer'];
    isi = <Medan id="f-ayat" label="Ayat di footer" nilai={h.ayat} panjang={240} baris={3} onUbah={(x) => set({ ayat: x })} />;
  } else if (kunci === 'waTemplates') {
    const h = v as NilaiKandungan['waTemplates'];
    isi = (
      <div className="grid gap-3.5">
        <p className="text-[13.5px] text-[#6B5B4E]">Mesej yang dibuka bila anda tekan &ldquo;Balas di WhatsApp&rdquo; di tempahan, ikut status. Guna {'{ref}'}, {'{jumlah}'} dan {'{caraBayar}'}.</p>
        {STATUS_TEMPAHAN.map((st) => (
          <Medan key={st} id={`w-${st}`} label={LABEL_STATUS[st]} nilai={h[st] ?? ''} panjang={500} baris={2} onUbah={(x) => set({ [st]: x })} />
        ))}
        <Medan id="w-bayar" label="Cara bayar ({caraBayar})" nilai={h.caraBayar ?? ''} panjang={500} baris={2} onUbah={(x) => set({ caraBayar: x })} />
      </div>
    );
  } else if (kunci === 'galeri') {
    const h = v as NilaiKandungan['galeri'];
    isi = (
      <SusunGambar
        bucket="hero"
        maks={24}
        label="Gambar galeri &ldquo;Dari dapur kami&rdquo;"
        nama="Galeri"
        gambar={h.gambar.map((u) => ({ url: u, alt: '' }))}
        onUbah={(g) => set({ gambar: g.map((x) => x.url) })}
      />
    );
  } else if (kunci === 'ulasan') {
    const h = v as NilaiKandungan['ulasan'];
    const ubah = (p: typeof h.petikan) => set({ petikan: p });
    isi = (
      <div className="grid gap-3.5">
        <p className="text-[13.5px] text-[#6B5B4E]">Petik mesej sebenar pelanggan sahaja. Jangan tulis ulasan rekaan.</p>
        {h.petikan.map((p, i) => (
          <div key={i} className="grid gap-2 sm:grid-cols-[1fr_200px_auto] items-end border-t border-[#EFE7DD] pt-3">
            <Medan id={`u-teks-${i}`} label={`Petikan ${i + 1}`} nilai={p.teks} panjang={240} baris={2} onUbah={(x) => ubah(h.petikan.map((y, k) => (k === i ? { ...y, teks: x } : y)))} />
            <Medan id={`u-oleh-${i}`} label="Oleh" nilai={p.oleh} panjang={60} onUbah={(x) => ubah(h.petikan.map((y, k) => (k === i ? { ...y, oleh: x } : y)))} />
            <button type="button" className="ad-btn ad-danger" onClick={() => ubah(h.petikan.filter((_, k) => k !== i))}>Buang</button>
          </div>
        ))}
        {h.petikan.length < 8 && <button type="button" className="ad-btn ad-btn2 justify-self-start" onClick={() => ubah([...h.petikan, { teks: '', oleh: '' }])}>Tambah petikan</button>}
      </div>
    );
  }

  return (
    <section className="ad-card p-5 grid gap-3.5 flex-[1_1_380px] min-w-0" aria-labelledby="h-bahagian">
      <div className="flex justify-between items-center gap-3 flex-wrap">
        <h2 id="h-bahagian" className="text-lg font-bold">{tajuk}</h2>
        <span className="ad-badge" style={adaDraf ? { background: '#FFF1D6', color: '#7A4B00' } : { background: '#E3EFE1', color: '#22562B' }}>{adaDraf ? 'Draf belum diterbitkan' : 'Diterbitkan'}</span>
      </div>
      {isi}
      <div className="flex gap-2 justify-end flex-wrap border-t border-[#EFE7DD] pt-3.5">
        {adaDraf && <button type="button" className="ad-btn ad-btn2" disabled={sibuk} onClick={() => jalan(async () => { const r = await buangDraf(kunci); if (r.ok) setV(terbit); return r; }, 'Perubahan dibuang.', false)}>Buang perubahan</button>}
        <button type="button" className="ad-btn ad-btn2" disabled={sibuk} onClick={() => jalan(() => simpanDrafKandungan(kunci, v), 'Draf disimpan. Laman belum berubah.', true)}>Simpan draf</button>
        <button type="button" className="ad-btn" disabled={sibuk} onClick={() => jalan(() => simpanDrafKandungan(kunci, v, true), 'Diterbitkan. Laman sudah dikemas kini.', false)}>Terbitkan</button>
      </div>
      <div aria-live="polite">
        {mesej && <p role={mesej.ok ? 'status' : 'alert'} className={`text-[13.5px] ${mesej.ok ? 'text-[#22562B]' : 'text-[#8E2620]'}`}>{mesej.teks}</p>}
      </div>
    </section>
  );
}
