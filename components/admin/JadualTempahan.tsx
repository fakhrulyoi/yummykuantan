import Link from 'next/link';
import { LABEL_STATUS, WARNA_STATUS, type BarisAdmin } from '@/lib/data/adminTempahan';
import { tarikhPendek } from '@/lib/tempahan/tarikh';
import { formatRM } from '@/lib/tempahan/wang';

export function LencanaStatus({ status }: { status: BarisAdmin['status'] }) {
  const w = WARNA_STATUS[status];
  return <span className="ad-badge" style={{ background: w.bg, color: w.fg }}>{LABEL_STATUS[status]}</span>;
}

const tarikh = (d: string | null) => {
  if (!d) return 'Belum diisi';
  const p = tarikhPendek(d);
  return `${p.hari} ${p.tarikh} ${p.bulan}`;
};

/** Jadual tempahan. Phone: kad bertindan. Desktop: grid ikut design Admin_Tempahan. */
export function JadualTempahan({ rows, label, kosong }: { rows: BarisAdmin[]; label: string; kosong: React.ReactNode }) {
  return (
    <section className="ad-card overflow-hidden" aria-label={label}>
      <div className="hidden lg:grid ad-th grid-cols-[100px_1fr_1.4fr_110px_100px_160px] gap-3 px-4 py-2.5 bg-[#FBF8F4]">
        <span>No.</span><span>Pelanggan</span><span>Kek</span><span>Tarikh</span><span>Jumlah</span><span>Status</span>
      </div>
      {rows.length === 0 ? (
        <div className="px-4 py-8 text-center text-[#6B5B4E]">{kosong}</div>
      ) : (
        rows.map((r) => (
          <Link
            key={r.id}
            href={`/admin/tempahan/${r.id}`}
            className="ad-row !no-underline grid-cols-[1fr_auto] lg:grid-cols-[100px_1fr_1.4fr_110px_100px_160px]"
          >
            <span className="font-bold">
              {r.ref}
              {r.kind === 'QUICK' && <span className="block text-xs font-medium text-[#6B5B4E]">Tempahan cepat</span>}
            </span>
            <span className="lg:order-none order-last col-span-2 lg:col-span-1 text-[13.5px] lg:text-sm">
              <span className="lg:hidden text-[#6B5B4E]">{r.kek} · </span>
              {r.customerName ?? <span className="text-[#6B5B4E]">Belum diisi</span>}
            </span>
            <span className="hidden lg:block truncate">{r.kek}</span>
            <span className="hidden lg:block">{tarikh(r.date)}</span>
            <span className="hidden lg:block">{formatRM(r.totalSen + (r.deliveryFeeSen ?? 0))}</span>
            <span className="justify-self-end lg:justify-self-start"><LencanaStatus status={r.status} /></span>
          </Link>
        ))
      )}
    </section>
  );
}
