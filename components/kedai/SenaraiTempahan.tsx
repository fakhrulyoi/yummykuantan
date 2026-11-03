'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { buatTempahan } from '@/app/(kedai)/actions';
import { bacaSenarai, KUNCI } from '@/lib/senarai/senarai';
import { useSenarai } from '@/lib/senarai/useSenarai';
import { sediaTetingkap } from '@/lib/tempahan/bukaWhatsApp';
import { HAD, type BarisAddon, type BarisItem } from '@/lib/tempahan/jenis';
import { mesejRalat } from '@/lib/tempahan/mesejRalat';
import { binaMesejWhatsApp, waUrl } from '@/lib/tempahan/mesej';
import { tambahHari, tarikhPenuh } from '@/lib/tempahan/tarikh';
import { formatRM } from '@/lib/tempahan/wang';
import { IkonWhatsApp } from './Ikon';
import { JalurTarikh, type HariJalur } from './JalurTarikh';
import { PilihSlot } from './PilihSlot';
import { TambahSekali, type TambahanPapar } from './TambahSekali';
import { KUNCI_TARIKH } from './TarikhKosong';
import { TeksTbc } from './TeksTbc';

export type KekSenarai = { id: string; slug: string; name: string; image: string | null; leadDays: number; sizes: { id: string; label: string; priceSen: number }[] };
export type HariBaki = { tarikh: string; tutup: boolean; jumlahSlot: number; slot: Record<string, number> };

type Props = {
  kek: KekSenarai[];
  tambahan: TambahanPapar[];
  hari: HariBaki[];
  slot: { id: string; label: string }[];
  hariIni: string;
  minLeadDays: number;
  kawasan: string[];
  alamatAmbil: string;
  whatsapp: string;
};

const BIL_HARI = 14;
const TIDAK_AKTIF = 'Kek ini tidak lagi ditawarkan, jadi kami keluarkan dari senarai.';

