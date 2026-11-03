import { HAD, type AddonInput, type AddonKatalog, type BarisAddon, type BarisItem, type ItemInput, type KodRalat, type SaizKatalog } from './jenis';

export type HasilHarga =
  | { ok: true; items: BarisItem[]; addons: BarisAddon[]; cakeSubtotalSen: number; addonSubtotalSen: number; totalSen: number }
  | { ok: false; ralat: KodRalat; indeks?: number };

const qtySah = (q: number) => Number.isInteger(q) && q >= HAD.qtyMin && q <= HAD.qtyMaks;

/** Kira harga dari katalog server sahaja. Harga dari browser tidak pernah dibaca. */
export function kiraHarga(
  items: ItemInput[],
  addons: AddonInput[],
  saiz: Map<string, SaizKatalog>,
  tambahan: Map<string, AddonKatalog>,
): HasilHarga {
  if (items.length === 0) return { ok: false, ralat: 'SENARAI_KOSONG' };

  const baris: BarisItem[] = [];
  for (const [indeks, it] of items.entries()) {
    const z = saiz.get(it.sizeId);
    if (!z || !z.active || z.productId !== it.productId) return { ok: false, ralat: 'ITEM_TIDAK_AKTIF', indeks };
    if (!qtySah(it.qty)) return { ok: false, ralat: 'KUANTITI', indeks };
    const ucapan = z.allowMessage ? it.cakeMessage?.trim() : undefined;
    if (ucapan && [...ucapan].length > HAD.ucapanKek) return { ok: false, ralat: 'TEKS_PANJANG', indeks };
    baris.push({
      productId: z.productId,
      productName: z.productName,
      sizeLabel: z.label,
      unitPriceSen: z.priceSen,
      qty: it.qty,
      ...(ucapan ? { cakeMessage: ucapan } : {}),
      leadDays: z.leadDays,
    });
  }

  const barisAddon: BarisAddon[] = [];
  for (const [indeks, a] of addons.entries()) {
    const k = tambahan.get(a.addonId);
    if (!k || !k.active) return { ok: false, ralat: 'ADDON_TIDAK_AKTIF', indeks };
    if (!qtySah(a.qty)) return { ok: false, ralat: 'KUANTITI', indeks };
    const teks = k.textKind === 'NONE' ? undefined : a.text?.trim();
    if (k.textKind !== 'NONE' && !teks) return { ok: false, ralat: 'TEKS_DIPERLUKAN', indeks };
    const had = k.textKind === 'NUMBER' ? HAD.lilinNombor : HAD.kadUcapan;
    if (teks && [...teks].length > had) return { ok: false, ralat: 'TEKS_PANJANG', indeks };
    barisAddon.push({ addonId: k.addonId, name: k.name, unitPriceSen: k.priceSen, qty: a.qty, ...(teks ? { text: teks } : {}) });
  }

  const cakeSubtotalSen = baris.reduce((t, b) => t + b.unitPriceSen * b.qty, 0);
  const addonSubtotalSen = barisAddon.reduce((t, b) => t + b.unitPriceSen * b.qty, 0);
  return { ok: true, items: baris, addons: barisAddon, cakeSubtotalSen, addonSubtotalSen, totalSen: cakeSubtotalSen + addonSubtotalSen };
}
