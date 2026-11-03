export type KeadaanMeja = { lit: number | null; auto: boolean; open: number | null; saiz: number };
export type AksiMeja =
  | { t: 'nyala'; i: number }
  | { t: 'seterusnya' }
  | { t: 'sebelum' }
  | { t: 'sapu'; arah: 1 | -1 }
  | { t: 'tik' }
  | { t: 'buka'; i: number }
  | { t: 'tutup' }
  | { t: 'saiz'; k: number }
  | { t: 'auto'; on: boolean }
  | { t: 'kekunci'; key: string };

export const AWAL: KeadaanMeja = { lit: 0, auto: false, open: null, saiz: 0 };

const had = (i: number, n: number) => Math.max(0, Math.min(n - 1, i));
const pusing = (i: number, n: number) => ((i % n) + n) % n;

export function mejaReducer(s: KeadaanMeja, a: AksiMeja, n: number): KeadaanMeja {
  const kini = s.lit ?? 0;
  switch (a.t) {
    case 'nyala':
      return { ...s, lit: had(a.i, n), auto: false };
    case 'seterusnya':
      return { ...s, lit: pusing(kini + 1, n), auto: false };
    case 'sebelum':
      return { ...s, lit: pusing(kini - 1, n), auto: false };
    case 'sapu':
      return { ...s, lit: had(kini + a.arah, n), auto: false };
    case 'tik':
      return s.auto && s.open === null ? { ...s, lit: pusing(kini + 1, n) } : s;
    case 'buka':
      return { ...s, open: had(a.i, n), lit: had(a.i, n), saiz: 0, auto: false };
    case 'tutup':
      return { ...s, open: null };
    case 'saiz':
      return { ...s, saiz: Math.max(0, a.k) };
    case 'auto':
      return { ...s, auto: a.on };
    case 'kekunci': {
      const k = a.key;
      if (k === 'ArrowRight') return { ...s, lit: had(kini + 1, n), auto: false };
      if (k === 'ArrowLeft') return { ...s, lit: had(kini - 1, n), auto: false };
      if (k === 'Home') return { ...s, lit: 0, auto: false };
      if (k === 'End') return { ...s, lit: n - 1, auto: false };
      return s;
    }
  }
}

/** Saiz kek dalam dialog ikut saiz dipilih: terkecil 0.8, terbesar 1.0. */
export function skalaSaiz(k: number, bil: number): number {
  if (bil <= 1) return 1;
  return 0.8 + (0.2 * k) / (bil - 1);
}
