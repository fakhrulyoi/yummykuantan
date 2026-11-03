import { expect, test } from 'vitest';
import { empatAkhir, formatTelefon } from '@/lib/tempahan/telefon';

test.each([
  ['011-2302 3447', '601123023447'],
  ['+60 11-2302 3447', '601123023447'],
  ['601123023447', '601123023447'],
  ['0123456789', '60123456789'],
])('formatTelefon(%s) → %s', (masuk, keluar) => {
  expect(formatTelefon(masuk)).toBe(keluar);
});

test.each(['12345', '0112302', '+6591234567', '', 'abc'])('formatTelefon(%s) ditolak', (masuk) => {
  expect(formatTelefon(masuk)).toBeNull();
});

test('empatAkhir', () => {
  expect(empatAkhir('601123023447')).toBe('3447');
});
