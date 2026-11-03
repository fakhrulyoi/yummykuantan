import { sql } from 'drizzle-orm';
import { db } from '@/lib/data/db';
import { seedDb as seed } from '@/db/seed';

const JADUAL = [
  'audit_log', 'rate_limit', 'order_addon', 'order_item', 'orders', 'product_image', 'product_size', 'product',
  'category', 'addon', 'settings', 'time_slot', 'closed_date', 'site_content', 'faq', 'admin_profile',
];

export async function resetDb(): Promise<void> {
  await db.execute(sql.raw(`TRUNCATE ${JADUAL.map((j) => `"${j}"`).join(', ')} RESTART IDENTITY CASCADE`));
  await db.execute(sql`ALTER SEQUENCE order_ref_seq RESTART WITH 24100`);
}

export async function seedDb(): Promise<void> {
  await seed(db);
}
