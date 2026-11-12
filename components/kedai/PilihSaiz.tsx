'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { buatTempahanCepat } from '@/app/(kedai)/actions';
import type { SaizPapar } from '@/lib/data/produk';
import { useSenarai } from '@/lib/senarai/useSenarai';
import { sediaTetingkap } from '@/lib/tempahan/bukaWhatsApp';
import { HAD } from '@/lib/tempahan/jenis';
import { mesejRalat } from '@/lib/tempahan/mesejRalat';
import { formatRM } from '@/lib/tempahan/wang';
import { IkonWhatsApp } from './Ikon';
import { JalurTarikh, type HariJalur } from './JalurTarikh';
import { KUNCI_TARIKH } from './TarikhKosong';

type Props = { productId: string; sizes: SaizPapar[]; allowMessage: boolean; leadDays: number; penerangan: React.ReactNode; hari: HariJalur[]; saizAwal?: string };

/** Pilih saiz, tulisan, kuantiti; tempah cepat di WhatsApp atau tambah ke senarai. */
const RALAT_TARIKH = new Set(['HARI_PENUH', 'HARI_TUTUP', 'TERLALU_AWAL']);

export function PilihSaiz({ productId, sizes, allowMessage, leadDays, penerangan, hari, saizAwal }: Props) {
  const [saiz, setSaiz] = useState(() => Math.max(0, sizes.findIndex((x) => x.id === saizAwal)));
  const [tarikh, setTarikh] = useState<string | null>(null);
  const [ralatTarikh, setRalatTarikh] = useState<string | null>(null);
  const kotakTarikh = useRef<HTMLDivElement>(null);
  const [qty, setQty] = useState(1);
  const [ucapan, setUcapan] = useState('');
  const [sibuk, setSibuk] = useState(false);
  const [ralat, setRalat] = useState<string | null>(null);
  const { senarai, tambah } = useSenarai();
  const router = useRouter();
  const z = sizes[saiz];
  const msg = allowMessage ? ucapan.trim() : '';
  const dalam = senarai.items.some((i) => i.productId === productId && i.sizeId === z.id && (i.cakeMessage ?? '') === msg);

  // Tarikh yang dipilih di laman utama atau halaman lain (jika masih kosong).
  useEffect(() => {
    try {
      const t = sessionStorage.getItem(KUNCI_TARIKH);
      if (t && hari.some((h) => h.tarikh === t && h.status === 'ada')) setTarikh(t);
    } catch {
      /* storan disekat */
    }
  }, [hari]);

  const pilihTarikh = (t: string) => {
    setTarikh(t);
    setRalatTarikh(null);
    try {
      sessionStorage.setItem(KUNCI_TARIKH, t);
    } catch {
      /* abaikan */
    }
  };

  const tempah = async () => {
    setRalat(null);
    if (!tarikh) {
      setRalatTarikh('Pilih tarikh dahulu.');
      kotakTarikh.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      kotakTarikh.current?.querySelector<HTMLButtonElement>('button:not([disabled])')?.focus({ preventScroll: true });
      return;
    }
    setSibuk(true);
    const tetingkap = sediaTetingkap();
    try {
      const r = await buatTempahanCepat({ productId, sizeId: z.id, qty, date: tarikh, ...(msg ? { cakeMessage: msg } : {}), lamanWeb: '' });
      if (!r.ok) {
        tetingkap.batal();
        if (RALAT_TARIKH.has(r.ralat)) {
          setRalatTarikh(mesejRalat(r.ralat));
          setTarikh(null);
          router.refresh();
          kotakTarikh.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else setRalat(mesejRalat(r.ralat));
        return;
      }
      tetingkap.pergi(r.waUrl);
      router.push(`/tempahan/${r.ref}?t=${r.token}`);
    } catch {
      tetingkap.batal();
      setRalat(mesejRalat(''));
    } finally {
      setSibuk(false);
    }
  };

  const stepper = (
    <div className="flex items-center border border-yk-line-strong h-[52px] flex-none">
      <button type="button" className="w-11 h-11 bg-transparent border-0 text-xl cursor-pointer disabled:opacity-40" aria-label="Kurangkan kuantiti" disabled={qty <= HAD.qtyMin} onClick={() => setQty((q) => Math.max(HAD.qtyMin, q - 1))}>
        &#8722;
      </button>
      <span aria-live="polite" aria-label={`Kuantiti ${qty}`} className="min-w-[26px] lg:min-w-[30px] text-center">{qty}</span>
      <button type="button" className="w-11 h-11 bg-transparent border-0 text-xl cursor-pointer disabled:opacity-40" aria-label="Tambah kuantiti" disabled={qty >= HAD.qtyMaks} onClick={() => setQty((q) => Math.min(HAD.qtyMaks, q + 1))}>
        +
      </button>
    </div>
  );

  return (
    <>
      <p className="font-serif text-[28px] lg:text-[34px] mt-2.5 lg:mt-4" data-testid="harga">{formatRM(z.priceSen * qty)}</p>
      <p className="text-[15px] text-yk-muted">{qty > 1 ? `${qty} × ${formatRM(z.priceSen)}, ${z.label}` : z.label}</p>
      {penerangan}

      <p className="b-lbl mt-5 lg:mt-7" id="lbl-saiz">Saiz</p>
      <div role="group" aria-labelledby="lbl-saiz" className="grid grid-cols-3 gap-2 lg:flex lg:flex-wrap">
        {sizes.map((x, k) => (
          <button key={x.id} type="button" className="b-pill text-center" aria-pressed={k === saiz} onClick={() => setSaiz(k)}>
            {x.label}
            <span className="block text-[14px] lg:text-[14.5px] text-yk-muted">{formatRM(x.priceSen)}</span>
          </button>
        ))}
      </div>

      {allowMessage && (
        <div className="mt-[18px] lg:mt-[22px]">
          <label className="b-lbl" htmlFor="ucapan">Tulisan atas kek (pilihan)</label>
          <input id="ucapan" className="b-in" maxLength={HAD.ucapanKek} placeholder="Contoh: Selamat Pengantin Baru" value={ucapan} onChange={(e) => setUcapan(e.target.value.slice(0, HAD.ucapanKek))} />
          <p className="text-[14px] text-yk-muted mt-1">{ucapan.length}/{HAD.ucapanKek} aksara</p>
        </div>
      )}

      <div ref={kotakTarikh} id="tempah" className="-mx-4 mt-5 lg:mx-0 lg:mt-6 scroll-mt-24">
        <JalurTarikh hari={hari} pilih={tarikh} onPilih={pilihTarikh} />
        <p role="alert" className="px-4 lg:px-0 mt-1.5 text-[15px] text-yk-warn empty:hidden">{ralatTarikh}</p>
      </div>
      <p className="text-[15px] text-yk-cream-2 mt-2.5">
        Tempah sekurang-kurangnya {leadDays} hari lebih awal. Masa ambil atau hantar disahkan di WhatsApp.
      </p>

      <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2.5 items-center px-4 pt-2.5 pb-4 bg-[rgba(60,13,19,.97)] border-t border-yk-line lg:static lg:z-auto lg:p-0 lg:mt-6 lg:bg-transparent lg:border-0 lg:flex-wrap">
        {stepper}
        <button type="button" className="b-btn yk-pulse relative flex-1 !px-3 lg:flex-[1_1_220px]" disabled={sibuk} onClick={tempah}>
          <IkonWhatsApp />
          {sibuk ? (
            <span>Membuka WhatsApp…</span>
          ) : (
            <span>
              Tempah<span className="sr-only lg:not-sr-only"> di WhatsApp</span>
              <span className="lg:hidden">, {formatRM(z.priceSen * qty)}</span>
            </span>
          )}
        </button>
      </div>
      <p role="alert" className="text-[15px] text-yk-warn mt-2 empty:hidden">{ralat}</p>

      <div className="mt-5 lg:mt-4 px-4 py-3.5 border border-yk-line flex flex-wrap items-center justify-between gap-3">
        <p className="text-[15px] text-yk-cream-2 flex-[1_1_200px]">Nak tempah lebih dari satu kek? Masukkan dalam senarai, kemudian hantar semua sekali.</p>
        {dalam ? (
          <Link href="/senarai" className="b-btn b-line !min-h-11 flex-none">Dalam senarai. Lihat senarai</Link>
        ) : (
          <button
            type="button"
            className="b-btn b-line !min-h-11 flex-none"
            onClick={() => tambah({ productId, sizeId: z.id, qty, ...(msg ? { cakeMessage: msg } : {}) })}
          >
            Tambah ke senarai
          </button>
        )}
      </div>
    </>
  );
}
