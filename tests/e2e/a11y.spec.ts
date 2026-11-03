import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { dataMula } from './bantu';
import { masukAdmin, sediaAdmin } from './bantu-admin';

test.beforeEach(async ({ page, request }) => {
  await dataMula(request);
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

async function tiadaIsuSerius(page: Page) {
  const r = await new AxeBuilder({ page }).analyze();
  const teruk = r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(teruk.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
}

for (const laluan of ['/', '/koleksi', '/kek/italian-cake', '/senarai', '/semak', '/reka']) {
  test(`kedai ${laluan}: tiada isu aksesibiliti serius`, async ({ page }) => {
    if (laluan === '/senarai') {
      await page.goto('/kek/italian-cake');
      await page.getByRole('button', { name: /^Tambah ke senarai/ }).click();
    }
    await page.goto(laluan);
    await tiadaIsuSerius(page);
  });
}

for (const laluan of ['/admin/login', '/admin', '/admin/tempahan', '/admin/produk', '/admin/kandungan', '/admin/soalan', '/admin/tetapan', '/admin/meja']) {
  test(`admin ${laluan}: tiada isu aksesibiliti serius`, async ({ page }) => {
    await sediaAdmin();
    if (laluan !== '/admin/login') await masukAdmin(page);
    await page.goto(laluan);
    await tiadaIsuSerius(page);
  });
}
