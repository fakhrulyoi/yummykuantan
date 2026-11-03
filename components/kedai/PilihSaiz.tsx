'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { buatTempahanCepat } from '@/app/(kedai)/actions';
import type { SaizPapar } from '@/lib/data/produk';
import { useSenarai } from '@/lib/senarai/useSenarai';
import { sediaTetingkap } from '@/lib/tempahan/bukaWhatsApp';
import { HAD } from '@/lib/tempahan/jenis';
import { mesejRalat } from '@/lib/tempahan/mesejRalat';
import { formatRM } from '@/lib/tempahan/wang';
import { IkonWhatsApp } from './Ikon';

type Props = { productId: string; sizes: SaizPapar[]; allowMessage: boolean; leadDays: number; penerangan: React.ReactNode };

/** Pilih saiz, tulisan, kuantiti; tempah cepat di WhatsApp atau tambah ke senarai. */
export function PilihSaiz({ productId, sizes, allowMessage, leadDays, penerangan }: Props) {
  const [saiz, setSaiz] = useState(0);
  const [qty, setQty] = useState(1);
  const [ucapan, setUcapan] = useState('');
  const [sibuk, setSibuk] = useState(false);
  const [ralat, setRalat] = useState<string | null>(null);
  const { senarai, tambah } = useSenarai();
  const router = useRouter();
  const z = sizes[saiz];
  const msg = allowMessage ? ucapan.trim() : '';
  const dalam = senarai.items.some((i) => i.productId === productId && i.sizeId === z.id && (i.cakeMessage ?? '') === msg);

  const tempah = async () => {
    setRalat(null);
    setSibuk(true);
    const tetingkap = sediaTetingkap();
    try {
      const r = await buatTempahanCepat({ productId, sizeId: z.id, qty, ...(msg ? { cakeMessage: msg } : {}), lamanWeb: '' });
      if (!r.ok) {
        tetingkap.batal();
        setRalat(mesejRalat(r.ralat));
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
      <p className="text-[13.5px] text-yk-muted">{qty > 1 ? `${qty} × ${formatRM(z.priceSen)}, ${z.label}` : z.label}</p>
      {penerangan}

      <p className="b-lbl mt-5 lg:mt-7" id="lbl-saiz">Saiz</p>
      <div role="group" aria-labelledby="lbl-saiz" className="grid grid-cols-3 gap-2 lg:flex lg:flex-wrap">
        {sizes.map((x, k) => (
          <button key={x.id} type="button" className="b-pill text-center" aria-pressed={k === saiz} onClick={() => setSaiz(k)}>
            {x.label}
            <span className="block text-[12.5px] lg:text-[13px] text-yk-muted">{formatRM(x.priceSen)}</span>
          </button>
        ))}
      </div>

      {allowMessage && (
        <div className="mt-[18px] lg:mt-[22px]">
          <label className="b-lbl" htmlFor="ucapan">Tulisan atas kek (pilihan)</label>
          <input id="ucapan" className="b-in" maxLength={HAD.ucapanKek} placeholder="Contoh: Selamat Pengantin Baru" value={ucapan} onChange={(e) => setUcapan(e.target.value.slice(0, HAD.ucapanKek))} />
          <p className="text-[12.5px] text-[#C0948F] mt-1">{ucapan.length}/{HAD.ucapanKek} aksara</p>
        </div>
      )}

      <p className="text-[13.5px] text-yk-ok mt-3">
        Tempah sekurang-kurangnya {leadDays} hari lebih awal. Tarikh, cara terima dan caj penghantaran disahkan di WhatsApp.
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
      <p role="alert" className="text-sm text-yk-warn mt-2 empty:hidden">{ralat}</p>

      <button
        type="button"
        className="b-btn b-line w-full mt-3.5 lg:mt-2.5"
        onClick={() => !dalam && tambah({ productId, sizeId: z.id, qty, ...(msg ? { cakeMessage: msg } : {}) })}
      >
        {dalam ? 'Dalam senarai tempahan' : 'Tambah ke senarai'}
        <span className="sr-only"> (untuk lebih dari satu kek)</span>
      </button>
      <p className="text-[13px] text-yk-muted mt-2">Nak tempah lebih dari satu kek? Tambah ke senarai, kemudian hantar semua sekali.</p>
    </>
  );
}
