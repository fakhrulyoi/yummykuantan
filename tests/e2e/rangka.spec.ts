import { expect, test } from '@playwright/test';

test.describe('rangka kedai', () => {
  test('header ikut saiz skrin', async ({ page }, info) => {
    await page.goto('/');
    const logo = page.locator('header img[alt="Yummy Kuantan"]:visible');
    await expect(logo).toBeVisible();
    const tinggi = await logo.evaluate((e) => e.getBoundingClientRect().height);
    if (info.project.name === 'phone') {
      expect(Math.round(tinggi)).toBe(50);
      await expect(page.getByRole('button', { name: 'Buka menu' })).toBeVisible();
      const senarai = page.getByRole('link', { name: /Senarai tempahan, 0 kek/ });
      await expect(senarai).toBeVisible();
      await expect(senarai).toContainText('0');
      await page.getByRole('button', { name: 'Buka menu' }).click();
      const menu = page.getByRole('dialog', { name: 'Menu' });
      await expect(menu.getByRole('link', { name: 'Koleksi' })).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(menu).toBeHidden();
    } else {
      expect(Math.round(tinggi)).toBe(76);
      const nav = page.getByRole('navigation', { name: 'Menu utama' });
      for (const t of ['Koleksi', 'Reka kek', 'Tarikh kosong', 'Tentang kami']) await expect(nav.getByRole('link', { name: t })).toBeVisible();
      await expect(page.getByRole('link', { name: /Senarai \(0\)/ })).toBeVisible();
    }
  });

  test('footer ada hubungan kedai', async ({ page }) => {
    await page.goto('/');
    const f = page.locator('footer');
    await expect(f.getByRole('link', { name: 'WhatsApp +60 11-2302 3447' })).toHaveAttribute('href', /wa\.me\/601123023447/);
    await expect(f.getByRole('link', { name: 'Instagram @yummykuantan' })).toHaveAttribute('href', 'https://instagram.com/yummykuantan');
    await expect(f.getByRole('link', { name: 'TikTok @yummykuantan' })).toHaveAttribute('href', 'https://www.tiktok.com/@yummykuantan');
    await expect(f).toContainText('Penghantaran: Kuantan dan Pekan');
  });
});
