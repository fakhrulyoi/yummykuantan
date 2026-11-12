import { expect, test, type Page } from '@playwright/test';
import { eq } from 'drizzle-orm';
import { db, skema as s } from '../../lib/data/db';
import { hariIniMYT, tambahHari } from '../../lib/tempahan/tarikh';
import { dataMula } from './bantu';
import { masukAdmin, sediaAdmin, STAF } from './bantu-admin';

test.beforeEach(async ({ request }) => {
  await dataMula(request);
  await sediaAdmin();
});

async function kekDalamSenarai(page: Page) {
  await page.goto('/kek/italian-cake');
  await page.getByRole('button', { name: /^Tambah ke senarai/ }).click();
  await page.goto('/senarai');
}

test('staf: tetapan dibaca sahaja', async ({ page }) => {
  await masukAdmin(page, STAF.email);
  await page.goto('/admin/tetapan');
  await expect(page.getByText('Tetapan dibaca sahaja.')).toBeVisible();
  await expect(page.getByLabel('Kapasiti sehari (bilangan tempahan)')).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Simpan tetapan' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Tambah hari tutup' })).toHaveCount(0);
});

test('hari tutup, kapasiti slot 0, harga tambahan, nombor WhatsApp', async ({ page }) => {
  const minLead = (await db.select().from(s.settings))[0].minLeadDays;
  const tutup = tambahHari(hariIniMYT(new Date()), minLead + 1);
  await masukAdmin(page);
  await page.goto('/admin/tetapan');

  await page.getByLabel('Tarikh tutup').fill(tutup);
  await page.getByLabel('Sebab (pilihan)').fill('Cuti keluarga');
  await page.getByRole('button', { name: 'Tambah hari tutup' }).click();
  await expect(page.getByRole('list', { name: 'Senarai hari tutup' })).toContainText('Cuti keluarga');

  await page.getByLabel('Kapasiti 4:00 hingga 6:00 petang').fill('0');
  await page.getByRole('button', { name: 'Simpan 4:00 hingga 6:00 petang' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Slot disimpan' })).toBeVisible();

  await page.getByLabel('Harga Lilin set 3 batang (RM)').fill('7');
  await page.getByRole('button', { name: 'Simpan Lilin set 3 batang' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Tambahan disimpan' })).toBeVisible();

  await page.getByLabel('Nombor WhatsApp kedai').fill('0123');
  await page.getByRole('button', { name: 'Simpan tetapan' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Nombor WhatsApp tidak sah' })).toBeVisible();

  await kekDalamSenarai(page);
  const hari = page.getByRole('group', { name: 'Tarikh' }).locator(`[data-tarikh="${tutup}"]`);
  await expect(hari).toContainText('Tutup');
  await expect(hari).toBeDisabled();
  await page.getByRole('group', { name: 'Tarikh' }).getByRole('button', { disabled: false }).first().click();
  const petang = page.getByRole('group', { name: 'Masa' }).getByRole('button', { name: /4:00 hingga 6:00 petang/ });
  await expect(petang).toContainText('Penuh');
  await expect(petang).toBeDisabled();
  await page.getByRole('button', { name: 'Tambah Lilin set 3 batang' }).click();
  await expect(page.getByTestId('pratonton')).toContainText('Lilin set 3 batang x1 (RM7.00)');
});

test('nombor WhatsApp sah diselaraskan ke laman', async ({ page }) => {
  await masukAdmin(page);
  await page.goto('/admin/tetapan');
  await page.getByLabel('Nombor WhatsApp kedai').fill('60198765432');
  await page.getByRole('button', { name: 'Simpan tetapan' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Tetapan disimpan' })).toBeVisible();
  const [h] = await db.select().from(s.siteContent).where(eq(s.siteContent.key, 'hubungi'));
  expect((h.value as { whatsapp: string }).whatsapp).toBe('60198765432');
  await page.goto('/');
  await expect(page.getByRole('link', { name: /WhatsApp sekarang/ })).toHaveAttribute('href', /wa\.me\/60198765432/);
});

test('caj hantar: ditetapkan di admin, dipapar dan ditambah dalam jumlah senarai', async ({ page }) => {
  await masukAdmin(page);
  await page.goto('/admin/tetapan');
  await page.getByLabel('Caj hantar ke Kuantan (RM)').fill('10');
  await page.getByLabel('Caj hantar ke Pekan (RM)').fill('15');
  await page.getByRole('button', { name: 'Simpan tetapan' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Tetapan disimpan' })).toBeVisible();

  await kekDalamSenarai(page);
  await page.getByRole('group', { name: 'Cara terima' }).getByRole('button', { name: /Penghantaran/ }).click();
  await page.getByRole('group', { name: 'Kawasan' }).getByRole('button', { name: /Pekan/ }).click();
  await expect(page.getByRole('group', { name: 'Kawasan' }).getByRole('button', { name: /Pekan/ })).toContainText('RM 15.00');
  await expect(page.getByTestId('jumlah').first()).toContainText('RM 115.00');
  await expect(page.getByTestId('pratonton')).toContainText('Caj hantar ke Pekan: RM15.00');

  await page.goto('/kek/italian-cake');
  await expect(page.getByText(/Pekan \(RM 15\.00\)/)).toBeAttached();
});
