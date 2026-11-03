import type { Page } from '@playwright/test';

/** Pintas window.open supaya ujian boleh baca URL WhatsApp tanpa membuka tab. Disimpan dalam sessionStorage supaya kekal selepas navigasi. */
export async function pintasWhatsApp(page: Page) {
  await page.addInitScript(() => {
    const simpan = (u: string) => {
      const a = JSON.parse(sessionStorage.getItem('__dibuka') ?? '[]') as string[];
      a.push(u);
      sessionStorage.setItem('__dibuka', JSON.stringify(a));
    };
    window.open = ((url?: string | URL) => {
      if (url) simpan(String(url));
      return {
        closed: false,
        location: {
          set href(v: string) {
            simpan(v);
          },
        },
        close() {},
      } as unknown as Window;
    }) as typeof window.open;
  });
}

export async function urlDibuka(page: Page): Promise<string[]> {
  return page.evaluate(() => (JSON.parse(sessionStorage.getItem('__dibuka') ?? '[]') as string[]).filter((u) => u && u !== 'about:blank'));
}
