import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { db, skema as s } from '../../lib/data/db';
import { idTetap } from '../../db/seed';
import { dataMula, segarkan } from './bantu';

test.beforeEach(async ({ request }) => {
  await dataMula(request);
});

test('susunan bahagian ikut design', async ({ page }) => {
  await page.goto('/');
  const tajuk = await page.locator('main h1, main h2').allInnerTexts();
  const urutan = [
    'Kek yang diingat lama selepas majlis.',
    'Tarikh yang masih kosong',
    'Pilih kek terus dari meja kami.',
    'Pilih ikut jenis',
    'Nak rekaan sendiri? Kami bantu rekakan.',
    'Cara tempah',
    'Kata pelanggan',
    'Soalan lazim',
    'Dari dapur kami',
  ];
  const kedudukan = urutan.map((t) => tajuk.findIndex((x) => x.replace(/\s+/g, ' ').trim() === t));
  expect(kedudukan.every((k) => k >= 0)).toBe(true);
  expect([...kedudukan].sort((a, b) => a - b)).toEqual(kedudukan);
  await expect(page.getByRole('region', { name: 'Jenis kek' })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Terus WhatsApp kami/ })).toBeVisible();
});

test('tarikh kosong: 7 hari, hari penuh dan tutup ditanda', async ({ page, request }) => {
  // Tutup hari kedua dan penuhkan hari ketiga dalam jalur.
  await page.goto('/');
  const seksyen = page.getByRole('region', { name: 'Tarikh yang masih kosong' });
  const hari = seksyen.getByRole('button');
  await expect(hari).toHaveCount(7);
  const tarikh = await hari.evaluateAll((b) => b.map((x) => x.getAttribute('data-tarikh')!));
  await db.insert(s.closedDate).values({ date: tarikh[1], reason: 'Cuti' });
  await db.update(s.settings).set({ dailyCapacity: 1 });
  await db.insert(s.order).values({
    ref: 'YK-90001', token: 'x', kind: 'LIST', date: tarikh[2], timeSlotId: idTetap('slot:10:00 hingga 12:00 pagi'), status: 'DISAHKAN',
    cakeSubtotalSen: 10000, totalSen: 10000, waMessage: '-', ipHash: '-', dedupeKey: '-',
  });
  await segarkan(request);
  await page.reload();
  await expect(hari.nth(1)).toContainText('Tutup');
  await expect(hari.nth(1)).toBeDisabled();
  await expect(hari.nth(2)).toContainText('Penuh');
  await expect(hari.nth(2)).toBeDisabled();
  await expect(hari.nth(0)).toContainText('slot');
});

test('tepat 3 soalan lazim dan boleh dibuka', async ({ page }) => {
  await page.goto('/');
  const soalan = page.locator('#soalan details');
  await expect(soalan).toHaveCount(3);
  await soalan.first().locator('summary').click();
  await expect(soalan.first()).toHaveAttribute('open', '');
  await expect(soalan.first()).toContainText('WhatsApp akan dibuka');
});

test('jalur reka memaut ke /reka', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Tempahan rekaan khas' })).toHaveAttribute('href', '/reka');
});

test('tiada isu aksesibiliti serius', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const r = await new AxeBuilder({ page }).analyze();
  const teruk = r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(teruk.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(', ')}`)).toEqual([]);
});
