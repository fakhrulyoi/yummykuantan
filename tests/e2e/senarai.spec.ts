import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { count, eq } from 'drizzle-orm';
import { db, skema as s } from '../../lib/data/db';
import { dataMula, segarkan } from './bantu';
import { pintasWhatsApp, urlDibuka } from './bantu-wa';

test.beforeEach(async ({ request }) => {
  await dataMula(request);
});

async function tambahKek(page: Page, slug: string, saiz?: RegExp) {
  await page.goto(`/kek/${slug}`);
  if (saiz) await page.getByRole('group', { name: 'Saiz' }).getByRole('button', { name: saiz }).click();
  await page.getByRole('button', { name: /^Tambah ke senarai/ }).click();
  await expect(page.getByRole('button', { name: /^Dalam senarai/ })).toBeVisible();
}

async function isiBorang(page: Page, o: { nama?: string; telefon?: string } = {}) {
  await page.getByRole('button', { name: 'Tambah Lilin set 3 batang' }).click();
  await page.getByRole('group', { name: 'Cara terima' }).getByRole('button', { name: /Penghantaran/ }).click();
  await page.getByRole('group', { name: 'Kawasan' }).getByRole('button', { name: 'Pekan' }).click();
  await page.getByLabel('Alamat penuh').fill('No 12, Jalan Sultan Abu Bakar, Pekan');
  await page.getByRole('group', { name: 'Tarikh' }).getByRole('button', { disabled: false }).first().click();
  await page.getByRole('group', { name: 'Masa' }).getByRole('button', { name: /2:00 hingga 4:00 petang/ }).click();
  if (o.nama !== '') await page.getByLabel('Nama').fill(o.nama ?? 'Nur Aisyah');
  if (o.telefon !== '') await page.getByLabel('Nombor telefon').fill(o.telefon ?? '012 345 6789');
}

const butangHantar = (page: Page) => page.getByRole('button', { name: /^Hantar.*di WhatsApp/ });
const bilTempahan = async () => (await db.select({ n: count() }).from(s.order))[0].n;

test('aliran penuh: dua kek, lilin, hantar ke Pekan', async ({ page }) => {
  await pintasWhatsApp(page);
  await tambahKek(page, 'italian-cake');
  await tambahKek(page, 'brownies-plain');
  await page.goto('/senarai');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Senarai tempahan');
  await expect(page.getByRole('list', { name: 'Kek dalam senarai' }).getByRole('listitem')).toHaveCount(2);
  await isiBorang(page);

  const pratonton = page.getByTestId('pratonton');
  await expect(pratonton).toContainText('Lilin set 3 batang x1 (RM6.00)');
  await expect(pratonton).toContainText('Hantar ke Pekan');
  await expect(pratonton).toContainText('Nama: Nur Aisyah');

  await butangHantar(page).click();
  await expect(page).toHaveURL(/\/tempahan\/YK-\d+\?t=[0-9a-f]+/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Tekan hantar di WhatsApp');
  await expect(page.getByRole('link', { name: /Buka WhatsApp semula/ })).toHaveAttribute('href', /^https:\/\/wa\.me\/601123023447\?text=/);
  await expect(page.getByRole('button', { name: 'Salin mesej' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Semak status/ })).toBeVisible();
  expect((await urlDibuka(page)).at(-1)).toContain('wa.me/601123023447');
  // Senarai dikosongkan selepas berjaya.
  await page.goto('/senarai');
  await expect(page.getByText('Senarai kosong.')).toBeVisible();
});

test('tanpa nama dan tanpa telefon: ralat di sebelah medan, tiada rekod', async ({ page }) => {
  await tambahKek(page, 'italian-cake');
  await page.goto('/senarai');
  await isiBorang(page, { nama: '', telefon: '' });
  await butangHantar(page).click();
  await expect(page.locator('#ralat-nama')).toHaveText('Sila isi nama');
  await expect(page.locator('#ralat-telefon')).toHaveText('Sila isi nombor telefon');
  await expect(page.getByLabel('Nama')).toHaveAttribute('aria-invalid', 'true');
  expect(await bilTempahan()).toBe(0);
  await expect(page).toHaveURL(/\/senarai$/);
});

test('senarai kosong', async ({ page }) => {
  await page.goto('/senarai');
  await expect(page.getByText('Senarai kosong.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Lihat koleksi' }).first()).toHaveAttribute('href', '/koleksi');
});

