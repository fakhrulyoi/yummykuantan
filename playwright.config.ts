import { defineConfig } from '@playwright/test';

const PORT = Number(process.env.E2E_PORT ?? 3100);
const E2E_DB = process.env.E2E_DATABASE_URL ?? 'postgresql://yk:yk@localhost:5432/yk_e2e';

// Pelayan dan ujian berkongsi DB e2e yang sama.
process.env.DATABASE_URL = E2E_DB;
process.env.IP_HASH_SALT ??= 'garam-e2e';
const GOTRUE_PORT = 54399;
const AUTH = { NEXT_PUBLIC_SUPABASE_URL: `http://localhost:${GOTRUE_PORT}`, NEXT_PUBLIC_SUPABASE_ANON_KEY: 'kunci-anon-ujian' };

export default defineConfig({
  testDir: 'tests/e2e',
  globalSetup: './tests/e2e/global-setup.ts',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: `http://localhost:${PORT}`, trace: 'retain-on-failure', locale: 'ms-MY', timezoneId: 'Asia/Kuala_Lumpur' },
  projects: [
    { name: 'phone', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 } },
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
  ],
  webServer: [
    {
      // Supabase Auth tiruan (tiada Supabase sebenar dalam ujian).
      command: `node tests/e2e/gotrue-tiruan.mjs`,
      url: `http://localhost:${GOTRUE_PORT}/auth/v1/health`,
      reuseExistingServer: !process.env.CI,
      env: { GOTRUE_PORT: String(GOTRUE_PORT) },
    },
    {
      command: process.env.E2E_COMMAND ?? `npm run build && npx next start -p ${PORT}`,
      // Fail statik: laman utama perlukan data mula, yang dimuat oleh globalSetup selepas pelayan hidup.
      url: `http://localhost:${PORT}/logo-krim.png`,
      reuseExistingServer: !process.env.CI,
      timeout: 300_000,
      env: { DATABASE_URL: E2E_DB, IP_HASH_SALT: process.env.IP_HASH_SALT!, E2E: '1', ...AUTH },
    },
  ],
});
