import { defineConfig } from 'vitest/config';
import path from 'node:path';

const TEST_DB = process.env.TEST_DATABASE_URL ?? 'postgresql://yk:yk@localhost:5432/yk_test';

export default defineConfig({
  resolve: { alias: { '@': path.resolve(__dirname, '.') } },
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
    fileParallelism: false,
    globalSetup: ['tests/global-setup.ts'],
    env: {
      DATABASE_URL: TEST_DB,
      IP_HASH_SALT: 'garam-ujian',
      NEXT_PUBLIC_SUPABASE_URL: '',
      SUPABASE_SERVICE_ROLE_KEY: '',
    },
  },
});
