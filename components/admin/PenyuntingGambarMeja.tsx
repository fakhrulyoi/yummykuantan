'use client';

/* eslint-disable @next/next/no-img-element -- pratonton gambar tempatan (blob:) */
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import { pulihGambarMeja, simpanDrafGambarMeja, terbitGambarMeja } from '@/app/admin/(dilindungi)/produk/actions';
import { normalkanGambarMeja } from '@/lib/gambar/meja';
import { muatNaikGambar } from '@/lib/muatNaik';

type Props = { productId: string; url: string | null; draf: string | null; asal: string | null };
type Hakis = 0 | 1 | 2 | 3 | 4;
type BuangLatar = (f: Blob) => Promise<Blob>;

/** Buang latar dalam browser. Model dimuat hanya bila diperlukan (fail besar). `__ykBuangLatar` untuk ujian e2e. */
async function buangLatar(f: Blob): Promise<Blob> {
  const ganti = (window as unknown as { __ykBuangLatar?: BuangLatar }).__ykBuangLatar;
  if (ganti) return ganti(f);
  const { removeBackground } = await import('@imgly/background-removal');
  return removeBackground(f, { output: { format: 'image/png' } });
}

export function PenyuntingGambarMeja({ productId, url, draf, asal }: Props) {
  const router = useRouter();
  const [sibuk, mula] = useTransition();
  const [keadaan, setKeadaan] = useState<'biasa' | 'buang' | 'muat'>('biasa');
  const [ralat, setRalat] = useState<string | null>(null);
  const [nota, setNota] = useState<string | null>(null);
  const [potongan, setPotongan] = useState<ImageBitmap | null>(null);
  const [hakis, setHakis] = useState<Hakis>(1);
  const [pratonton, setPratonton] = useState<{ blob: Blob; url: string } | null>(null);
  const input = useRef<HTMLInputElement>(null);

  // Jana semula pratonton bila slider berubah.
  useEffect(() => {
    if (!potongan) return;
    let batal = false;
    normalkanGambarMeja(potongan, hakis)
      .then((blob) => {
        if (batal) return;
        setPratonton((lama) => {
          if (lama) URL.revokeObjectURL(lama.url);
          return { blob, url: URL.createObjectURL(blob) };
        });
      })
      .catch(() => !batal && setRalat('Tak jumpa kek dalam gambar. Cuba gambar lain dengan latar kosong.'));
    return () => {
      batal = true;
    };
  }, [potongan, hakis]);

  const pilih = async (f: File | undefined) => {
    if (!f) return;
    setRalat(null);
    setNota(null);
    if (/image\/hei[cf]/.test(f.type) || /\.(heic|heif)$/i.test(f.name)) {
      setRalat('Tukar gambar ke JPG atau PNG dahulu (iPhone: Tetapan > Kamera > Format > Paling Serasi).');
      return;
    }
    if (!f.type.startsWith('image/')) {
      setRalat('Hanya gambar (JPG, PNG atau WebP) dibenarkan.');
      return;
    }
    setKeadaan('buang');
    try {
      const png = await buangLatar(f);
      setPotongan(await createImageBitmap(png));
    } catch {
      setRalat('Tak dapat buang latar. Cuba gambar lain, atau semak sambungan internet.');
    } finally {
      setKeadaan('biasa');
      if (input.current) input.current.value = '';
    }
  };

  const jalan = (f: () => Promise<{ ok: true } | { ok: false; ralat: string }>, berjaya: string) =>
    mula(async () => {
      setRalat(null);
      const r = await f().catch(() => ({ ok: false as const, ralat: 'Tak dapat simpan. Cuba lagi.' }));
      if (!r.ok) return setRalat(r.ralat);
      setNota(berjaya);
      router.refresh();
    });

  const simpan = () =>
    jalan(async () => {
      if (!pratonton) return { ok: false, ralat: 'Pilih gambar dahulu.' };
      setKeadaan('muat');
      const m = await muatNaikGambar(new File([pratonton.blob], 'meja.webp', { type: 'image/webp' }), 'meja');
      setKeadaan('biasa');
      if (!m.ok) return { ok: false, ralat: m.ralat };
      const r = await simpanDrafGambarMeja(productId, m.url);
      if (r.ok) setPotongan(null);
      return r;
    }, 'Gambar meja disimpan sebagai draf. Tekan Terbitkan gambar meja untuk guna di laman.');

  const tunjuk = pratonton && potongan ? pratonton.url : (draf ?? url);

  return (
    <div className="border border-[#E6DDD2] rounded-[10px] p-3.5 flex gap-[18px] items-stretch flex-wrap">
      <div
        role="img"
        aria-label={tunjuk ? 'Pratonton di meja kek' : 'Belum ada gambar meja'}
        className="relative flex-[0_0_200px] h-[230px] rounded-lg overflow-hidden bg-[radial-gradient(ellipse_80%_70%_at_50%_70%,#5A1C24_0%,#3A0E14_60%,#22060A_100%)]"
      >
        <div aria-hidden="true" className="absolute left-1/2 top-0 -translate-x-1/2 w-[190px] h-[210px] bg-[linear-gradient(180deg,rgba(255,232,214,.30),rgba(255,226,205,.08))] [clip-path:polygon(46%_0,54%_0,100%_100%,0_100%)]" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[46px] bg-[url(/meja/kayu.webp)] bg-center bg-[length:600px_auto] brightness-[.8]" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[46px] bg-[linear-gradient(180deg,rgba(20,4,7,.55),rgba(20,4,7,.1))]" />
        {tunjuk ? (
          <img src={tunjuk} alt="" data-testid="gambar-meja" className="absolute left-1/2 bottom-[22px] -translate-x-1/2 w-[140px] h-[190px] object-contain object-bottom" />
        ) : (
          <p className="absolute inset-0 flex items-center justify-center text-center p-5 text-[#E6CFC6] text-[13px]">Belum ada gambar meja</p>
        )}
        {keadaan === 'buang' && <p className="absolute inset-0 flex items-center justify-center bg-[rgba(34,6,10,.75)] text-[#F2E7DE] text-[13px] text-center p-4">Sedang buang latar…</p>}
      </div>

      <div className="flex-[1_1_260px] flex flex-col gap-2">
        <p className="ad-lbl !m-0">Gambar di meja kek</p>
        <p className="text-[13.5px] text-[#6B5B4E]">
          Gambar kek tanpa latar, berdiri di atas meja laman utama. Latar dibuang secara automatik dalam browser selepas pilih gambar. Semak hasilnya di sebelah sebelum terbitkan.
        </p>
        <ul className="m-0 pl-[18px] text-[13px] text-[#6B5B4E]">
          <li>Ambil dari sisi, paras mata kek</li>
          <li>Latar kosong dan terang, tiada barang lain</li>
          <li>Seluruh kek nampak, termasuk dapan di bawah</li>
        </ul>
        {potongan && (
          <div>
            <label className="ad-lbl !mb-1" htmlFor="hakis">Kemaskan tepi ({hakis} px)</label>
            <input id="hakis" type="range" min={0} max={4} step={1} value={hakis} onChange={(e) => setHakis(Number(e.target.value) as Hakis)} className="w-full accent-[#4B141B]" />
          </div>
        )}
        {draf && !potongan && <p className="text-[13px] text-[#7A4B00] bg-[#FFF1D6] px-2.5 py-1.5 rounded-md">Ada gambar meja baru dalam draf, belum diterbitkan.</p>}
        <div className="flex gap-2 flex-wrap mt-auto">
          <label className="ad-btn cursor-pointer" htmlFor="gambar-meja-input">{url || draf ? 'Tukar gambar meja' : 'Muat naik gambar meja'}</label>
          <input id="gambar-meja-input" ref={input} type="file" accept="image/*" className="sr-only" disabled={keadaan !== 'biasa' || sibuk} onChange={(e) => pilih(e.target.files?.[0])} />
          {potongan && pratonton && (
            <button type="button" className="ad-btn ad-btn2" disabled={sibuk || keadaan !== 'biasa'} onClick={simpan}>
              {keadaan === 'muat' ? 'Memuat naik…' : 'Simpan gambar meja'}
            </button>
          )}
          {draf && !potongan && (
            <button type="button" className="ad-btn ad-btn2" disabled={sibuk} onClick={() => jalan(() => terbitGambarMeja(productId), 'Gambar meja diterbitkan. Laman utama sudah dikemas kini.')}>
              Terbitkan gambar meja
            </button>
          )}
          {asal && !potongan && (
            <button type="button" className="ad-btn ad-btn2" disabled={sibuk} onClick={() => jalan(() => pulihGambarMeja(productId), 'Gambar sebelum ini dipulihkan.')}>
              Guna gambar sebelum ini
            </button>
          )}
        </div>
        <div aria-live="polite">
          {ralat && <p role="alert" className="text-[13px] text-[#8E2620]">{ralat}</p>}
          {nota && <p role="status" className="text-[13px] text-[#22562B]">{nota}</p>}
        </div>
      </div>
    </div>
  );
}
