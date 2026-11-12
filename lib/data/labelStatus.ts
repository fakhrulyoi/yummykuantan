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

/** Langkah biasa seterusnya untuk satu tempahan (butang sekali tekan di admin). */
export function langkahSeterusnya(status: OrderStatus, mode: string | null): { status: OrderStatus; label: string } | null {
  switch (status) {
    case 'BARU_WA':
      return { status: 'MENUNGGU_BAYARAN', label: 'Minta bayaran' };
    case 'MENUNGGU_BAYARAN':
      return { status: 'DISAHKAN', label: 'Sudah bayar, sahkan' };
    case 'DISAHKAN':
      return { status: 'DALAM_PENYEDIAAN', label: 'Mula sediakan' };
    case 'DALAM_PENYEDIAAN':
      return mode === 'DELIVERY' ? { status: 'DALAM_PENGHANTARAN', label: 'Mula hantar' } : { status: 'SEDIA_DIAMBIL', label: 'Sedia diambil' };
    case 'SEDIA_DIAMBIL':
    case 'DALAM_PENGHANTARAN':
      return { status: 'SELESAI', label: 'Tandakan selesai' };
    default:
      return null;
  }
}
