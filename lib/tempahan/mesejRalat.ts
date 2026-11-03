const MESEJ: Record<string, string> = {
  ITEM_TIDAK_AKTIF: 'Kek ini tidak lagi ditawarkan.',
  ADDON_TIDAK_AKTIF: 'Tambahan ini tidak lagi ditawarkan.',
  KUANTITI: 'Kuantiti mesti antara 1 dan 10.',
  TEKS_DIPERLUKAN: 'Sila isi teks untuk tambahan ini.',
  TEKS_PANJANG: 'Teks terlalu panjang.',
  SENARAI_KOSONG: 'Senarai kosong.',
  SLOT_PENUH: 'Slot ini baru penuh. Pilih slot lain.',
  HARI_PENUH: 'Tarikh ini baru penuh. Pilih tarikh lain.',
  TERLALU_AWAL: 'Tarikh ini terlalu awal untuk kek yang dipilih. Pilih tarikh lain.',
  HARI_TUTUP: 'Kami tutup pada tarikh ini. Pilih tarikh lain.',
  HAD_KADAR: 'Terlalu banyak cubaan dalam masa singkat. Cuba lagi sebentar atau WhatsApp terus.',
  INPUT: 'Sila semak maklumat yang diisi.',
};

export function mesejRalat(kod: string): string {
  return MESEJ[kod] ?? 'Tak dapat simpan sekarang. Cuba lagi.';
}
