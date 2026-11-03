import { expect, test } from '@playwright/test';
import { dataMula } from './bantu';
import { KATA_LALUAN, masukAdmin, PEMILIK, sediaAdmin, TANPA_PROFIL } from './bantu-admin';

test.beforeEach(async ({ request }) => {
  await dataMula(request);
  await sediaAdmin();
});

test('/admin tanpa sesi → halaman log masuk', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test('kata laluan salah 5 kali → disekat 15 minit', async ({ page }) => {
  await page.goto('/admin/login');
  await page.getByLabel('Emel').fill(PEMILIK.email);
  for (let i = 1; i <= 5; i++) {
    await page.getByLabel('Kata laluan').fill(`salah-${i}`);
    await Promise.all([page.waitForResponse((r) => r.request().method() === 'POST'), page.getByRole('button', { name: 'Log masuk' }).click()]);
    const jangka = i < 5 ? 'Emel atau kata laluan salah.' : 'Cuba lagi selepas 15 minit';
    await expect(page.getByRole('alert').filter({ hasText: jangka })).toBeVisible();
  }
  // Kata laluan betul pun ditolak semasa disekat.
  await page.getByLabel('Kata laluan').fill(KATA_LALUAN);
  await Promise.all([page.waitForResponse((r) => r.request().method() === 'POST'), page.getByRole('button', { name: 'Log masuk' }).click()]);
  await expect(page.getByRole('alert').filter({ hasText: 'Cuba lagi selepas 15 minit' })).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test('log masuk betul → papan pemuka dengan sidebar, kemudian log keluar', async ({ page }) => {
  await masukAdmin(page);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Papan pemuka');
  const menu = page.getByRole('complementary', { name: 'Menu admin' });
  for (const n of ['Papan pemuka', 'Tempahan', 'Produk', 'Gambar meja kek', 'Kandungan laman', 'Soalan lazim', 'Tetapan']) {
    await expect(menu.getByRole('link', { name: n })).toBeVisible();
  }
  await expect(menu.getByRole('link', { name: 'Papan pemuka' })).toHaveAttribute('aria-current', 'page');
  // Kuki sesi httpOnly.
  const kuki = (await page.context().cookies()).filter((c) => c.name.startsWith('sb-'));
  expect(kuki.length).toBeGreaterThan(0);
  expect(kuki.every((c) => c.httpOnly)).toBe(true);

  await page.getByRole('button', { name: 'Log keluar' }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test('pengguna Supabase tanpa profil admin ditolak', async ({ page }) => {
  await page.goto('/admin/login');
  await page.getByLabel('Emel').fill(TANPA_PROFIL.email);
  await page.getByLabel('Kata laluan').fill(KATA_LALUAN);
  await page.getByRole('button', { name: 'Log masuk' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'tiada akses admin' })).toBeVisible();
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test('server action admin tanpa sesi → 401', async ({ request }) => {
  const r = await request.post('/admin/tempahan', { headers: { 'Next-Action': 'apa-apa', 'Content-Type': 'text/plain;charset=UTF-8' }, data: '[]' });
  expect(r.status()).toBe(401);
});
