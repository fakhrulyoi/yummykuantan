import { expect, test } from '@playwright/test';
import { eq } from 'drizzle-orm';
import { db, skema as s } from '../../lib/data/db';
import { dataMula } from './bantu';
import { masukAdmin, sediaAdmin, STAF } from './bantu-admin';

let idItalian = '';
test.beforeEach(async ({ request }) => {
  await dataMula(request);
  await sediaAdmin();
  idItalian = (await db.select().from(s.product).where(eq(s.product.slug, 'italian-cake')))[0].id;
});

const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');

test('ubah harga: draf tidak mengubah laman, terbit mengubah', async ({ page }) => {
  await masukAdmin(page);
  await page.goto('/admin/produk');
  await page.getByRole('region', { name: 'Senarai produk' }).getByRole('link', { name: /^Italian Cake Italian cake/ }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Italian Cake');
  await page.getByLabel('Harga 6 inci').fill('110');
  await page.getByRole('button', { name: 'Simpan draf' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Draf disimpan' })).toBeVisible();

  await page.goto('/kek/italian-cake');
  await expect(page.getByTestId('harga')).toHaveText('RM 100.00');

  await page.goto(`/admin/produk/${idItalian}`);
  await expect(page.getByLabel('Harga 6 inci')).toHaveValue('110.00');
  await page.getByRole('button', { name: 'Terbitkan' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Diterbitkan' })).toBeVisible();
  await page.goto('/kek/italian-cake');
  await expect(page.getByTestId('harga')).toHaveText('RM 110.00');
});

test('muat naik: PDF ditolak, gambar diterima', async ({ page }) => {
  await masukAdmin(page);
  await page.goto(`/admin/produk/${idItalian}`);
  const input = page.locator('#tambah-gambar');
  await input.setInputFiles({ name: 'menu.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4') });
  await expect(page.getByRole('alert').filter({ hasText: 'Hanya gambar' })).toBeVisible();
  const sebelum = await page.getByRole('list', { name: /Gambar \(seret/ }).getByRole('listitem').count();
  await input.setInputFiles({ name: 'kek.png', mimeType: 'image/png', buffer: PNG });
  await expect(page.getByRole('list', { name: /Gambar \(seret/ }).getByRole('listitem')).toHaveCount(sebelum + 1);
  const img = page.getByRole('img', { name: `Italian Cake, gambar ${sebelum}` });
  await expect(img).toBeVisible();
});

test('muat naik tanpa sesi → 401', async ({ request }) => {
  const r = await request.post('/api/upload', { data: { bucket: 'produk', jenis: 'image/png', saiz: 10 } });
  expect(r.status()).toBe(401);
});

test('staf tidak nampak Padam produk; pemilik nampak', async ({ page }) => {
  await masukAdmin(page, STAF.email);
  await page.goto(`/admin/produk/${idItalian}`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Italian Cake');
  await expect(page.getByRole('button', { name: 'Padam produk' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Log keluar' }).click();
  await masukAdmin(page);
  await page.goto(`/admin/produk/${idItalian}`);
  await expect(page.getByRole('button', { name: 'Padam produk' })).toBeVisible();
});

test('tambah produk baru: tidak aktif sehingga diterbitkan', async ({ page }) => {
  await masukAdmin(page);
  await page.goto('/admin/produk');
  await page.getByRole('button', { name: 'Tambah produk' }).click();
  await expect(page).toHaveURL(/\/admin\/produk\/[0-9a-f-]{36}$/);
  await page.getByLabel('Nama kek').fill('Kek Pisang Ujian');
  await page.getByLabel('Nama saiz 1').fill('8 inci');
  await page.getByLabel('Harga 8 inci').fill('60');
  await page.getByRole('switch', { name: /Aktif di laman/ }).click();
  await page.getByRole('button', { name: 'Terbitkan' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Diterbitkan' })).toBeVisible();
  await page.goto('/koleksi');
  await page.getByRole('searchbox', { name: 'Cari kek' }).fill('pisang ujian');
  await expect(page.getByRole('region', { name: 'Senarai kek' }).getByRole('article')).toHaveCount(1);
});
