import { describe, expect, test } from 'vitest';
import { AWAL, mejaReducer, skalaSaiz } from '@/components/kedai/meja/useMejaKek';

const n = 8;

describe('mejaReducer', () => {
  test('nyala menghentikan main automatik', () => {
    expect(mejaReducer({ ...AWAL, auto: true }, { t: 'nyala', i: 3 }, n)).toMatchObject({ lit: 3, auto: false });
  });

  test('kekunci anak panah, Home dan End', () => {
    expect(mejaReducer({ ...AWAL, lit: 2 }, { t: 'kekunci', key: 'ArrowRight' }, n).lit).toBe(3);
    expect(mejaReducer({ ...AWAL, lit: 0 }, { t: 'kekunci', key: 'ArrowLeft' }, n).lit).toBe(0);
    expect(mejaReducer({ ...AWAL, lit: 2 }, { t: 'kekunci', key: 'End' }, n).lit).toBe(n - 1);
    expect(mejaReducer({ ...AWAL, lit: 5 }, { t: 'kekunci', key: 'Home' }, n).lit).toBe(0);
    const s = { ...AWAL, lit: 4 };
    expect(mejaReducer(s, { t: 'kekunci', key: 'a' }, n)).toBe(s);
  });

  test('sapuan tidak berpusing, butang berpusing', () => {
    expect(mejaReducer({ ...AWAL, lit: n - 1 }, { t: 'sapu', arah: 1 }, n).lit).toBe(n - 1);
    expect(mejaReducer({ ...AWAL, lit: 0 }, { t: 'sapu', arah: -1 }, n).lit).toBe(0);
    expect(mejaReducer({ ...AWAL, lit: 0 }, { t: 'sapu', arah: 1 }, n).lit).toBe(1);
    expect(mejaReducer({ ...AWAL, lit: n - 1 }, { t: 'seterusnya' }, n).lit).toBe(0);
    expect(mejaReducer({ ...AWAL, lit: 0 }, { t: 'sebelum' }, n).lit).toBe(n - 1);
  });

  test('tik hanya bergerak bila automatik', () => {
    expect(mejaReducer({ ...AWAL, lit: 1, auto: true }, { t: 'tik' }, n).lit).toBe(2);
    expect(mejaReducer({ ...AWAL, lit: n - 1, auto: true }, { t: 'tik' }, n).lit).toBe(0);
    expect(mejaReducer({ ...AWAL, lit: 1, auto: false }, { t: 'tik' }, n).lit).toBe(1);
    expect(mejaReducer({ ...AWAL, lit: 1, auto: true, open: 1 }, { t: 'tik' }, n).lit).toBe(1);
  });

  test('buka, saiz, tutup', () => {
    let s = mejaReducer({ ...AWAL, lit: 4, auto: true, saiz: 2 }, { t: 'buka', i: 4 }, n);
    expect(s).toMatchObject({ open: 4, saiz: 0, auto: false });
    s = mejaReducer(s, { t: 'saiz', k: 1 }, n);
    expect(s.saiz).toBe(1);
    expect(mejaReducer(s, { t: 'tutup' }, n)).toMatchObject({ open: null, lit: 4 });
  });

  test('auto boleh dihidupkan dan dimatikan', () => {
    expect(mejaReducer(AWAL, { t: 'auto', on: true }, n).auto).toBe(true);
  });
});

describe('skalaSaiz', () => {
  test('0.8 hingga 1.0', () => {
    expect(skalaSaiz(2, 3)).toBe(1);
    expect(skalaSaiz(0, 3)).toBe(0.8);
    expect(skalaSaiz(1, 3)).toBeCloseTo(0.9);
    expect(skalaSaiz(0, 1)).toBe(1);
  });
});
