import { expect, test } from '@playwright/test';

test('laman guna bahasa Melayu dan latar burgundy', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ms');
  const latar = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(latar).toBe('rgb(75, 20, 27)');
});
