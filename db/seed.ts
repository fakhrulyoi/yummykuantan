import katalog from './seed-data/katalog.json';
import type { Db } from '@/lib/data/db';
import * as s from '@/lib/data/skema';
import { urlGambarMula } from './gambar-mula';

const sen = (rm: number) => Math.round(rm * 100);
const slug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const KANDUNGAN_MULA = {
  hero: {
    tajuk: 'Kek yang diingat lama selepas majlis.',
    ayat: 'Kek batik, brownies, Italian cake dan kek kahwin. Dibakar ikut tempahan di dapur kami, untuk Kuantan dan Pekan.',
    gambar: [
      { url: '/seed/04_02.jpg', nama: 'Italian Cake' },
      { url: '/seed/09_01.jpg', nama: '2 Tier Wedding Cake' },
      { url: '/seed/01_01.jpg', nama: 'Kekbatik Indulgence Cheese' },
    ],
  },
  hubungi: {
    whatsapp: '601123023447',
    whatsappPapar: '+60 11-2302 3447',
    instagram: 'yummykuantan',
    tiktok: 'yummykuantan',
    alamat: '[Alamat dapur dan pin Google Maps]',
    waktu: '[Hari dan jam operasi]',
    kawasan: 'Kuantan dan Pekan',
  },
  footer: {
    ayat: 'Kek tempahan dari dapur kami di Kuantan. Tempah di WhatsApp, ambil sendiri atau kami hantar.',
  },
  waTemplates: {
    BARU_WA: 'Salam, terima kasih kerana menempah. Tempahan {ref} sudah kami terima. Kami semak slot dan maklumkan semula.',
    MENUNGGU_BAYARAN: 'Salam, tempahan {ref} sudah disahkan. Jumlah {jumlah}. {caraBayar}',
    DISAHKAN: 'Salam, bayaran untuk {ref} sudah diterima. Terima kasih.',
    DALAM_PENYEDIAAN: 'Salam, kek untuk tempahan {ref} sedang disediakan.',
    SEDIA_DIAMBIL: 'Salam, kek untuk tempahan {ref} sudah siap dan sedia diambil.',
    DALAM_PENGHANTARAN: 'Salam, kek untuk tempahan {ref} dalam perjalanan.',
    SELESAI: 'Salam, terima kasih kerana memilih Yummy Kuantan. Semoga majlis anda meriah.',
    DIBATALKAN: 'Salam, tempahan {ref} telah dibatalkan.',
    caraBayar: '[Cara bayar: pindahan bank atau DuitNow QR]',
  },
} as const;

export async function seedDb(db: Db): Promise<void> {
  await db.transaction(async (tx) => {
    const kat = await tx
      .insert(s.category)
      .values(katalog.kategori.map((name, i) => ({ name, slug: slug(name), sortOrder: i })))
      .returning();
    const idKat = new Map(kat.map((k) => [k.name, k.id]));

    for (const p of katalog.produk) {
      const kahwin = p.kategori === 'Kek kahwin';
      const [row] = await tx
        .insert(s.product)
        .values({
          slug: p.slug,
          name: p.nama,
          categoryId: idKat.get(p.kategori)!,
          description: p.penerangan,
          leadDays: kahwin ? 7 : 3,
          active: true,
          onTable: p.meja != null,
          tablePosition: p.meja,
          allowDesign: p.reka,
          allowMessage: true,
          popularity: p.popular,
          tableImageUrl: p.gambarMeja ? await urlGambarMula(p.gambarMeja, 'meja') : null,
          publishedAt: new Date(),
        })
        .returning({ id: s.product.id });
      await tx.insert(s.productSize).values(
        p.saiz.map((z, i) => ({ productId: row.id, label: z.label, priceSen: sen(z.harga), sortOrder: i })),
      );
      const imgs = await Promise.all(p.gambar.map((f) => urlGambarMula(f, 'produk')));
      await tx.insert(s.productImage).values(
        imgs.map((url, i) => ({ productId: row.id, url, alt: i === 0 ? p.nama : `${p.nama}, gambar ${i + 1}`, sortOrder: i })),
      );
    }

    await tx.insert(s.settings).values({ id: 1, minLeadDays: 3, dailyCapacity: 12, holdHours: 48, whatsappNumber: '601123023447' });
    await tx.insert(s.timeSlot).values([
      { label: '10:00 hingga 12:00 pagi', startsAt: '10:00', endsAt: '12:00', capacity: 3, sortOrder: 0 },
      { label: '2:00 hingga 4:00 petang', startsAt: '14:00', endsAt: '16:00', capacity: 2, sortOrder: 1 },
      { label: '4:00 hingga 6:00 petang', startsAt: '16:00', endsAt: '18:00', capacity: 2, sortOrder: 2 },
    ]);
    await tx.insert(s.addon).values([
      { name: 'Lilin set 3 batang', note: 'Lilin putih panjang', priceSen: 600, textKind: 'NONE', sortOrder: 0 },
      { name: 'Lilin nombor', note: 'Emas, satu nombor setiap batang', priceSen: 500, textKind: 'NUMBER', sortOrder: 1 },
      { name: 'Kad ucapan', note: 'Kami tulis tangan ucapan anda', priceSen: 300, textKind: 'MESSAGE', sortOrder: 2 },
      { name: 'Pisau kek dan piring kertas', note: 'Set 10 piring', priceSen: 400, textKind: 'NONE', sortOrder: 3 },
      { name: 'Beg kertas hadiah', note: 'Untuk dibawa sebagai hadiah', priceSen: 400, textKind: 'NONE', sortOrder: 4 },
    ]);
    await tx.insert(s.faq).values(
      katalog.soalan.map((f, i) => ({
        question: f.soalan,
        answer: f.jawapan,
        sortOrder: i,
        visible: !f.soalan.includes('[') && !f.jawapan.includes('['),
      })),
    );
    await tx.insert(s.siteContent).values(
      Object.entries(KANDUNGAN_MULA).map(([key, value]) => ({ key, value })),
    );
  });
}
