import { SenaraiSoalan } from '@/components/admin/SenaraiSoalan';
import { TajukAdmin } from '@/components/admin/TajukAdmin';
import { requireAdmin } from '@/lib/auth/admin';
import { senaraiSoalanAdmin } from '@/lib/data/soalanAdmin';

export const metadata = { title: 'Soalan lazim' };

export default async function HalamanSoalan() {
  const a = await requireAdmin();
  const soalan = await senaraiSoalanAdmin();
  return (
    <>
      <TajukAdmin tajuk="Soalan lazim" sub="Ubah, susun, sembunyi dan tambah soalan yang dipapar di laman utama." />
      <SenaraiSoalan soalan={soalan} pemilik={a.role === 'OWNER'} />
    </>
  );
}
