import { expect, test } from 'vitest';
import { formatRM } from '@/lib/tempahan/wang';
import { formatRujukan } from '@/lib/tempahan/rujukan';

test('formatRM untuk paparan dan mesej', () => {
  expect(formatRM(10000)).toBe('RM 100.00');
  expect(formatRM(10000, { rapat: true })).toBe('RM100.00');
  expect(formatRM(550)).toBe('RM 5.50');
  expect(formatRM(123456)).toBe('RM 1,234.56');
  expect(formatRM(0, { rapat: true })).toBe('RM0.00');
});

test('formatRujukan', () => {
  expect(formatRujukan(24117)).toBe('YK-24117');
});
