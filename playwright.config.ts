import { defineConfig } from '@playwright/test';

const PORT = Number(process.env.E2E_PORT ?? 3100);
const E2E_DB = process.env.E2E_DATABASE_URL ?? 'postgresql://yk:yk@localhost:5432/yk_e2e';

// Pelayan dan ujian berkongsi DB e2e yang sama.
process.env.DATABASE_URL = E2E_DB;
process.env.IP_HASH_SALT ??= 'garam-e2e';

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
  webServer: {
    command: process.env.E2E_COMMAND ?? `npm run build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    env: { DATABASE_URL: E2E_DB, IP_HASH_SALT: process.env.IP_HASH_SALT!, E2E: '1' },
  },
});
