/** Kanvas standard gambar meja kek: 2:3, dasar kek di bawah. */
export const KANVAS_MEJA = { w: 600, h: 900 } as const;
const RUANG = 0.98;

/** Kotak gambar dalam kanvas: muat 98% lebar dan tinggi, tengah mendatar, dasar rapat ke bawah. */
export function kotakKanvas(kotak: { w: number; h: number }, kanvas: { w: number; h: number } = KANVAS_MEJA): { x: number; y: number; w: number; h: number } {
  const k = Math.min((kanvas.w * RUANG) / kotak.w, (kanvas.h * RUANG) / kotak.h);
  const w = kotak.w * k;
  const h = kotak.h * k;
  return { x: (kanvas.w - w) / 2, y: kanvas.h - h, w, h };
}

/** Hakis saluran alfa (penapis minimum boleh-asing) supaya tepi latar yang tertinggal dibuang. */
function hakisAlfa(data: Uint8ClampedArray, w: number, h: number, r: number): void {
  if (r <= 0) return;
  const a = new Uint8ClampedArray(w * h);
  for (let i = 0; i < w * h; i++) a[i] = data[i * 4 + 3];
  const t = new Uint8ClampedArray(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let m = 255;
      for (let d = -r; d <= r; d++) {
        const xx = x + d;
        const v = xx < 0 || xx >= w ? 0 : a[y * w + xx];
        if (v < m) m = v;
      }
      t[y * w + x] = m;
    }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let m = 255;
      for (let d = -r; d <= r; d++) {
        const yy = y + d;
        const v = yy < 0 || yy >= h ? 0 : t[yy * w + x];
        if (v < m) m = v;
      }
      data[(y * w + x) * 4 + 3] = m;
    }
  }
}

/** Kotak terkecil yang mengandungi piksel legap (alfa > 8). */
function kotakAlfa(data: Uint8ClampedArray, w: number, h: number) {
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > 8) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  return x1 < 0 ? null : { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

const SISI_MAKS = 1600;

/** Hakis tepi, potong ke kotak alfa, letak di kanvas 600×900 (dasar di bawah), eksport WebP 0.86. Browser sahaja. */
export async function normalkanGambarMeja(potongan: ImageBitmap, hakisPx: 0 | 1 | 2 | 3 | 4): Promise<Blob> {
  const k = Math.min(1, SISI_MAKS / Math.max(potongan.width, potongan.height));
  const w = Math.max(1, Math.round(potongan.width * k));
  const h = Math.max(1, Math.round(potongan.height * k));
  const sumber = document.createElement('canvas');
  sumber.width = w;
  sumber.height = h;
  const cs = sumber.getContext('2d', { willReadFrequently: true })!;
  cs.drawImage(potongan, 0, 0, w, h);
  const img = cs.getImageData(0, 0, w, h);
  hakisAlfa(img.data, w, h, hakisPx);
  cs.putImageData(img, 0, 0);
  const kotak = kotakAlfa(img.data, w, h);
  if (!kotak) throw new Error('KOSONG');

  const hasil = document.createElement('canvas');
  hasil.width = KANVAS_MEJA.w;
  hasil.height = KANVAS_MEJA.h;
  const ch = hasil.getContext('2d')!;
  ch.imageSmoothingQuality = 'high';
  const d = kotakKanvas(kotak);
  ch.drawImage(sumber, kotak.x, kotak.y, kotak.w, kotak.h, d.x, d.y, d.w, d.h);
  const blob = await new Promise<Blob | null>((ok) => hasil.toBlob(ok, 'image/webp', 0.86));
  if (!blob) throw new Error('EKSPORT');
  return blob;
}
