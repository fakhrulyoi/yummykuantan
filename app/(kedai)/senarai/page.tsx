import type { Metadata } from 'next';
import { SenaraiTempahan } from '@/components/kedai/SenaraiTempahan';
import { bakiTarikh } from '@/lib/data/kapasiti';
import { bacaKandungan } from '@/lib/data/kandungan';
import { produkAktif, tambahanAktif } from '@/lib/data/produk';
import { bacaTetapan } from '@/lib/data/tetapan';
import { hariIniMYT, tambahHari } from '@/lib/tempahan/tarikh';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Senarai tempahan', robots: { index: false } };

export default async function HalamanSenarai() {
  const now = new Date();
  const [produk, tambahan, tetapan, hubungi] = await Promise.all([produkAktif(), tambahanAktif(), bacaTetapan(), bacaKandungan('hubungi')]);
  const hariIni = hariIniMYT(now);
  // Cukup hari untuk kek yang perlukan tempah paling awal, ditambah 14 hari jalur.
  const lebih = Math.max(0, ...produk.map((p) => p.leadDays - tetapan.minLeadDays));
  const mula = tambahHari(hariIni, tetapan.minLeadDays);
  const { hari, slot } = await bakiTarikh(Array.from({ length: lebih + 14 }, (_, i) => tambahHari(mula, i)), now);
  return (
    <SenaraiTempahan
      kek={produk.map((p) => ({ id: p.id, slug: p.slug, name: p.name, image: p.images[0]?.url ?? null, leadDays: p.leadDays, sizes: p.sizes }))}
      tambahan={tambahan.map((a) => ({ id: a.id, name: a.name, note: a.note, priceSen: a.priceSen, textKind: a.textKind }))}
      hari={hari.map((h) => ({ tarikh: h.tarikh, tutup: h.tutup, jumlahSlot: h.jumlahSlot, slot: h.slot }))}
      slot={slot.map((z) => ({ id: z.id, label: z.label }))}
      hariIni={hariIni}
      minLeadDays={tetapan.minLeadDays}
      kawasan={tetapan.deliveryAreas}
      alamatAmbil={`${hubungi.alamat}, Kuantan`}
      whatsapp={tetapan.whatsappNumber}
    />
  );
}
