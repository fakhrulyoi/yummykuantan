import { z } from 'zod';
import { HAD } from './jenis';
import { formatTelefon } from './telefon';

const teks = (maks: number) => z.string().trim().max(maks);
const perangkap = z.literal('', { error: 'Ditolak' });

const item = z.object({
  productId: z.string().min(1).max(64),
  sizeId: z.string().min(1).max(64),
  qty: z.number().int().min(HAD.qtyMin).max(HAD.qtyMaks),
  cakeMessage: teks(HAD.ucapanKek).optional(),
});

const tambahan = z.object({
  addonId: z.string().min(1).max(64),
  qty: z.number().int().min(HAD.qtyMin).max(HAD.qtyMaks),
  text: teks(HAD.kadUcapan).optional(),
});

export const KAWASAN = ['Kuantan', 'Pekan'] as const;

export const skemaTempahan = z
  .object({
    items: z.array(item).min(1, { error: 'Senarai kosong' }).max(20),
    addons: z.array(tambahan).max(10).default([]),
    mode: z.enum(['PICKUP', 'DELIVERY'], { error: 'Pilih cara terima' }),
    area: z.enum(KAWASAN, { error: 'Pilih kawasan penghantaran' }).optional(),
    address: teks(300).optional(),
    date: z.string().min(1, { error: 'Pilih tarikh' }).max(10),
    timeSlotId: z.string().min(1, { error: 'Pilih slot masa' }).max(64),
    name: teks(60).min(1, { error: 'Sila isi nama' }),
    phone: z.string().max(30),
    notes: teks(HAD.nota).optional(),
    lamanWeb: perangkap,
  })
  .superRefine((v, ctx) => {
    if (v.mode === 'DELIVERY') {
      if (!v.area) ctx.addIssue({ code: 'custom', path: ['area'], message: 'Pilih kawasan penghantaran' });
      if (!v.address || v.address.length < HAD.alamatMin) {
        ctx.addIssue({ code: 'custom', path: ['address'], message: 'Sila isi alamat penghantaran' });
      }
    }
    if (!v.phone.trim()) ctx.addIssue({ code: 'custom', path: ['phone'], message: 'Sila isi nombor telefon' });
    else if (!formatTelefon(v.phone)) ctx.addIssue({ code: 'custom', path: ['phone'], message: 'Nombor telefon tidak sah' });
  })
  .transform((v) => ({
    ...v,
    phone: formatTelefon(v.phone)!,
    area: v.mode === 'DELIVERY' ? v.area : undefined,
    address: v.mode === 'DELIVERY' ? v.address : undefined,
    notes: v.notes || undefined,
  }));

export type TempahanSah = z.output<typeof skemaTempahan>;

export const skemaTempahanCepat = z.object({
  productId: z.string().min(1).max(64),
  sizeId: z.string().min(1).max(64),
  qty: z.number().int().min(HAD.qtyMin).max(HAD.qtyMaks),
  cakeMessage: teks(HAD.ucapanKek).optional(),
  lamanWeb: perangkap,
});

export const skemaSemak = z.object({
  ref: z.string().trim().toUpperCase().regex(/^YK-\d{5,}$/, { error: 'Rujukan bermula YK- diikuti nombor' }),
  empat: z.string().trim().regex(/^\d{4}$/, { error: 'Masukkan 4 digit akhir telefon' }),
});

/** Ralat pertama bagi setiap medan, untuk dipaparkan di sebelah medan. */
export function medanRalat(e: z.ZodError): Record<string, string> {
  const m: Record<string, string> = {};
  for (const i of e.issues) {
    const k = i.path.map(String).join('.');
    if (k && !(k in m)) m[k] = i.message;
  }
  return m;
}