test('harga berubah sebelum hantar: notis, jumlah baru, tekan sekali lagi', async ({ page }) => {
  await pintasWhatsApp(page);
  await tambahKek(page, 'italian-cake');
  await page.goto('/senarai');
  await isiBorang(page);
  await expect(page.getByTestId('jumlah').first()).toContainText('RM 106.00');
  const [z] = await db
    .select({ id: s.productSize.id })
    .from(s.productSize)
    .innerJoin(s.product, eq(s.product.id, s.productSize.productId))
    .where(eq(s.product.slug, 'italian-cake'))
    .orderBy(s.productSize.sortOrder)
    .limit(1);
  await db.update(s.productSize).set({ priceSen: 12000 }).where(eq(s.productSize.id, z.id));
  await butangHantar(page).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Harga dikemas kini' })).toBeVisible();
  await expect(page.getByTestId('jumlah').first()).toContainText('RM 126.00');
  await expect(page).toHaveURL(/\/senarai$/);
  expect(await urlDibuka(page)).toEqual([]);
  await butangHantar(page).click();
  await expect(page).toHaveURL(/\/tempahan\/YK-\d+\?t=/);
  expect(await bilTempahan()).toBe(1);
});

test('kek dinyahaktif dibuang dari senarai dengan notis', async ({ page, request }) => {
  await tambahKek(page, 'italian-cake');
  await tambahKek(page, 'brownies-plain');
  await db.update(s.product).set({ active: false }).where(eq(s.product.slug, 'brownies-plain'));
  await segarkan(request);
  await page.goto('/senarai');
  await expect(page.getByRole('status').filter({ hasText: 'Kek ini tidak lagi ditawarkan' })).toBeVisible();
  await expect(page.getByRole('list', { name: 'Kek dalam senarai' }).getByRole('listitem')).toHaveCount(1);
});

test('slot penuh semasa hantar: mesej, medan lain kekal', async ({ page }) => {
  await tambahKek(page, 'italian-cake');
  await page.goto('/senarai');
  await isiBorang(page);
  const tarikh = await page.getByRole('group', { name: 'Tarikh' }).getByRole('button', { pressed: true }).getAttribute('data-tarikh');
  const [slot] = await db.select().from(s.timeSlot).where(eq(s.timeSlot.label, '2:00 hingga 4:00 petang'));
  await db.insert(s.order).values(
    Array.from({ length: slot.capacity }, (_, i) => ({
      ref: `YK-9${String(i).padStart(4, '0')}`, token: 'x', kind: 'LIST' as const, date: tarikh!, timeSlotId: slot.id, status: 'DISAHKAN' as const,
      cakeSubtotalSen: 100, totalSen: 100, waMessage: '-', ipHash: '-', dedupeKey: `-${i}`,
    })),
  );
  await butangHantar(page).click();
  await expect(page.getByRole('alert').filter({ hasText: /^Slot ini baru penuh\. Pilih slot lain\.$/ })).toBeVisible();
  await expect(page.getByLabel('Nama')).toHaveValue('Nur Aisyah');
  await expect(page.getByLabel('Alamat penuh')).toHaveValue('No 12, Jalan Sultan Abu Bakar, Pekan');
});

test('server gagal: butang WhatsApp terus', async ({ page }) => {
  await pintasWhatsApp(page);
  await tambahKek(page, 'italian-cake');
  await page.goto('/senarai');
  await isiBorang(page);
  await page.route('**/senarai', (r) => (r.request().method() === 'POST' ? r.fulfill({ status: 500, body: 'ralat' }) : r.continue()));
  await butangHantar(page).click();
  const terus = page.getByRole('link', { name: /WhatsApp terus/ });
  await expect(terus).toBeVisible();
  await expect(terus).toHaveAttribute('href', /^https:\/\/wa\.me\/601123023447\?text=Salam/);
});

test('halaman selepas tempah perlukan token', async ({ page }) => {
  const r = await page.goto('/tempahan/YK-24100');
  expect(r?.status()).toBe(404);
  const r2 = await page.goto('/tempahan/YK-24100?t=salah');
  expect(r2?.status()).toBe(404);
});

test('senarai: tiada isu aksesibiliti serius', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await tambahKek(page, 'italian-cake');
  await page.goto('/senarai');
  await isiBorang(page);
  const r = await new AxeBuilder({ page }).analyze();
  expect(r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([]);
});
