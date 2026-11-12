import { expect, test } from '@playwright/test';
import { count, eq } from 'drizzle-orm';
import { db, skema as s } from '../../lib/data/db';
import { hariIniMYT, tambahHari } from '../../lib/tempahan/tarikh';
import { dataMula } from './bantu';
import { masukAdmin, sediaAdmin } from './bantu-admin';

const hari = (n: number) => tambahHari(hariIniMYT(new Date()), n);
let ids: Record<string, string> = {};

test.beforeEach(async ({ request }) => {
  await dataMula(request);
  await sediaAdmin();
  const [italian] = await db.select().from(s.product).where(eq(s.product.slug, 'italian-cake'));
  const [brownies] = await db.select().from(s.product).where(eq(s.product.slug, 'brownies-plain'));
  const [slot] = await db.select().from(s.timeSlot).where(eq(s.timeSlot.label, '10:00 hingga 12:00 pagi'));
  const asas = { token: 't', waMessage: 'm', ipHash: '-', addonSubtotalSen: 0 };
  const rows = await db
    .insert(s.order)
    .values([
      { ...asas, ref: 'YK-24101', kind: 'LIST', status: 'BARU_WA', customerName: 'Nur Aisyah', phone: '60123456789', mode: 'DELIVERY', area: 'Kuantan', address: 'No 1, Jalan Besar, Kuantan', date: hari(5), timeSlotId: slot.id, cakeSubtotalSen: 10000, totalSen: 10000, dedupeKey: 'a' },
      { ...asas, ref: 'YK-24102', kind: 'LIST', status: 'BARU_WA', customerName: 'Lama Sekali', phone: '60111111111', mode: 'PICKUP', date: hari(6), timeSlotId: slot.id, cakeSubtotalSen: 4500, totalSen: 4500, dedupeKey: 'b', createdAt: new Date(Date.now() - 3 * 86400_000) },
      { ...asas, ref: 'YK-24103', kind: 'QUICK', status: 'BARU_WA', cakeSubtotalSen: 4500, totalSen: 4500, dedupeKey: 'c' },
      { ...asas, ref: 'YK-24200', kind: 'LIST', status: 'DISAHKAN', customerName: 'Siti', phone: '60122222222', mode: 'PICKUP', date: hari(4), timeSlotId: slot.id, cakeSubtotalSen: 4500, totalSen: 4500, dedupeKey: 'd' },
    ])
    .returning({ id: s.order.id, ref: s.order.ref });
  ids = Object.fromEntries(rows.map((r) => [r.ref, r.id]));
  await db.insert(s.orderItem).values([
    { orderId: ids['YK-24101'], productId: italian.id, productName: 'Italian Cake', sizeLabel: '6 inci', unitPriceSen: 10000, qty: 1 },
    { orderId: ids['YK-24102'], productId: brownies.id, productName: 'Brownies Plain', sizeLabel: '7 inci', unitPriceSen: 4500, qty: 1 },
    { orderId: ids['YK-24103'], productId: brownies.id, productName: 'Brownies Plain', sizeLabel: '7 inci', unitPriceSen: 4500, qty: 1 },
    { orderId: ids['YK-24200'], productId: brownies.id, productName: 'Brownies Plain', sizeLabel: '7 inci', unitPriceSen: 4500, qty: 1 },
  ]);
});

const baris = (page: import('@playwright/test').Page) => page.getByRole('region', { name: 'Senarai tempahan' }).getByRole('link');

test('papan pemuka: bilangan baru hari ini dan tempahan cepat belum lengkap', async ({ page }) => {
  await masukAdmin(page);
  await expect(page.getByTestId('kpi-baru')).toHaveText('3');
  await expect(page.getByTestId('kpi-cepat')).toHaveText('1');
  const dekat = page.getByRole('region', { name: 'Tempahan 7 hari akan datang' });
  await expect(dekat).toContainText('YK-24200');
  await expect(dekat).not.toContainText('YK-24102');
});

