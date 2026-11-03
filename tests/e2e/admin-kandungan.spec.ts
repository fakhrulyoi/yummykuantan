import { expect, test } from '@playwright/test';
import { dataMula } from './bantu';
import { masukAdmin, sediaAdmin } from './bantu-admin';

test.beforeEach(async ({ request }) => {
  await dataMula(request);
  await sediaAdmin();
});

test('hero: draf dipapar dalam pratonton phone, laman berubah selepas terbit', async ({ page }) => {
  await masukAdmin(page);
  await page.goto('/admin/kandungan');
  await page.getByLabel('Tajuk').fill('Kek hari jadi paling sedap di Kuantan.');
  await expect(page.getByTestId('pratonton-tajuk')).toHaveText('Kek hari jadi paling sedap di Kuantan.');
  await page.getByRole('button', { name: 'Simpan draf' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Draf disimpan' })).toBeVisible();
  await expect(page.getByText('Draf belum diterbitkan')).toBeVisible();

  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Kek yang diingat lama selepas majlis.');

  await page.goto('/admin/kandungan');
  await expect(page.getByLabel('Tajuk')).toHaveValue('Kek hari jadi paling sedap di Kuantan.');
  await page.getByRole('button', { name: 'Terbitkan' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Diterbitkan' })).toBeVisible();
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Kek hari jadi paling sedap di Kuantan.');
});

test('hubungi: nombor WhatsApp tidak sah ditolak', async ({ page }) => {
  await masukAdmin(page);
  await page.goto('/admin/kandungan?b=hubungi');
  await page.getByLabel('Nombor WhatsApp (untuk pautan)').fill('0123');
  await page.getByRole('button', { name: 'Terbitkan' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'format 601' })).toBeVisible();
});

test('soalan lazim: [kurungan] ditolak, selepas diisi terbit dan muncul di laman', async ({ page }) => {
  await masukAdmin(page);
  await page.goto('/admin/soalan');
  const baris = page.getByRole('list', { name: 'Senarai soalan' }).getByRole('listitem').filter({ hasText: 'Berapa hari awal perlu tempah?' });
  await expect(baris.getByText('Perlu diisi')).toBeVisible();
  await baris.getByRole('button', { name: 'Berapa hari awal perlu tempah?' }).click();
  await baris.getByRole('button', { name: 'Terbitkan' }).click();
  await expect(baris.getByRole('alert').filter({ hasText: 'Jawapan masih ada [kurungan]' })).toBeVisible();

  await baris.getByLabel('Jawapan').fill('Sekurang-kurangnya 3 hari untuk kek biasa dan 7 hari untuk kek kahwin.');
  await expect(baris.getByText('Perlu diisi')).toHaveCount(0);
  await baris.getByRole('button', { name: 'Terbitkan' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Diterbitkan dan dipapar' })).toBeVisible();

  await page.goto('/');
  const soalan = page.locator('#soalan details');
  await expect(soalan).toHaveCount(4);
  await expect(page.locator('#soalan')).toContainText('Berapa hari awal perlu tempah?');
});
