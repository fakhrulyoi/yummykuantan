import { z } from 'zod';
import { HAD, type AddonInput, type ItemInput } from '@/lib/tempahan/jenis';

export type Senarai = { v: 1; items: ItemInput[]; addons: AddonInput[]; harga?: number };
export const KOSONG: Senarai = { v: 1, items: [], addons: [] };
export const KUNCI = 'yk-senarai-v1';

const hadQty = (q: number) => Math.min(HAD.qtyMaks, Math.max(HAD.qtyMin, Math.round(q) || HAD.qtyMin));
const sama = (x: ItemInput, y: ItemInput) =>
  x.productId === y.productId && x.sizeId === y.sizeId && (x.cakeMessage ?? '') === (y.cakeMessage ?? '');

export function tambahItem(s: Senarai, i: ItemInput): Senarai {
  const ada = s.items.findIndex((x) => sama(x, i));
  if (ada >= 0) return ubahQty(s, ada, s.items[ada].qty + i.qty);
  const baru: ItemInput = { productId: i.productId, sizeId: i.sizeId, qty: hadQty(i.qty), ...(i.cakeMessage ? { cakeMessage: i.cakeMessage } : {}) };
  return { ...s, items: [...s.items, baru] };
}

export function ubahQty(s: Senarai, indeks: number, qty: number): Senarai {
  return { ...s, items: s.items.map((x, i) => (i === indeks ? { ...x, qty: hadQty(qty) } : x)) };
}

export function buangItem(s: Senarai, indeks: number): Senarai {
  return { ...s, items: s.items.filter((_, i) => i !== indeks) };
}

export function ubahAddon(s: Senarai, addonId: string, qty: number, text?: string): Senarai {
  const lain = s.addons.filter((a) => a.addonId !== addonId);
  if (qty <= 0) return { ...s, addons: lain };
  const baru: AddonInput = { addonId, qty: hadQty(qty), ...(text !== undefined ? { text } : {}) };
  const i = s.addons.findIndex((a) => a.addonId === addonId);
  if (i < 0) return { ...s, addons: [...s.addons, baru] };
  return { ...s, addons: s.addons.map((a, j) => (j === i ? baru : a)) };
}

export const bilKek = (s: Senarai) => s.items.reduce((t, i) => t + i.qty, 0);

const skema = z.object({
  v: z.literal(1),
  items: z.array(z.object({ productId: z.string(), sizeId: z.string(), qty: z.number(), cakeMessage: z.string().optional() })).max(20),
  addons: z.array(z.object({ addonId: z.string(), qty: z.number(), text: z.string().optional() })).max(10),
  harga: z.number().optional(),
});

export function bacaSenarai(raw: string | null): Senarai {
  if (!raw) return KOSONG;
  try {
    const r = skema.safeParse(JSON.parse(raw));
    return r.success ? (r.data as Senarai) : KOSONG;
  } catch {
    return KOSONG;
  }
}
