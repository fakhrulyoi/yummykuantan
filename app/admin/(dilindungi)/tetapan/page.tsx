import { asc, gte } from 'drizzle-orm';
import { BorangSlot } from '@/components/admin/BorangSlot';
import { BorangTambahan } from '@/components/admin/BorangTambahan';
import { BorangUmum } from '@/components/admin/BorangTetapan';
import { HariTutup } from '@/components/admin/HariTutup';
import { TajukAdmin } from '@/components/admin/TajukAdmin';
import { requireAdmin } from '@/lib/auth/admin';
import { db } from '@/lib/data/db';
import * as s from '@/lib/data/skema';
import { bacaTetapan, senaraiSlot } from '@/lib/data/tetapan';
import { hariIniMYT } from '@/lib/tempahan/tarikh';
import { simpanTetapan } from './actions';

export const metadata = { title: 'Tetapan' };

export default async function HalamanTetapan() {
  const a = await requireAdmin();
  const boleh = a.role === 'OWNER';
  const [t, slot, tutup, tambahan] = await Promise.all([
    bacaTetapan(),
    senaraiSlot(),
    db.select().from(s.closedDate).where(gte(s.closedDate.date, hariIniMYT(new Date()))).orderBy(asc(s.closedDate.date)),
    db.select().from(s.addon).orderBy(asc(s.addon.sortOrder)),
  ]);
  return (
    <>
      <TajukAdmin tajuk="Tetapan" sub={boleh ? 'Peraturan tempahan, slot masa, hari tutup dan tambahan.' : 'Dibaca sahaja. Hanya pemilik boleh ubah tetapan.'} />
      {!boleh && <p role="note" className="ad-card px-4 py-3 text-[13.5px] bg-[#FFF8EA]">Anda log masuk sebagai staf. Tetapan dibaca sahaja.</p>}
      <BorangUmum awal={{ minLeadDays: t.minLeadDays, dailyCapacity: t.dailyCapacity, holdHours: t.holdHours, whatsappNumber: t.whatsappNumber, deliveryFees: t.deliveryFees }} kawasan={t.deliveryAreas} bolehUbah={boleh} simpan={simpanTetapan} />
      <BorangSlot slot={slot.map((z) => ({ id: z.id, label: z.label, startsAt: z.startsAt, endsAt: z.endsAt, capacity: z.capacity, active: z.active }))} bolehUbah={boleh} />
      <HariTutup hari={tutup} bolehUbah={boleh} />
      <BorangTambahan tambahan={tambahan.map((x) => ({ id: x.id, name: x.name, note: x.note, priceSen: x.priceSen, textKind: x.textKind, active: x.active }))} bolehUbah={boleh} />
    </>
  );
}
