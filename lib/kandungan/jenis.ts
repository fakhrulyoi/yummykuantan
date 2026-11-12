export type NilaiKandungan = {
  hero: { tajuk: string; ayat: string; ayatPendek: string; gambar: { url: string; nama: string; posisi?: string }[] };
  hubungi: {
    whatsapp: string; whatsappPapar: string; instagram: string; tiktok: string; alamat: string; waktu: string; kawasan: string;
  };
  footer: { ayat: string };
  waTemplates: Record<string, string>;
  galeri: { gambar: string[] };
  ulasan: { petikan: { teks: string; oleh: string }[] };
};
export type KunciKandungan = keyof NilaiKandungan;
export const KUNCI_KANDUNGAN: KunciKandungan[] = ['hero', 'hubungi', 'footer', 'waTemplates', 'galeri', 'ulasan'];
