import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { desc, eq } from 'drizzle-orm';
import { db, skema as s } from '../../lib/data/db';
import { dataMula } from './bantu';
import { pintasWhatsApp, urlDibuka } from './bantu-wa';

test.beforeEach(async ({ request }) => {
  await dataMula(request);
});

const kad = (page: Page) => page.getByRole('region', { name: 'Senarai kek' }).getByRole('article');
// Phone: "Senarai tempahan, N kek"; desktop: "Senarai (N)". Hanya satu kelihatan.
const bil = (page: Page) => page.getByRole('link', { name: /^Senarai( tempahan, \d+ kek| \(\d+\))$/ });
const bilDua = /^Senarai( tempahan, 2 kek| \(2\))$/;

test.describe('koleksi', () => {
  test('carian, tapis kategori, susun dan keadaan kosong', async ({ page }) => {
    await page.goto('/koleksi');
    await expect(kad(page)).toHaveCount(33);

    await page.getByRole('searchbox', { name: 'Cari kek' }).fill('batik');
    await expect(kad(page)).toHaveCount(8);
    for (const n of await kad(page).getByRole('heading').allInnerTexts()) expect(n).toMatch(/batik/i);

    await page.getByRole('searchbox', { name: 'Cari kek' }).fill('');
    await page.getByRole('button', { name: /^Kek kahwin/ }).click();
    await expect(kad(page)).toHaveCount(5);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Kek kahwin');

    await page.getByRole('button', { name: /^Semua \d+$/ }).click();
    await page.getByLabel('Susun').selectOption({ label: 'Harga rendah ke tinggi' });
    await expect(kad(page).first()).toContainText('dari RM 45.00');

    await page.getByRole('searchbox', { name: 'Cari kek' }).fill('xyz');
    await expect(kad(page)).toHaveCount(0);
    await expect(page.getByText('Tiada kek sepadan', { exact: false })).toBeVisible();
    await page.getByRole('button', { name: 'Kosongkan tapisan' }).click();
    await expect(kad(page)).toHaveCount(33);
    await expect(page.getByRole('searchbox', { name: 'Cari kek' })).toHaveValue('');
  });

  test('kategori dari pautan laman utama', async ({ page }) => {
    await page.goto('/koleksi?kategori=kek-kahwin');
    await expect(kad(page)).toHaveCount(5);
    await expect(page.getByRole('button', { name: /^Kek kahwin/ })).toHaveAttribute('aria-pressed', 'true');
  });

  test('kad memaut ke halaman kek', async ({ page }) => {
    await page.goto('/koleksi');
    await kad(page).filter({ hasText: 'Italian Cake' }).first().getByRole('link', { name: 'Italian Cake', exact: true }).first().click();
    await expect(page).toHaveURL(/\/kek\/italian-cake$/);
  });

  test('tiada isu aksesibiliti serius', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/koleksi');
    const r = await new AxeBuilder({ page }).analyze();
    expect(r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id)).toEqual([]);
  });
});

test.describe('halaman kek', () => {
  test('saiz, harga, tambah ke senarai', async ({ page }) => {
    await page.goto('/kek/italian-cake');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Italian Cake');
    const saiz = page.getByRole('group', { name: 'Saiz' }).getByRole('button');
    await expect(saiz).toHaveCount(3);
    await saiz.filter({ hasText: '10 inci' }).click();
    await expect(page.getByTestId('harga')).toHaveText('RM 380.00');
    await page.getByRole('button', { name: 'Tambah kuantiti' }).click();
    await expect(page.getByTestId('harga')).toHaveText('RM 760.00');

    await page.getByRole('button', { name: /Tambah ke senarai/ }).click();
    await expect(bil(page)).toHaveAccessibleName(bilDua);
    await expect(page.getByRole('button', { name: /Dalam senarai/ })).toBeVisible();
    await page.reload();
    await expect(bil(page)).toHaveAccessibleName(bilDua);
  });

  test('tempah di WhatsApp mencipta rekod QUICK', async ({ page }) => {
    await pintasWhatsApp(page);
    await page.goto('/kek/italian-cake');
    await page.getByRole('group', { name: 'Saiz' }).getByRole('button', { name: /8 inci/ }).click();
    await page.getByLabel('Tulisan atas kek (pilihan)').fill('Selamat Pengantin Baru');
    await page.getByRole('button', { name: /Tempah di WhatsApp/ }).click();
    await expect(page).toHaveURL(/\/tempahan\/YK-\d+\?t=/);
    const [o] = await db.select().from(s.order).orderBy(desc(s.order.createdAt)).limit(1);
    expect(o.kind).toBe('QUICK');
    expect(o.totalSen).toBe(28000);
    const [i] = await db.select().from(s.orderItem).where(eq(s.orderItem.orderId, o.id));
    expect(i.cakeMessage).toBe('Selamat Pengantin Baru');
    const wa = await urlDibuka(page);
    expect(wa.at(-1)).toContain('https://wa.me/601123023447?text=');
    expect(decodeURIComponent(wa.at(-1)!)).toContain(o.ref);
  });

  test('slug tidak wujud → 404', async ({ page }) => {
    const r = await page.goto('/kek/tiada-kek-ini');
    expect(r?.status()).toBe(404);
  });

  test('tiada isu aksesibiliti serius', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/kek/italian-cake');
    const r = await new AxeBuilder({ page }).analyze();
    expect(r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id)).toEqual([]);
  });
});
