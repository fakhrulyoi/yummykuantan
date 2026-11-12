import { expect, test } from '@playwright/test';
import { pintasWhatsApp, urlDibuka } from './bantu-wa';

import { dataMula } from './bantu';

test.beforeEach(async ({ request }) => {
  await dataMula(request);
});

test.describe('meja kek', () => {
  test('desktop: hover, buka dialog, Esc pulangkan fokus', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop');
    await page.goto('/');
    const meja = page.getByRole('group', { name: /Meja kek/ });
    const kek = meja.getByRole('button', { name: /Tall Cake Italian/ });
    await kek.hover();
    await expect(kek).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[aria-live="polite"]:visible')).toContainText('Tall Cake Italian');
    await kek.click();
    const d = page.getByRole('dialog');
    await expect(d).toBeVisible();
    await expect(d).toContainText('RM 250.00');
    await page.keyboard.press('Escape');
    await expect(d).toBeHidden();
    await expect(kek).toBeFocused();
  });

  test('desktop: papan kekunci', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const meja = page.getByRole('group', { name: /Meja kek/ });
    // Tunggu hidrasi: ulang sehingga kekunci diproses oleh React.
    await expect(async () => {
      await meja.getByRole('button', { name: /^Italian Cake,/ }).focus();
      await page.keyboard.press('End');
      await expect(meja.getByRole('button', { name: /Brownies Tower/ })).toHaveAttribute('aria-pressed', 'true', { timeout: 500 });
    }).toPass({ timeout: 8000 });
    await expect(meja.getByRole('button', { name: /Brownies Tower/ })).toBeFocused();
    await page.keyboard.press('Home');
    await expect(meja.getByRole('button', { name: /^Italian Cake,/ })).toBeFocused();
  });

  test('phone: sapu, pilih saiz, pilih tarikh, tempah di WhatsApp', async ({ page }, info) => {
    test.skip(info.project.name !== 'phone');
    await pintasWhatsApp(page);
    await page.goto('/');
    const pentas = page.getByRole('group', { name: /Meja kek/ });
    await pentas.scrollIntoViewIfNeeded();
    await pentas.dispatchEvent('pointerdown', { clientX: 300, clientY: 300, pointerId: 1, pointerType: 'touch', isPrimary: true });
    await pentas.dispatchEvent('pointerup', { clientX: 140, clientY: 300, pointerId: 1, pointerType: 'touch', isPrimary: true });
    await expect(pentas.getByRole('button', { name: /2 Tier Wedding Cake/ })).toHaveAttribute('aria-pressed', 'true');

    await pentas.getByRole('button', { name: 'Kek sebelum' }).click();
    await expect(pentas.getByRole('button', { name: /^Italian Cake,/ })).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: 'Lihat kek ini' }).click();
    const d = page.getByRole('dialog');
    await expect(d).toBeVisible();
    await d.getByRole('button', { name: /8 inci/ }).click();
    await expect(d).toContainText('RM 280.00');
    await d.getByRole('link', { name: /Pilih tarikh dan tempah/ }).click();
    await expect(page).toHaveURL(/\/kek\/italian-cake\?saiz=.+#tempah$/);
    await expect(page.getByRole('group', { name: 'Saiz' }).getByRole('button', { name: /8 inci/ })).toHaveAttribute('aria-pressed', 'true');
    // Tanpa tarikh: diminta pilih tarikh dahulu.
    await page.getByRole('button', { name: /Tempah di WhatsApp/ }).click();
    await expect(page.getByRole('alert').filter({ hasText: 'Pilih tarikh dahulu.' })).toBeVisible();
    await page.getByRole('group', { name: 'Tarikh' }).getByRole('button', { disabled: false }).first().click();
    await page.getByRole('button', { name: /Tempah di WhatsApp/ }).click();
    await page.waitForURL(/\/tempahan\/YK-\d+\?t=/);
    const dibuka = await urlDibuka(page);
    expect(dibuka.some((u) => u.startsWith('https://wa.me/601123023447?text=') && decodeURIComponent(u).includes('YK-') && decodeURIComponent(u).includes('RM280.00') && decodeURIComponent(u).includes('Tarikh yang saya mahu: '))).toBe(true);
  });

  test('kurang pergerakan: tiada tukar automatik', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const meja = page.getByRole('group', { name: /Meja kek/ });
    const awal = await meja.locator('[aria-pressed="true"]').getAttribute('aria-label');
    await page.waitForTimeout(3200);
    expect(await meja.locator('[aria-pressed="true"]').getAttribute('aria-label')).toBe(awal);
  });

  test('desktop: main automatik menukar lampu', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop');
    await page.goto('/');
    const meja = page.getByRole('group', { name: /Meja kek/ });
    const awal = await meja.locator('[aria-pressed="true"]').getAttribute('aria-label');
    await page.mouse.move(5, 5);
    await expect.poll(() => meja.locator('[aria-pressed="true"]').getAttribute('aria-label'), { timeout: 6000 }).not.toBe(awal);
    await page.getByRole('button', { name: /Jeda lampu automatik/ }).click();
    await expect(page.getByRole('button', { name: /Main lampu automatik/ })).toBeVisible();
  });
});
