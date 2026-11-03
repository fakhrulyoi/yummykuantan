import { createHash } from 'node:crypto';
import katalog from './seed-data/katalog.json';
import type { Db } from '../lib/data/db';
import * as s from '../lib/data/skema';
import { urlGambarMula } from './gambar-mula';
import type { NilaiKandungan } from '../lib/kandungan/jenis';

const sen = (rm: number) => Math.round(rm * 100);

/** UUID tetap daripada nama, supaya ID data mula sama setiap kali seed dijalankan. */
export function idTetap(nama: string): string {
  const h = createHash('sha1').update(`yummykuantan:${nama}`).digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-${((parseInt(h[16], 16) & 3) | 8).toString(16)}${h.slice(17, 20)}-${h.slice(20, 32)}`;
}
const slug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const KANDUNGAN_MULA: NilaiKandungan = {
  hero: {
    tajuk: 'Kek yang diingat lama selepas majlis.',
    ayat: 'Kek batik, brownies, Italian cake dan kek kahwin. Dibakar ikut tempahan di dapur kami, untuk Kuantan dan Pekan.',
    ayatPendek: 'Dibakar ikut tempahan untuk Kuantan dan Pekan.',
    gambar: [
      { url: '/seed/03_01.jpg', nama: 'Victoria Sandwich Cake', posisi: '50% 40%' },
      { url: '/seed/06_01.jpg', nama: 'Italian Wedding Cake 2 Tingkat', posisi: '50% 35%' },
      { url: '/seed/04_02.jpg', nama: 'Italian Cake', posisi: '50% 50%' },
      { url: '/seed/12_01.jpg', nama: 'Italian Cake Wedding 12 inci', posisi: '50% 50%' },
      { url: '/seed/11_01.jpg', nama: 'Vintage Love Cake', posisi: '50% 45%' },
    ],
    ticker: ['Kek batik', 'Brownies', 'Italian cake', 'Kek kahwin', 'Burnt cheesecake', 'Vintage love cake', 'Red velvet', 'Pandan gula melaka'],
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
  galeri: {
    gambar: ['04_03', '07_01', '21_01', '23_01', '30_01', '32_01', '10_01', '20_01', '16_01', '25_01', '15_01', '05_01'].map((k) => `/seed/${k}.jpg`),
  },
  ulasan: {
    petikan: [
      { teks: 'Sekali rasa sedap, terus repeat untuk majlis kahwin. Kek yang sangat cantik mengikut citarasa saya.', oleh: 'Pelanggan kek kahwin' },
      { teks: 'Semua cakap sedap, habis terus dah semalam.', oleh: 'Pelanggan kek hari jadi' },
      { teks: 'Sedap, kek lembut sangat. Hilang craving lepas makan kek ni.', oleh: 'Pelanggan brownies' },
      { teks: 'Repeat sebab sini paling sedap dan murah!', oleh: 'Pelanggan kek batik' },
    ],
  },
};

const JENIS: Record<string, { blurb: string; gambar: string }> = {
  'Kek batik': { blurb: 'Indulgence cheese, ganache, mewah dengan mascarpone, Cadbury dan crunchy.', gambar: '22_01.jpg' },
  'Brownies dan bar': { blurb: 'Brownies berhias, plain, tower dan congo bars.', gambar: '17_01.jpg' },
  'Italian cake': { blurb: 'Krim segar gaya vintage dengan strawberi penuh.', gambar: '04_01.jpg' },
  'Kek kahwin': { blurb: 'Satu dan dua tingkat, Italian dan tiramisu.', gambar: '09_01.jpg' },
  'Hari jadi dan majlis': { blurb: 'Birthday cake, vintage love cake dan kek petak.', gambar: '10_01.jpg' },
  'Kek mentega': { blurb: 'Victoria sandwich, pandan gula melaka, red velvet.', gambar: '23_01.jpg' },
};

export async function seedDb(db: Db): Promise<void> {
  await db.transaction(async (tx) => {
    const kat = await tx
      .insert(s.category)
      .values(
        await Promise.all(
          katalog.kategori.map(async (name, i) => ({
            id: idTetap(`kategori:${name}`), name, slug: slug(name), sortOrder: i,
            description: JENIS[name]?.blurb ?? '',
            imageUrl: JENIS[name] ? await urlGambarMula(JENIS[name].gambar, 'produk') : null,
          })),
        ),
      )
      .returning();
    const idKat = new Map(kat.map((k) => [k.name, k.id]));

    for (const p of katalog.produk) {
      const kahwin = p.kategori === 'Kek kahwin';
      const [row] = await tx
        .insert(s.product)
        .values({
          id: idTetap(`produk:${p.slug}`),
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
        p.saiz.map((z, i) => ({ id: idTetap(`saiz:${p.slug}:${z.label}`), productId: row.id, label: z.label, priceSen: sen(z.harga), sortOrder: i })),
      );
      const imgs = await Promise.all(p.gambar.map((f) => urlGambarMula(f, 'produk')));
      await tx.insert(s.productImage).values(
        imgs.map((url, i) => ({ id: idTetap(`gambar:${p.slug}:${i}`), productId: row.id, url, alt: i === 0 ? p.nama : `${p.nama}, gambar ${i + 1}`, sortOrder: i })),
      );
    }

    await tx.insert(s.settings).values({ id: 1, minLeadDays: 3, dailyCapacity: 12, holdHours: 48, whatsappNumber: '601123023447' });
    await tx.insert(s.timeSlot).values([
      { id: idTetap('slot:10:00 hingga 12:00 pagi'), label: '10:00 hingga 12:00 pagi', startsAt: '10:00', endsAt: '12:00', capacity: 3, sortOrder: 0 },
      { id: idTetap('slot:2:00 hingga 4:00 petang'), label: '2:00 hingga 4:00 petang', startsAt: '14:00', endsAt: '16:00', capacity: 2, sortOrder: 1 },
      { id: idTetap('slot:4:00 hingga 6:00 petang'), label: '4:00 hingga 6:00 petang', startsAt: '16:00', endsAt: '18:00', capacity: 2, sortOrder: 2 },
    ]);
    await tx.insert(s.addon).values([
      { id: idTetap('tambahan:Lilin set 3 batang'), name: 'Lilin set 3 batang', note: 'Lilin putih panjang', priceSen: 600, textKind: 'NONE', sortOrder: 0 },
      { id: idTetap('tambahan:Lilin nombor'), name: 'Lilin nombor', note: 'Emas, satu nombor setiap batang', priceSen: 500, textKind: 'NUMBER', sortOrder: 1 },
      { id: idTetap('tambahan:Kad ucapan'), name: 'Kad ucapan', note: 'Kami tulis tangan ucapan anda', priceSen: 300, textKind: 'MESSAGE', sortOrder: 2 },
      { id: idTetap('tambahan:Pisau kek dan piring kertas'), name: 'Pisau kek dan piring kertas', note: 'Set 10 piring', priceSen: 400, textKind: 'NONE', sortOrder: 3 },
      { id: idTetap('tambahan:Beg kertas hadiah'), name: 'Beg kertas hadiah', note: 'Untuk dibawa sebagai hadiah', priceSen: 400, textKind: 'NONE', sortOrder: 4 },
    ]);
    await tx.insert(s.faq).values(
      katalog.soalan.map((f, i) => ({
        id: idTetap(`soalan:${i}`),
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
