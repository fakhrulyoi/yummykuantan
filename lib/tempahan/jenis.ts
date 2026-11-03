export const STATUS_TEMPAHAN = [
  'BARU_WA', 'MENUNGGU_BAYARAN', 'DISAHKAN', 'DALAM_PENYEDIAAN', 'SEDIA_DIAMBIL', 'DALAM_PENGHANTARAN', 'SELESAI', 'DIBATALKAN',
] as const;
export type OrderStatus = (typeof STATUS_TEMPAHAN)[number];

export type ItemInput = { productId: string; sizeId: string; qty: number; cakeMessage?: string };
export type AddonInput = { addonId: string; qty: number; text?: string };

export type SaizKatalog = {
  sizeId: string; productId: string; productName: string; label: string; priceSen: number;
  active: boolean; leadDays: number; allowMessage: boolean;
};
export type AddonKatalog = { addonId: string; name: string; priceSen: number; textKind: 'NONE' | 'NUMBER' | 'MESSAGE'; active: boolean };

export type BarisItem = {
  productId: string; productName: string; sizeLabel: string; unitPriceSen: number; qty: number; cakeMessage?: string; leadDays: number;
};
export type BarisAddon = { addonId: string; name: string; unitPriceSen: number; qty: number; text?: string };

export type KodRalat = 'ITEM_TIDAK_AKTIF' | 'ADDON_TIDAK_AKTIF' | 'KUANTITI' | 'TEKS_DIPERLUKAN' | 'TEKS_PANJANG' | 'SENARAI_KOSONG';

export const HAD = {
  ucapanKek: 30,
  kadUcapan: 120,
  lilinNombor: 10,
  nota: 500,
  qtyMin: 1,
  qtyMaks: 10,
  alamatMin: 8,
} as const;
