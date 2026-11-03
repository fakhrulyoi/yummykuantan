import type { OrderStatus } from '@/lib/tempahan/jenis';

export const LABEL_STATUS: Record<OrderStatus, string> = {
  BARU_WA: 'Baru di WhatsApp',
  MENUNGGU_BAYARAN: 'Menunggu bayaran',
  DISAHKAN: 'Disahkan',
  DALAM_PENYEDIAAN: 'Dalam penyediaan',
  SEDIA_DIAMBIL: 'Sedia diambil',
  DALAM_PENGHANTARAN: 'Dalam penghantaran',
  SELESAI: 'Selesai',
  DIBATALKAN: 'Dibatalkan',
};
export const WARNA_STATUS: Record<OrderStatus, { bg: string; fg: string }> = {
  BARU_WA: { bg: '#FBEFD9', fg: '#7A4E10' },
  MENUNGGU_BAYARAN: { bg: '#FBE3E1', fg: '#8E2620' },
  DISAHKAN: { bg: '#E3EFE1', fg: '#22562B' },
  DALAM_PENYEDIAAN: { bg: '#E7E4F4', fg: '#3E3478' },
  SEDIA_DIAMBIL: { bg: '#DDEEF2', fg: '#1F5663' },
  DALAM_PENGHANTARAN: { bg: '#DDEEF2', fg: '#1F5663' },
  SELESAI: { bg: '#ECE5DB', fg: '#4F4337' },
  DIBATALKAN: { bg: '#F1E8E6', fg: '#7A6A66' },
};
