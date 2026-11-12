import Link from 'next/link';
import { JadualTempahan, LencanaStatus } from '@/components/admin/JadualTempahan';
import { LangkahStatus } from '@/components/admin/LangkahStatus';
import { TajukAdmin } from '@/components/admin/TajukAdmin';
import { requireAdmin } from '@/lib/auth/admin';
import { ringkasanPapan } from '@/lib/data/adminTempahan';
import { waUrl } from '@/lib/tempahan/mesej';
import { hariIniMYT, tambahHari, tarikhPendek } from '@/lib/tempahan/tarikh';

export const metadata = { title: 'Papan pemuka' };

export default async function PapanPemuka() {
  const a = await requireAdmin();
  const r = await ringkasanPapan();
  const kpi = [
    { id: 'baru', label: 'Baru hari ini', nilai: r.baru, nota: 'Tempahan yang masuk dari laman hari ini', href: '/admin/tempahan' },
    { id: 'bayar', label: 'Menunggu bayaran', nilai: r.menungguBayar, nota: 'Perlu disemak di WhatsApp', href: '/admin/tempahan?status=MENUNGGU_BAYARAN' },
    { id: 'dekat', label: '7 hari akan datang', nilai: r.dekat.length, nota: 'Kek yang perlu disediakan', href: '#dekat' },
    { id: 'cepat', label: 'Tempahan cepat belum lengkap', nilai: r.cepat, nota: 'Perlu nama dan telefon pelanggan', href: '#cepat' },
  ];
  const hariIni = hariIniMYT(new Date());
  const esok = tambahHari(hariIni, 1);
  const harian = r.dekat.filter((o) => o.date === hariIni || o.date === esok);
  return (
    <>
      <TajukAdmin tajuk="Papan pemuka" sub={`Selamat datang, ${a.name}. Ini ringkasan perniagaan anda.`} />

      <section aria-labelledby="h-harian">
        <h2 id="h-harian" className="text-base font-bold mb-2">Hari ini dan esok</h2>
        {harian.length === 0 ? (
          <p className="ad-card px-4 py-5 text-[#6B5B4E]">Tiada kek untuk disiapkan hari ini atau esok.</p>
        ) : (
          <ul className="list-none p-0 m-0 grid gap-2.5 lg:grid-cols-2" aria-label="Tempahan hari ini dan esok">
            {harian.map((o) => {
              const p = tarikhPendek(o.date!);
              return (
                <li key={o.id} className="ad-card p-4 grid gap-2.5">
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-[#8C6A33]">{o.date === hariIni ? 'Hari ini' : 'Esok'}, {p.hari} {p.tarikh} {p.bulan}{o.slotLabel ? `, ${o.slotLabel}` : ''}</p>
                      <Link href={`/admin/tempahan/${o.id}`} className="block font-bold text-[16px] mt-0.5 truncate">{o.customerName ?? 'Tanpa nama'} · {o.ref}</Link>
                      <p className="text-[14px] text-[#4F4337] mt-0.5">{o.kek}</p>
                      <p className="text-[13px] text-[#6B5B4E]">{o.mode === 'DELIVERY' ? 'Hantar' : o.mode === 'PICKUP' ? 'Ambil sendiri' : 'Cara belum diisi'}</p>
                    </div>
                    <LencanaStatus status={o.status} />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <LangkahStatus id={o.id} status={o.status} mode={o.mode} rujukan={o.ref} />
                    {o.phone && (
                      <a className="ad-btn ad-btn2 !min-h-10 !px-3 !text-[13.5px]" href={waUrl(o.phone, `Salam, berkenaan tempahan ${o.ref}.`)} target="_blank" rel="noopener noreferrer">
                        WhatsApp
                      </a>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
      <div className="grid grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-3 lg:gap-3.5">
        {kpi.map((k) => (
          <Link key={k.id} href={k.href} className="ad-card p-4 lg:p-[18px] !no-underline hover:border-[#C9B9A8]">
            <p className="text-[13px] text-[#6B5B4E]">{k.label}</p>
            <p className="text-[28px] lg:text-[30px] font-bold mt-1 tracking-[-0.01em]" data-testid={`kpi-${k.id}`}>{k.nilai}</p>
            <p className="text-[12.5px] lg:text-[13px] text-[#6B5B4E] mt-0.5">{k.nota}</p>
          </Link>
        ))}
      </div>

      <div id="dekat" className="scroll-mt-4">
        <div className="flex justify-between items-baseline mb-2">
          <h2 className="text-base font-bold">Tempahan 7 hari akan datang</h2>
          <Link href="/admin/tempahan" className="text-[13.5px] font-semibold">Semua tempahan</Link>
        </div>
        <JadualTempahan rows={r.dekat} label="Tempahan 7 hari akan datang" kosong="Tiada tempahan untuk 7 hari akan datang." />
      </div>

      <div id="cepat" className="scroll-mt-4">
        <h2 className="text-base font-bold mb-2">Tempahan cepat belum lengkap</h2>
        <JadualTempahan rows={r.cepatBaru} label="Tempahan cepat belum lengkap" kosong="Semua tempahan cepat sudah lengkap." />
      </div>
    </>
  );
}
