import { describe, expect, test } from 'vitest';
import { kotakKanvas } from '@/lib/gambar/meja';

describe('kotakKanvas (gambar meja 600×900, dasar di bawah)', () => {
  test('gambar segi empat sama dihadkan oleh lebar', () => {
    expect(kotakKanvas({ w: 300, h: 300 })).toEqual({ x: 6, y: 312, w: 588, h: 588 });
  });
  test('gambar tinggi dihadkan oleh tinggi', () => {
    const k = kotakKanvas({ w: 200, h: 1000 });
    expect(k.x).toBeCloseTo(211.8, 5);
    expect(k.y).toBeCloseTo(18, 5);
    expect(k.w).toBeCloseTo(176.4, 5);
    expect(k.h).toBeCloseTo(882, 5);
  });
  test('kanvas lain dan dasar sentiasa di bawah', () => {
    const k = kotakKanvas({ w: 100, h: 50 }, { w: 200, h: 300 });
    expect(k.y + k.h).toBeCloseTo(300, 5);
    expect(k.x * 2 + k.w).toBeCloseTo(200, 5);
  });
});
