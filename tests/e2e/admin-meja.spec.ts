import { expect, test } from '@playwright/test';
import { eq } from 'drizzle-orm';
import { db, skema as s } from '../../lib/data/db';
import { dataMula } from './bantu';
import { masukAdmin, sediaAdmin } from './bantu-admin';

let id = '';
let urlAsal = '';
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
const baca = async () => (await db.select().from(s.product).where(eq(s.product.id, id)))[0];

test.beforeEach(async ({ page, request }) => {
  await dataMula(request);
  await sediaAdmin();
  const [p] = await db.select().from(s.product).where(eq(s.product.slug, 'italian-cake'));
  id = p.id;
  urlAsal = p.tableImageUrl!;
  // Ganti model buang latar dengan potongan siap (gambar meja seed).
  await page.addInitScript(() => {
    (window as unknown as { __ykBuangLatar: (f: Blob) => Promise<Blob> }).__ykBuangLatar = async () => (await fetch('/seed/cut_09.webp')).blob();
  });
});

test('muat naik → pratonton → hakis → simpan draf → terbit → pulih', async ({ page }) => {
  await masukAdmin(page);
  await page.goto(`/admin/produk/${id}`);
  await expect(page.getByRole('img', { name: 'Pratonton di meja kek' })).toBeVisible();
  const sebelum = await page.getByTestId('gambar-meja').getAttribute('src');
  expect(sebelum).toBe(urlAsal);

  await page.locator('#gambar-meja-input').setInputFiles({ name: 'kek.png', mimeType: 'image/png', buffer: PNG });
  await expect(page.getByLabel(/Kemaskan tepi/)).toBeVisible();
  await expect(page.getByTestId('gambar-meja')).toHaveAttribute('src', /^blob:/);
  await page.getByLabel(/Kemaskan tepi/).fill('3');
  await expect(page.getByText('Kemaskan tepi (3 px)')).toBeVisible();

  await page.getByRole('button', { name: 'Simpan gambar meja' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'disimpan sebagai draf' })).toBeVisible();
  const draf = (await baca()).tableImageDraftUrl;
  expect(draf).toMatch(/^\/api\/fail\/meja\/.+\.webp$/);
  expect((await baca()).tableImageUrl).toBe(urlAsal);

  await page.getByRole('button', { name: 'Terbitkan gambar meja' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'diterbitkan' })).toBeVisible();
  const p = await baca();
  expect(p.tableImageUrl).toBe(draf);
  expect(p.tableImageOriginalUrl).toBe(urlAsal);
  const laman = await (await page.request.get('/')).text();
  expect(laman).toContain(encodeURIComponent(draf!));

  await page.getByRole('button', { name: 'Guna gambar sebelum ini' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'dipulihkan' })).toBeVisible();
  expect((await baca()).tableImageUrl).toBe(urlAsal);
});

test('fail HEIC ditolak dengan panduan', async ({ page }) => {
  await masukAdmin(page);
  await page.goto(`/admin/produk/${id}`);
  await page.locator('#gambar-meja-input').setInputFiles({ name: 'IMG_0001.heic', mimeType: 'image/heic', buffer: Buffer.from('heic') });
  await expect(page.getByRole('alert').filter({ hasText: 'Tukar gambar ke JPG atau PNG dahulu' })).toBeVisible();
});

test('halaman gambar meja: senarai ikut kedudukan', async ({ page }) => {
  await masukAdmin(page);
  await page.goto('/admin/meja');
  const k = page.getByRole('list', { name: 'Kek di meja' }).getByRole('listitem');
  await expect(k).toHaveCount(8);
  await expect(k.first()).toContainText('1.');
});
