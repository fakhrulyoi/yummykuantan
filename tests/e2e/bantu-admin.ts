import { expect, type Page } from '@playwright/test';
import { db, skema as s } from '../../lib/data/db';

// Mesti sama dengan pengguna dalam tests/e2e/gotrue-tiruan.mjs.
export const PEMILIK = { id: '00000000-0000-4000-8000-000000000001', email: 'pemilik@ujian.my', nama: 'Kak Long' };
export const STAF = { id: '00000000-0000-4000-8000-000000000002', email: 'staf@ujian.my', nama: 'Staf Dapur' };
export const TANPA_PROFIL = { id: '00000000-0000-4000-8000-000000000003', email: 'orang@ujian.my' };
export const KATA_LALUAN = 'betul-123456';

/** Panggil selepas dataMula(): profil admin untuk pemilik dan staf. */
export async function sediaAdmin(): Promise<void> {
  await db.insert(s.adminProfile).values([
    { userId: PEMILIK.id, name: PEMILIK.nama, role: 'OWNER' },
    { userId: STAF.id, name: STAF.nama, role: 'STAFF' },
  ]);
}

export async function masukAdmin(page: Page, emel = PEMILIK.email, kataLaluan = KATA_LALUAN): Promise<void> {
  await page.goto('/admin/login');
  await page.getByLabel('Emel').fill(emel);
  await page.getByLabel('Kata laluan').fill(kataLaluan);
  await page.getByRole('button', { name: 'Log masuk' }).click();
  await expect(page).toHaveURL(/\/admin$/);
}
