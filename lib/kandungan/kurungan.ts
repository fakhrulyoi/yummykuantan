/** Teks `[...]` belum disahkan pemilik; tidak dipapar di laman. */
export const adaKurungan = (t: string | null | undefined): boolean => !!t && t.includes('[');
export const sudahDiisi = (t: string | null | undefined): t is string => !!t && t.trim().length > 0 && !t.includes('[');
