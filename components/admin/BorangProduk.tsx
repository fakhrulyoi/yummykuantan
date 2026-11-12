'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { padam, simpanDraf, terbit } from '@/app/admin/(dilindungi)/produk/actions';
import type { DrafProduk } from '@/lib/data/terbit';
import { SusunGambar } from './SusunGambar';

type Saiz = { id?: string; label: string; harga: string };
type Props = {
  id: string;
  slug: string;
  awal: DrafProduk & { adaDraf: boolean };
  kategori: { id: string; name: string }[];
  pemilik: boolean;
  slotMeja?: React.ReactNode;
};

const keSen = (rm: string) => Math.round(Number(rm.replace(',', '.')) * 100);

function Suis({ id, label, nota, nilai, onUbah }: { id: string; label: string; nota: string; nilai: boolean; onUbah: (v: boolean) => void }) {
  return (
    <div className="flex justify-between items-center gap-3 py-2.5 border-t border-[#EFE7DD]">
      <span id={`${id}-l`}>
        <span className="block font-semibold">{label}</span>
        <span className="text-[12.5px] text-[#6B5B4E]">{nota}</span>
      </span>
      <button type="button" className="ad-tog" role="switch" aria-checked={nilai} aria-labelledby={`${id}-l`} onClick={() => onUbah(!nilai)}>
        <span style={{ left: nilai ? 21 : 3 }} />
      </button>
    </div>
  );
}

