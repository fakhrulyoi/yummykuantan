import Link from 'next/link';
import { JadualTempahan } from '@/components/admin/JadualTempahan';
import { TajukAdmin } from '@/components/admin/TajukAdmin';
import { requireAdmin } from '@/lib/auth/admin';
import { ringkasanPapan } from '@/lib/data/adminTempahan';

export const metadata = { title: 'Papan pemuka' };

export default async function PapanPemuka() {
  const a = await requireAdmin();
  const r = await ringkasanPapan();
  const kpi = [
    { id: 'baru', label: 'Baru hari ini', nilai: r.baru, nota: 'Tempahan yang masuk dari laman hari ini', href: '/admin/tempahan' },
    { id: 'bayar', label: 'Menunggu bayaran', nilai: r.menungguBayar, nota: 'Perlu disemak di WhatsApp', href: '/admin/tempahan?status=MENUNGGU_BAYARAN' },
    { id: 'dekat', label: '7 hari akan datang', nilai: r.dekat.length, nota: 'Kek yang perlu disediakan', href: '#dekat' },
    { id: 'cepat', label: 'Tempahan cepat belum lengkap', nilai: r.cepat, nota: 'Perlu tarikh dan nama', href: '#cepat' },
  ];
  return (
    <>
      <TajukAdmin tajuk="Papan pemuka" sub={`Selamat datang, ${a.name}. Ini ringkasan perniagaan anda.`} />
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
        <JadualTempahan rows={r.cepatBaru} label="Tempahan cepat belum lengkap" kosong="Semua tempahan cepat sudah ada tarikh." />
      </div>
    </>
  );
}
