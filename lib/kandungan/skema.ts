import { z } from 'zod';
import type { KunciKandungan } from './jenis';

const teks = (min: number, maks: number) => z.string().trim().min(min, { error: 'Medan ini perlu diisi' }).max(maks);
const url = z.string().trim().min(1).max(500);

/** Skema setiap bahagian kandungan laman (disemak di server sebelum simpan). */
export const SKEMA_KANDUNGAN: Record<KunciKandungan, z.ZodType> = {
  hero: z.object({
    tajuk: teks(3, 90),
    ayat: teks(3, 240),
    ayatPendek: teks(3, 120),
    gambar: z.array(z.object({ url, nama: z.string().trim().max(80), posisi: z.string().max(20).optional() })).min(1, { error: 'Sekurang-kurangnya satu gambar' }).max(8),
    ticker: z.array(z.string().trim().min(1).max(40)).max(16),
  }),
  hubungi: z.object({
    whatsapp: z.string().regex(/^601\d{8,9}$/, { error: 'Nombor WhatsApp: format 601XXXXXXXX' }),
    whatsappPapar: teks(8, 30),
    instagram: z.string().trim().regex(/^[\w.]{1,30}$/, { error: 'Nama Instagram tanpa @' }),
    tiktok: z.string().trim().regex(/^[\w.]{1,30}$/, { error: 'Nama TikTok tanpa @' }),
    alamat: teks(3, 200),
    waktu: teks(3, 120),
    kawasan: teks(3, 80),
  }),
  footer: z.object({ ayat: teks(3, 240) }),
  waTemplates: z.record(z.string(), z.string().trim().max(500)),
  galeri: z.object({ gambar: z.array(url).max(24) }),
  ulasan: z.object({ petikan: z.array(z.object({ teks: teks(3, 240), oleh: teks(2, 60) })).max(8) }),
};