export function BorangProduk({ id, slug, awal, kategori, pemilik, slotMeja }: Props) {
  const router = useRouter();
  const [sibuk, mula] = useTransition();
  const [f, setF] = useState({ ...awal, allergens: awal.allergens ?? '', storage: awal.storage ?? '' });
  const [saiz, setSaiz] = useState<Saiz[]>(
    awal.sizes.length ? awal.sizes.map((z) => ({ id: z.id, label: z.label, harga: (z.priceSen / 100).toFixed(2) })) : [{ label: '', harga: '' }],
  );
  const [mesej, setMesej] = useState<{ ok: boolean; teks: string } | null>(null);
  const [adaDraf, setAdaDraf] = useState(awal.adaDraf);
  const [sahPadam, setSahPadam] = useState(false);
  const ubah = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }));

  const draf = (): DrafProduk => ({
    name: f.name, categoryId: f.categoryId, description: f.description, leadDays: Number(f.leadDays) || 0,
    allergens: f.allergens.trim() || null, storage: f.storage.trim() || null, active: f.active, onTable: f.onTable,
    tablePosition: f.onTable ? (f.tablePosition ?? null) : null, allowDesign: f.allowDesign, allowMessage: f.allowMessage,
    sizes: saiz.map((z) => ({ ...(z.id ? { id: z.id } : {}), label: z.label, priceSen: keSen(z.harga) })),
    images: f.images,
  });

  const hantar = (jenis: 'draf' | 'terbit') =>
    mula(async () => {
      setMesej(null);
      const d = draf();
      if (d.sizes.some((z) => !Number.isFinite(z.priceSen))) return setMesej({ ok: false, teks: 'Harga mesti nombor, contoh 100 atau 100.50.' });
      try {
        const r = jenis === 'draf' ? await simpanDraf(id, d) : await terbit(id, d);
        if (!r.ok) return setMesej({ ok: false, teks: r.ralat });
        setAdaDraf(jenis === 'draf');
        setMesej({ ok: true, teks: jenis === 'draf' ? 'Draf disimpan. Laman belum berubah sehingga anda tekan Terbitkan.' : 'Diterbitkan. Laman sudah dikemas kini.' });
        router.refresh();
      } catch {
        setMesej({ ok: false, teks: 'Tak dapat simpan. Muat semula halaman dan cuba lagi.' });
      }
    });

  return (
    <section className="ad-card p-5 lg:p-[22px] grid gap-4" aria-labelledby="h-produk">
      <div className="flex justify-between items-center gap-2.5 flex-wrap">
        <div>
          <h1 id="h-produk" className="text-xl font-bold">{awal.name}</h1>
          <p className="text-[13px] text-[#6B5B4E]">
            {adaDraf ? 'Ada perubahan dalam draf, belum diterbitkan.' : 'Sama seperti di laman.'}{' '}
            <Link href={`/kek/${slug}`} target="_blank">Lihat di laman</Link>
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="ad-btn ad-btn2" disabled={sibuk} onClick={() => hantar('draf')}>Simpan draf</button>
          <button type="button" className="ad-btn" disabled={sibuk} onClick={() => hantar('terbit')}>Terbitkan</button>
        </div>
      </div>
      <div aria-live="polite">
        {mesej && (
          <p role={mesej.ok ? 'status' : 'alert'} className={`text-[13.5px] px-3 py-2 rounded-lg ${mesej.ok ? 'text-[#22562B] bg-[#E3F1E4]' : 'text-[#8E2620] bg-[#FBE3E1]'}`}>{mesej.teks}</p>
        )}
      </div>

      <SusunGambar gambar={f.images} nama={f.name} onUbah={(g) => ubah('images', g)} />
      {slotMeja}

      <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
        <div>
          <label className="ad-lbl" htmlFor="nm">Nama kek</label>
          <input id="nm" className="ad-in" maxLength={80} value={f.name} onChange={(e) => ubah('name', e.target.value)} />
        </div>
        <div>
          <label className="ad-lbl" htmlFor="ct">Kategori</label>
          <select id="ct" className="ad-in" value={f.categoryId} onChange={(e) => ubah('categoryId', e.target.value)}>
            {kategori.map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="ad-lbl" htmlFor="ds">Penerangan</label>
        <textarea id="ds" className="ad-in" maxLength={600} value={f.description} onChange={(e) => ubah('description', e.target.value)} />
      </div>

      <div>
        <p className="ad-lbl">Saiz dan harga</p>
        <div className="border border-[#E6DDD2] rounded-lg overflow-hidden">
          <div className="ad-th grid grid-cols-[1fr_120px_44px] sm:grid-cols-[1fr_140px_60px] gap-2.5 px-3 py-2 bg-[#FBF8F4]"><span>Saiz atau pilihan</span><span>Harga (RM)</span><span /></div>
          {saiz.map((z, i) => (
            <div key={z.id ?? `baru-${i}`} className="grid grid-cols-[1fr_120px_44px] sm:grid-cols-[1fr_140px_60px] gap-2.5 px-3 py-2 border-t border-[#EFE7DD] items-center">
              <input className="ad-in" aria-label={`Nama saiz ${i + 1}`} maxLength={40} value={z.label} onChange={(e) => setSaiz(saiz.map((x, k) => (k === i ? { ...x, label: e.target.value } : x)))} />
              <input className="ad-in" aria-label={`Harga ${z.label || `saiz ${i + 1}`}`} inputMode="decimal" value={z.harga} onChange={(e) => setSaiz(saiz.map((x, k) => (k === i ? { ...x, harga: e.target.value } : x)))} />
              <button type="button" className="ad-btn ad-btn2 !px-0" aria-label={`Buang saiz ${z.label || i + 1}`} disabled={saiz.length === 1} onClick={() => setSaiz(saiz.filter((_, k) => k !== i))}>&times;</button>
            </div>
          ))}
        </div>
        <button type="button" className="ad-btn ad-btn2 mt-2" onClick={() => setSaiz([...saiz, { label: '', harga: '' }])}>Tambah saiz</button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="ad-lbl" htmlFor="lead">Tempah awal (hari)</label>
          <input id="lead" className="ad-in" type="number" min={0} max={60} value={f.leadDays} onChange={(e) => ubah('leadDays', Number(e.target.value))} />
        </div>
        <div>
          <label className="ad-lbl" htmlFor="alg">Alergen</label>
          <input id="alg" className="ad-in" maxLength={300} placeholder="Contoh: telur, susu, gandum, kacang" value={f.allergens} onChange={(e) => ubah('allergens', e.target.value)} />
        </div>
      </div>
      <div>
        <label className="ad-lbl" htmlFor="smp">Cara simpan</label>
        <input id="smp" className="ad-in" maxLength={300} placeholder="Contoh: simpan dalam peti sejuk, terbaik dimakan dalam 3 hari" value={f.storage} onChange={(e) => ubah('storage', e.target.value)} />
      </div>

      <div className="grid">
        <Suis id="s-aktif" label="Aktif di laman" nota="Pelanggan boleh lihat dan tempah kek ini" nilai={f.active} onUbah={(v) => ubah('active', v)} />
        <Suis id="s-meja" label="Paparkan di meja kek" nota="Di laman utama, perlu gambar meja" nilai={f.onTable} onUbah={(v) => ubah('onTable', v)} />
        {f.onTable && (
          <div className="flex justify-between items-center gap-3 py-2.5 border-t border-[#EFE7DD]">
            <label htmlFor="pos"><span className="block font-semibold">Kedudukan di meja</span><span className="text-[12.5px] text-[#6B5B4E]">1 di kiri sekali</span></label>
            <input id="pos" className="ad-in !w-20" type="number" min={1} max={20} value={f.tablePosition ?? ''} onChange={(e) => ubah('tablePosition', e.target.value ? Number(e.target.value) : null)} />
          </div>
        )}
        <Suis id="s-reka" label="Rekaan khas" nota="Tunjuk pautan Tempahan rekaan khas di halaman kek" nilai={f.allowDesign} onUbah={(v) => ubah('allowDesign', v)} />
        <Suis id="s-tulis" label="Tulisan atas kek" nota="Pelanggan boleh tulis ucapan (30 aksara)" nilai={f.allowMessage} onUbah={(v) => ubah('allowMessage', v)} />
      </div>

      {pemilik && (
        <div className="border-t border-[#EFE7DD] pt-3.5 flex gap-2 items-center flex-wrap">
          {!sahPadam ? (
            <button type="button" className="ad-btn ad-danger" onClick={() => setSahPadam(true)}>Padam produk</button>
          ) : (
            <>
              <span className="text-[13.5px]">Padam {awal.name}? Jika kek ini ada dalam rekod tempahan, ia hanya dinyahaktif.</span>
              <button
                type="button"
                className="ad-btn ad-danger"
                disabled={sibuk}
                onClick={() =>
                  mula(async () => {
                    const r = await padam(id);
                    if (!r.ok) return setMesej({ ok: false, teks: r.ralat });
                    if (r.dipadam) router.push('/admin/produk');
                    else {
                      setSahPadam(false);
                      setMesej({ ok: true, teks: 'Kek ini ada dalam rekod tempahan, jadi ia dinyahaktif (tidak dipadam).' });
                      router.refresh();
                    }
                  })
                }
              >
                Ya, padam
              </button>
              <button type="button" className="ad-btn ad-btn2" onClick={() => setSahPadam(false)}>Batal</button>
            </>
          )}
        </div>
      )}
    </section>
  );
}