test('senarai: cari, tapis status, tunjuk semua, keadaan kosong', async ({ page }) => {
  await masukAdmin(page);
  await page.goto('/admin/tempahan');
  await page.getByRole('searchbox', { name: 'Cari tempahan' }).fill('YK-241');
  await page.getByRole('searchbox', { name: 'Cari tempahan' }).press('Enter');
  await expect(baris(page)).toHaveCount(2);
  await expect(baris(page).filter({ hasText: 'YK-24102' })).toHaveCount(0);
  await page.getByRole('link', { name: /Tunjuk semua/ }).click();
  await expect(baris(page)).toHaveCount(3);

  await page.goto('/admin/tempahan');
  await page.getByRole('navigation', { name: 'Tapis status' }).getByRole('link', { name: /^Disahkan/ }).click();
  await expect(baris(page)).toHaveCount(1);
  await expect(baris(page).first()).toContainText('YK-24200');
  await page.getByRole('navigation', { name: 'Tapis status' }).getByRole('link', { name: /^Selesai/ }).click();
  await expect(page.getByText('Tiada tempahan dengan status ini.')).toBeVisible();
});

test('butiran: caj hantar, tukar status (audit), balas di WhatsApp', async ({ page }) => {
  await masukAdmin(page);
  await page.goto(`/admin/tempahan/${ids['YK-24101']}`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('YK-24101');
  await expect(page.getByText('Italian Cake')).toBeVisible();
  await page.getByLabel('Caj penghantaran (RM)').fill('15');
  await page.getByRole('button', { name: 'Simpan caj' }).click();
  await expect(page.getByTestId('jumlah')).toHaveText('RM 115.00');

  const sebelum = (await db.select({ n: count() }).from(s.auditLog))[0].n;
  await page.getByLabel('Tukar status').selectOption('DISAHKAN');
  await page.getByRole('button', { name: 'Kemas kini status' }).click();
  await expect(page.getByTestId('status')).toHaveText('Disahkan');
  expect((await db.select({ n: count() }).from(s.auditLog))[0].n).toBeGreaterThan(sebelum);
  await expect(page.getByRole('region', { name: 'Sejarah perubahan' })).toContainText('Status');

  const balas = page.getByRole('link', { name: /Balas di WhatsApp/ });
  await expect(balas).toHaveAttribute('href', /^https:\/\/wa\.me\/60123456789\?text=.*YK-24101/);

  await page.getByRole('button', { name: 'Tandakan sudah bayar' }).click();
  await expect(page.getByText(/Dibayar/).first()).toBeVisible();
});

test('tempahan cepat: isi tarikh ke hari penuh ditolak', async ({ page }) => {
  await db.update(s.settings).set({ dailyCapacity: 1 });
  await masukAdmin(page);
  await page.goto(`/admin/tempahan/${ids['YK-24103']}`);
  await expect(page.getByText('Tempahan cepat')).toBeVisible();
  await page.getByLabel('Tarikh').fill(hari(4));
  await page.getByLabel('Slot masa').selectOption({ label: '2:00 hingga 4:00 petang' });
  await page.getByLabel('Nama pelanggan').fill('Pelanggan Cepat');
  await page.getByRole('button', { name: 'Simpan butiran' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Slot ini penuh' })).toBeVisible();
  const [o] = await db.select().from(s.order).where(eq(s.order.id, ids['YK-24103']));
  expect(o.date).toBeNull();

  await page.getByLabel('Tarikh').fill(hari(8));
  await page.getByRole('button', { name: 'Simpan butiran' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Butiran disimpan' })).toBeVisible();
  const [o2] = await db.select().from(s.order).where(eq(s.order.id, ids['YK-24103']));
  expect(o2.date).toBe(hari(8));
  expect(o2.customerName).toBe('Pelanggan Cepat');
});

test('papan pemuka: hari ini dan esok, status sekali tekan', async ({ page }) => {
  await db.update(s.order).set({ date: hari(0) }).where(eq(s.order.ref, 'YK-24200'));
  await masukAdmin(page);
  const senarai = page.getByRole('list', { name: 'Tempahan hari ini dan esok' });
  await expect(senarai).toContainText('YK-24200');
  await expect(senarai).toContainText('Hari ini');
  await senarai.getByRole('button', { name: 'Mula sediakan, YK-24200' }).click();
  await expect(senarai.getByRole('button', { name: 'Sedia diambil, YK-24200' })).toBeVisible();
  const [o] = await db.select().from(s.order).where(eq(s.order.ref, 'YK-24200'));
  expect(o.status).toBe('DALAM_PENYEDIAAN');
});
