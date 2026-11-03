import Link from 'next/link';
import { JadualTempahan } from '@/components/admin/JadualTempahan';
import { TajukAdmin } from '@/components/admin/TajukAdmin';
import { requireAdmin } from '@/lib/auth/admin';
import { LABEL_STATUS, senaraiTempahanAdmin } from '@/lib/data/adminTempahan';
import { STATUS_TEMPAHAN } from '@/lib/tempahan/jenis';

export const metadata = { title: 'Tempahan' };

type Cari = { q?: string; status?: string; semua?: string };

export default async function HalamanTempahan({ searchParams }: { searchParams: Promise<Cari> }) {
  await requireAdmin();
  const sp = await searchParams;
  const q = typeof sp.q === 'string' ? sp.q : '';
  const semua = sp.semua === '1';
  const { rows, bil, jumlah, status, tersembunyi, holdHours } = await senaraiTempahanAdmin({ q, status: sp.status, semua });
  const pautan = (ubah: Partial<Cari>) => {
    const p = new URLSearchParams();
    const v = { q, status: status ?? '', semua: semua ? '1' : '', ...ubah };
    for (const [k, x] of Object.entries(v)) if (x) p.set(k, x);
    const t = p.toString();
    return `/admin/tempahan${t ? `?${t}` : ''}`;
  };

  return (
    <>
      <TajukAdmin tajuk="Tempahan" sub="Semua tempahan dari laman. Tekan satu untuk lihat butiran.">
        <form action="/admin/tempahan" role="search" className="flex gap-2">
          {status && <input type="hidden" name="status" value={status} />}
          {semua && <input type="hidden" name="semua" value="1" />}
          <label htmlFor="cari" className="sr-only">Cari tempahan</label>
          <input id="cari" name="q" type="search" defaultValue={q} className="ad-in lg:!w-[300px]" placeholder="Rujukan, nama atau telefon" />
        </form>
      </TajukAdmin>

      <nav aria-label="Tapis status" className="flex gap-1 overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0 lg:flex-wrap">
        <Link href={pautan({ status: '' })} className="ad-tab !no-underline inline-flex items-center flex-none" aria-current={!status ? 'page' : undefined}>
          Semua <span className="opacity-70 ml-1">{jumlah}</span>
        </Link>
        {STATUS_TEMPAHAN.map((k) => (
          <Link key={k} href={pautan({ status: k })} className="ad-tab !no-underline inline-flex items-center flex-none" aria-current={status === k ? 'page' : undefined}>
            {LABEL_STATUS[k]} <span className="opacity-70 ml-1">{bil[k]}</span>
          </Link>
        ))}
      </nav>

      <JadualTempahan
        rows={rows}
        label="Senarai tempahan"
        kosong={q ? <>Tiada tempahan sepadan dengan &ldquo;{q}&rdquo;.</> : status ? 'Tiada tempahan dengan status ini.' : 'Belum ada tempahan. Tempahan baru muncul di sini bila pelanggan tekan Tempah di laman.'}
      />

      <p className="text-[13px] text-[#6B5B4E]">
        {semua ? (
          <Link href={pautan({ semua: '' })}>Sembunyikan tempahan WhatsApp lama</Link>
        ) : tersembunyi > 0 ? (
          <>
            {tersembunyi} tempahan &ldquo;Baru di WhatsApp&rdquo; lebih {holdHours} jam disembunyikan (mungkin pelanggan tidak hantar mesej).{' '}
            <Link href={pautan({ semua: '1' })} className="font-semibold">Tunjuk semua</Link>
          </>
        ) : null}
      </p>
    </>
  );
}