export function SenaraiTempahan({ kek, tambahan, hari, slot, hariIni, minLeadDays, kawasan, alamatAmbil, whatsapp }: Props) {
  const { senarai, ganti, ubah, buang, ubahAddon, kosongkan } = useSenarai();
  const router = useRouter();
  const [dimuat, setDimuat] = useState(false);
  const [notis, setNotis] = useState<string | null>(null);
  const [mode, setMode] = useState<'PICKUP' | 'DELIVERY'>('PICKUP');
  const [area, setArea] = useState(kawasan[0] ?? '');
  const [alamat, setAlamat] = useState('');
  const [tarikh, setTarikh] = useState<string | null>(null);
  const [slotId, setSlotId] = useState<string | null>(null);
  const [nama, setNama] = useState('');
  const [telefon, setTelefon] = useState('');
  const [nota, setNota] = useState('');
  const [perangkap, setPerangkap] = useState('');
  const [medan, setMedan] = useState<Record<string, string>>({});
  const [ralat, setRalat] = useState<string | null>(null);
  const [hargaServer, setHargaServer] = useState<number | null>(null);
  const [gagal, setGagal] = useState(false);
  const [sibuk, setSibuk] = useState(false);
  const borang = useRef<HTMLFormElement>(null);

  const saiz = useMemo(() => {
    const m = new Map<string, { kek: KekSenarai; label: string; priceSen: number }>();
    for (const k of kek) for (const z of k.sizes) m.set(z.id, { kek: k, label: z.label, priceSen: z.priceSen });
    return m;
  }, [kek]);
  const tambahanIkutId = useMemo(() => new Map(tambahan.map((a) => [a.id, a])), [tambahan]);

  // Buang kek atau tambahan yang tidak lagi aktif (dibaca terus dari storan supaya tidak bergantung pada snapshot pelayan).
  useEffect(() => {
    let raw: string | null = null;
    try {
      raw = localStorage.getItem(KUNCI);
    } catch {
      /* storan disekat */
    }
    const s = bacaSenarai(raw);
    const items = s.items.filter((i) => saiz.get(i.sizeId)?.kek.id === i.productId);
    const addons = s.addons.filter((a) => tambahanIkutId.has(a.addonId));
    if (items.length !== s.items.length || addons.length !== s.addons.length) {
      ganti({ ...s, items, addons });
      if (items.length !== s.items.length) setNotis(TIDAK_AKTIF);
    }
    try {
      const t = sessionStorage.getItem(KUNCI_TARIKH);
      if (t) setTarikh(t);
    } catch {
      /* abaikan */
    }
    setDimuat(true);
  }, [saiz, tambahanIkutId, ganti]);

  const baris: (BarisItem & { sizeId: string; image: string | null; slug: string })[] = senarai.items.flatMap((i) => {
    const z = saiz.get(i.sizeId);
    if (!z || z.kek.id !== i.productId) return [];
    return [{
      productId: i.productId, sizeId: i.sizeId, productName: z.kek.name, sizeLabel: z.label, unitPriceSen: z.priceSen, qty: i.qty,
      cakeMessage: i.cakeMessage, leadDays: z.kek.leadDays, image: z.kek.image, slug: z.kek.slug,
    }];
  });
  const barisTambahan: BarisAddon[] = senarai.addons.flatMap((a) => {
    const t = tambahanIkutId.get(a.addonId);
    return t ? [{ addonId: a.addonId, name: t.name, unitPriceSen: t.priceSen, qty: a.qty, ...(a.text ? { text: a.text } : {}) }] : [];
  });
  const kekSen = baris.reduce((t, b) => t + b.unitPriceSen * b.qty, 0);
  const tambahSen = barisTambahan.reduce((t, a) => t + a.unitPriceSen * a.qty, 0);
  const jumlahPaparan = kekSen + tambahSen;
  const jumlah = hargaServer ?? jumlahPaparan;

  // Jalur 14 hari bermula dari tarikh paling awal yang dibenarkan untuk semua kek dalam senarai.
  const awal = tambahHari(hariIni, Math.max(minLeadDays, ...baris.map((b) => b.leadDays)));
  const jalur: HariJalur[] = hari
    .filter((h) => h.tarikh >= awal)
    .slice(0, BIL_HARI)
    .map((h) => ({ tarikh: h.tarikh, status: h.tutup ? 'tutup' : h.jumlahSlot <= 0 ? 'penuh' : 'ada', baki: h.jumlahSlot }));
  const tarikhSah = jalur.find((h) => h.tarikh === tarikh && h.status === 'ada')?.tarikh ?? null;
  const hariDipilih = hari.find((h) => h.tarikh === tarikhSah);
  const slotPapar = slot.map((z) => ({ id: z.id, label: z.label, baki: hariDipilih ? Math.min(hariDipilih.slot[z.id] ?? 0, hariDipilih.jumlahSlot) : 0 }));
  const slotSah = slotPapar.find((z) => z.id === slotId && z.baki > 0) ? slotId : null;
  const slotLabel = slot.find((z) => z.id === slotSah)?.label;

  const mesej = binaMesejWhatsApp({
    ref: '(diberi selepas hantar)', kind: 'LIST', items: baris, addons: barisTambahan, totalSen: jumlah,
    tarikh: tarikhSah ?? undefined, slotLabel, mode, area: mode === 'DELIVERY' ? area : undefined,
    address: mode === 'DELIVERY' ? alamat.trim() || undefined : undefined, name: nama.trim() || undefined,
  });

  const bilaLabel = tarikhSah ? `${tarikhPenuh(tarikhSah)}${slotLabel ? `, ${slotLabel}` : ''}` : 'Pilih tarikh dan masa';

  const ubahSesuatu = () => {
    setHargaServer(null);
    setRalat(null);
  };

  const hantar = async () => {
    setRalat(null);
    setMedan({});
    setGagal(false);
    setSibuk(true);
    const tetingkap = sediaTetingkap();
    try {
      const r = await buatTempahan({
        items: senarai.items, addons: senarai.addons, mode,
        ...(mode === 'DELIVERY' ? { area, address: alamat } : {}),
        date: tarikhSah ?? '', timeSlotId: slotSah ?? '', name: nama, phone: telefon, notes: nota, lamanWeb: perangkap,
        harga: jumlah,
      });
      if (!r.ok) {
        tetingkap.batal();
        if (r.ralat === 'INPUT') {
          setMedan(r.medan ?? {});
          setRalat('Sila semak medan yang bertanda.');
          requestAnimationFrame(() => borang.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
        } else if (r.ralat === 'ITEM_TIDAK_AKTIF' && r.indeks !== undefined) {
          buang(r.indeks);
          setNotis(TIDAK_AKTIF);
        } else {
          setRalat(mesejRalat(r.ralat));
          if (r.ralat === 'HAD_KADAR') setGagal(true);
          if (r.ralat === 'SLOT_PENUH') setSlotId(null);
          if (r.ralat === 'HARI_PENUH' || r.ralat === 'HARI_TUTUP' || r.ralat === 'TERLALU_AWAL') setTarikh(null);
          router.refresh();
        }
        return;
      }
      if (r.hargaBerubah) {
        tetingkap.batal();
        setHargaServer(r.totalSen);
        setRalat(`Harga dikemas kini. Jumlah baru ${formatRM(r.totalSen)}. Tekan Hantar sekali lagi untuk teruskan.`);
        return;
      }
      tetingkap.pergi(r.waUrl);
      kosongkan();
      try {
        sessionStorage.removeItem(KUNCI_TARIKH);
      } catch {
        /* abaikan */
      }
      router.push(`/tempahan/${r.ref}?t=${r.token}`);
    } catch {
      tetingkap.batal();
      setRalat('Tak dapat simpan tempahan sekarang. Anda masih boleh tempah terus di WhatsApp.');
      setGagal(true);
    } finally {
      setSibuk(false);
    }
  };

  const medanProps = (kunci: string, id: string) => ({
    id,
    'aria-invalid': medan[kunci] ? (true as const) : undefined,
    'aria-describedby': medan[kunci] ? `ralat-${id}` : undefined,
  });
  const ralatMedan = (kunci: string, id: string) =>
    medan[kunci] ? <p id={`ralat-${id}`} className="mt-1.5 text-[13.5px] text-yk-error">{medan[kunci]}</p> : null;

  if (!dimuat) {
    return <div className="min-h-[60vh]" aria-busy="true" />;
  }

  const kosong = baris.length === 0;

  return (
    <div className="pb-36 lg:pb-24 lg:max-w-[1240px] lg:mx-auto lg:px-10 lg:pt-9">
      <div className="px-4 pt-4 lg:p-0">
        <h1 className="text-[40px] leading-none lg:text-[56px]">Senarai tempahan</h1>
        <p className="text-yk-muted text-sm mt-1.5 lg:text-base lg:mt-2">
          Isi butiran, kemudian hantar melalui WhatsApp. Bayaran dan caj penghantaran disahkan di WhatsApp.
        </p>
      </div>
      {notis && (
        <p role="status" className="mx-4 lg:mx-0 mt-3 px-3.5 py-2.5 border border-yk-line bg-yk-panel text-sm text-yk-warn">{notis}</p>
      )}

      {kosong ? (
        <div className="mx-4 lg:mx-0 mt-5 py-8 px-6 border border-dashed border-yk-line-strong text-center">
          <p className="font-serif text-2xl">Senarai kosong.</p>
          <p className="text-yk-muted text-sm mt-1.5">Pilih kek dari koleksi, kemudian tekan Tambah ke senarai.</p>
          <Link className="b-btn mt-4 w-full lg:w-auto" href="/koleksi">Lihat koleksi</Link>
        </div>
      ) : (
        <form
          ref={borang}
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (!sibuk) void hantar();
          }}
          onChange={ubahSesuatu}
          className="lg:flex lg:flex-wrap lg:gap-10 lg:mt-7 lg:items-start"
        >
          <div className="lg:flex-[999_1_560px] lg:min-w-0 lg:flex lg:flex-col lg:gap-9">
            <section aria-labelledby="c1" className="px-4 pt-5 lg:p-0">
              <h2 id="c1" className="text-2xl lg:text-[28px]"><span className="hidden lg:inline">1. </span>Kek</h2>
              <ul aria-label="Kek dalam senarai" className="list-none p-0 m-0 mt-2 lg:mt-3.5 border-t border-yk-line">
                {baris.map((b, i) => (
                  <li key={`${b.sizeId}-${b.cakeMessage ?? ''}`} className="flex gap-3 lg:gap-4 lg:items-center py-3.5 lg:py-4 border-b border-yk-line">
                    <div className="relative w-[72px] h-[88px] lg:w-[84px] lg:h-[100px] flex-none bg-[#561920]">
                      {b.image && <Image src={b.image} alt="" fill sizes="84px" className="object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-[19px] lg:text-[22px] leading-[1.15]">
                        <Link href={`/kek/${b.slug}`} className="no-underline">{b.productName}</Link>
                      </p>
                      <p className="text-[13px] lg:text-sm text-yk-muted">{b.sizeLabel}</p>
                      {b.cakeMessage && <p className="text-[12.5px] lg:text-[13.5px] text-yk-cream-2">Tulisan: {b.cakeMessage}</p>}
                      <div className="flex justify-between items-center gap-3 mt-1.5">
                        <div className="flex items-center border border-yk-line-strong">
                          <button type="button" className="w-10 h-10 lg:w-9 lg:h-9 bg-transparent border-0 text-lg cursor-pointer disabled:opacity-40" aria-label={`Kurangkan ${b.productName}`} disabled={b.qty <= HAD.qtyMin} onClick={() => { ubah(i, b.qty - 1); ubahSesuatu(); }}>
                            &#8722;
                          </button>
                          <span className="min-w-[24px] text-center">{b.qty}</span>
                          <button type="button" className="w-10 h-10 lg:w-9 lg:h-9 bg-transparent border-0 text-lg cursor-pointer disabled:opacity-40" aria-label={`Tambah ${b.productName}`} disabled={b.qty >= HAD.qtyMaks} onClick={() => { ubah(i, b.qty + 1); ubahSesuatu(); }}>
                            +
                          </button>
                        </div>
                        <button type="button" className="bg-transparent border-0 p-0 text-[13.5px] text-yk-cream-2 underline cursor-pointer min-h-10" onClick={() => { buang(i); ubahSesuatu(); }}>
                          Buang<span className="sr-only"> {b.productName}</span>
                        </button>
                        <span className="font-semibold lg:w-[100px] lg:text-right">{formatRM(b.unitPriceSen * b.qty)}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <Link href="/koleksi" className="inline-block mt-2.5 lg:mt-3 font-semibold text-sm lg:text-base underline-offset-[5px]">Tambah kek lain</Link>
              <TambahSekali tambahan={tambahan} pilihan={senarai.addons} onUbah={(id, q, t) => { ubahAddon(id, q, t); ubahSesuatu(); }} />
            </section>

            <section aria-labelledby="c2" className="pt-6 lg:pt-0">
              <h2 id="c2" className="text-2xl lg:text-[28px] px-4 lg:px-0"><span className="hidden lg:inline">2. Bila dan bagaimana</span><span className="lg:hidden">Cara terima</span></h2>
              <div role="group" aria-label="Cara terima" className="grid grid-cols-2 gap-2 px-4 mt-2.5 lg:px-0 lg:mt-3.5">
                <button type="button" className="b-pill" aria-pressed={mode === 'PICKUP'} onClick={() => { setMode('PICKUP'); ubahSesuatu(); }}>
                  Ambil sendiri
                  <span className="block text-xs lg:text-[13px] text-yk-muted"><span className="lg:hidden">Di Kuantan</span><span className="hidden lg:inline"><TeksTbc teks={alamatAmbil} /></span></span>
                </button>
                <button type="button" className="b-pill" aria-pressed={mode === 'DELIVERY'} onClick={() => { setMode('DELIVERY'); ubahSesuatu(); }}>
                  Penghantaran
                  <span className="block text-xs lg:text-[13px] text-yk-muted">{kawasan.join(' dan ')} sahaja</span>
                </button>
              </div>
              {mode === 'DELIVERY' && (
                <div className="px-4 lg:px-0 mt-2.5 lg:mt-3.5 lg:grid lg:grid-cols-[220px_1fr] lg:gap-3">
                  <div>
                    <span className="hidden lg:block b-lbl">Kawasan</span>
                    <div role="group" aria-label="Kawasan" aria-describedby={medan.area ? 'ralat-kawasan' : undefined} className="grid grid-cols-2 gap-2 lg:flex lg:gap-1.5">
                      {kawasan.map((k) => (
                        <button key={k} type="button" className="b-pill text-center lg:flex-1 lg:!min-h-[50px]" aria-pressed={area === k} onClick={() => { setArea(k); ubahSesuatu(); }}>
                          {k}
                        </button>
                      ))}
                    </div>
                    {ralatMedan('area', 'kawasan')}
                  </div>
                  <div className="mt-2.5 lg:mt-0">
                    <label className="b-lbl" htmlFor="alamat">Alamat penuh</label>
                    <input {...medanProps('address', 'alamat')} className="b-in" placeholder="No. rumah, jalan, taman" autoComplete="street-address" value={alamat} onChange={(e) => setAlamat(e.target.value)} maxLength={300} />
                    {ralatMedan('address', 'alamat')}
                  </div>
                  <p className="text-[12.5px] lg:text-[13.5px] text-yk-muted mt-1 lg:col-span-2">Caj penghantaran dimaklumkan di WhatsApp.</p>
                </div>
              )}
              <div className="pt-6 lg:pt-0">
                <JalurTarikh hari={jalur} pilih={tarikhSah} onPilih={(t) => { setTarikh(t); ubahSesuatu(); }} />
                {medan.date && <p className="px-4 lg:px-0 mt-1.5 text-[13.5px] text-yk-error">{medan.date}</p>}
                <PilihSlot slot={slotPapar} pilih={slotSah} onPilih={(id) => { setSlotId(id); ubahSesuatu(); }} ralat={tarikhSah ? medan.timeSlotId : medan.timeSlotId && 'Pilih tarikh dahulu'} />
              </div>
            </section>

            <section aria-labelledby="c3" className="px-4 pt-6 lg:p-0">
              <h2 id="c3" className="text-2xl lg:text-[28px]"><span className="hidden lg:inline">3. </span>Maklumat anda</h2>
              <div className="lg:grid lg:grid-cols-2 lg:gap-3 mt-2.5 lg:mt-3.5">
                <div>
                  <label className="b-lbl" htmlFor="nama">Nama</label>
                  <input {...medanProps('name', 'nama')} className="b-in" autoComplete="name" maxLength={60} value={nama} onChange={(e) => setNama(e.target.value)} />
                  {ralatMedan('name', 'nama')}
                </div>
                <div className="mt-3 lg:mt-0">
                  <label className="b-lbl" htmlFor="telefon">Nombor telefon</label>
                  <input {...medanProps('phone', 'telefon')} className="b-in" type="tel" inputMode="tel" autoComplete="tel" placeholder="Contoh: 012 345 6789" maxLength={30} value={telefon} onChange={(e) => setTelefon(e.target.value)} />
                  {ralatMedan('phone', 'telefon')}
                </div>
              </div>
              <label className="b-lbl mt-3" htmlFor="nota">Nota untuk kami (pilihan)</label>
              <textarea id="nota" className="b-in" maxLength={HAD.nota} placeholder="Contoh: tema warna, masa majlis" value={nota} onChange={(e) => setNota(e.target.value)} />
              <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
                <label htmlFor="laman-web">Laman web</label>
                <input id="laman-web" tabIndex={-1} autoComplete="off" value={perangkap} onChange={(e) => setPerangkap(e.target.value)} />
              </div>
            </section>
          </div>

          <aside aria-label="Ringkasan" className="mx-4 mt-6 lg:m-0 lg:flex-[1_1_360px] lg:max-w-[420px] lg:border lg:border-yk-line lg:bg-yk-panel lg:p-6 lg:sticky lg:top-6">
            <h2 className="hidden lg:block text-[26px]">Ringkasan</h2>
            <p className="hidden lg:block text-sm text-yk-cream-2 mt-2">{bilaLabel}</p>
            <dl className="hidden lg:grid gap-2 mt-4 text-[15px]">
              <div className="flex justify-between"><dt className="text-yk-muted">Kek</dt><dd>{formatRM(kekSen)}</dd></div>
              {tambahSen > 0 && <div className="flex justify-between"><dt className="text-yk-muted">Tambahan</dt><dd>{formatRM(tambahSen)}</dd></div>}
              <div className="flex justify-between items-baseline"><dt className="text-yk-muted">Anggaran jumlah</dt><dd className="font-serif text-[26px] leading-none" data-testid="jumlah">{formatRM(jumlah)}</dd></div>
              <div className="flex justify-between"><dt className="text-yk-muted">Penghantaran</dt><dd>{mode === 'PICKUP' ? 'Ambil sendiri, tiada caj' : 'Dimaklumkan di WhatsApp'}</dd></div>
            </dl>
            <p className="b-lbl lg:mt-[18px]" id="lbl-pratonton">Mesej yang akan dihantar</p>
            <pre
              data-testid="pratonton"
              aria-labelledby="lbl-pratonton"
              tabIndex={0}
              className="m-0 whitespace-pre-wrap font-sans text-[13px] lg:text-[13.5px] leading-normal bg-yk-panel lg:bg-yk-bg border border-yk-line p-3 lg:max-h-[260px] lg:overflow-y-auto text-[#ECDDD3]"
            >
              {mesej}
            </pre>
            <div aria-live="polite">
              {ralat && (
                <p role="alert" className={`text-[13.5px] lg:text-sm mt-2.5 lg:mt-3 ${hargaServer !== null ? 'text-yk-warn' : 'text-yk-error'}`}>{ralat}</p>
              )}
            </div>
            {gagal && (
              <a className="b-btn b-line w-full mt-2.5" href={waUrl(whatsapp, mesej)} target="_blank" rel="noopener noreferrer">
                <IkonWhatsApp /> <span>WhatsApp terus</span>
              </a>
            )}
            <div className="fixed inset-x-0 bottom-0 z-40 flex gap-3 items-center px-4 pt-2.5 pb-4 bg-[rgba(60,13,19,.97)] border-t border-yk-line lg:static lg:z-auto lg:block lg:p-0 lg:mt-4 lg:bg-transparent lg:border-0">
              <div className="lg:hidden">
                <span className="block text-xs text-yk-muted">Anggaran</span>
                <span className="font-serif text-[26px] leading-none" data-testid="jumlah">{formatRM(jumlah)}</span>
              </div>
              <button type="submit" className="b-btn yk-pulse relative flex-1 !px-2.5 lg:w-full" disabled={sibuk}>
                <IkonWhatsApp />
                <span>{sibuk ? 'Menyimpan…' : <>Hantar<span className="sr-only lg:not-sr-only"> tempahan</span> di WhatsApp</>}</span>
              </button>
            </div>
            <p className="text-[12.5px] text-[#C0948F] mt-3">Rekaan dan warna mungkin tidak 100% sama dengan gambar, kerana setiap kek dibuat dengan tangan.</p>
          </aside>
        </form>
      )}
    </div>
  );
}
