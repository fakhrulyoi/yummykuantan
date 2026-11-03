import { expect, test } from '@playwright/test';
import { db, skema as s } from '../../lib/data/db';
import { idTetap } from '../../db/seed';
import { dataMula } from './bantu';

test.beforeEach(async ({ request }) => {
  await dataMula(request);
  await db.insert(s.order).values({
    ref: 'YK-24150', token: 'abc', kind: 'LIST', date: '2026-12-01', timeSlotId: idTetap('slot:2:00 hingga 4:00 petang'), status: 'BARU_WA',
    mode: 'PICKUP', customerName: 'Nur Aisyah', phone: '60123456789',
    cakeSubtotalSen: 10000, totalSen: 10000, waMessage: '-', ipHash: '-', dedupeKey: 'semak',
  });
});

test('semak status: rujukan dan 4 digit betul', async ({ page }) => {
  await page.goto('/semak');
  await page.getByLabel('Rujukan tempahan').fill('yk-24150');
  await page.getByLabel('4 digit akhir telefon').fill('6789');
  await page.getByRole('button', { name: 'Semak' }).click();
  const langkah = page.getByRole('list', { name: 'Status tempahan' }).getByRole('listitem');
  await expect(langkah.first()).toContainText('Dihantar di WhatsApp');
  await expect(langkah.first()).toHaveAttribute('aria-current', 'step');
  await expect(page.getByRole('heading', { name: /Kami terima tempahan anda/ })).toBeVisible();
});

test('semak status: digit salah', async ({ page }) => {
  await page.goto('/semak');
  await page.getByLabel('Rujukan tempahan').fill('YK-24150');
  await page.getByLabel('4 digit akhir telefon').fill('0000');
  await page.getByRole('button', { name: 'Semak' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Tiada tempahan sepadan' })).toBeVisible();
});

test('halaman reka: studio akan datang', async ({ page }) => {
  await page.goto('/reka');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Studio 3D akan datang');
  await expect(page.getByRole('link', { name: /WhatsApp/ }).first()).toHaveAttribute('href', /^https:\/\/wa\.me\/601123023447\?text=/);
});
