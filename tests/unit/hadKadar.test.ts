import { afterAll, beforeEach, expect, test } from 'vitest';
import { hadKadar, hashIp } from '@/lib/data/hadKadar';
import { tutupDb } from '@/lib/data/db';
import { resetDb } from '../db';

beforeEach(resetDb);
afterAll(tutupDb);

test('had dalam satu tetingkap', async () => {
  expect(await hadKadar('t:ip', 2, 3600)).toBe(true);
  expect(await hadKadar('t:ip', 2, 3600)).toBe(true);
  expect(await hadKadar('t:ip', 2, 3600)).toBe(false);
  expect(await hadKadar('t:lain', 2, 3600)).toBe(true);
});

test('serentak tidak melepasi had', async () => {
  const r = await Promise.all(Array.from({ length: 8 }, () => hadKadar('t:serentak', 3, 3600)));
  expect(r.filter(Boolean)).toHaveLength(3);
});

test('hashIp stabil dan tidak mendedahkan IP', () => {
  expect(hashIp('1.2.3.4')).toBe(hashIp('1.2.3.4'));
  expect(hashIp('1.2.3.4')).not.toContain('1.2.3.4');
  expect(hashIp('1.2.3.4')).toHaveLength(64);
});
