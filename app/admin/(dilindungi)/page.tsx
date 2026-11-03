import { TajukAdmin } from '@/components/admin/TajukAdmin';
import { requireAdmin } from '@/lib/auth/admin';

export const metadata = { title: 'Papan pemuka' };

export default async function PapanPemuka() {
  const a = await requireAdmin();
  return <TajukAdmin tajuk="Papan pemuka" sub={`Selamat datang, ${a.name}. Ini ringkasan perniagaan anda.`} />;
}
