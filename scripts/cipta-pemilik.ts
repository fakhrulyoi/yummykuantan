/**
 * Cipta akaun admin (pengguna Supabase Auth + AdminProfile).
 *   npm run cipta-pemilik -- --emel pemilik@contoh.my --nama "Nama Pemilik" [--peranan STAFF]
 * Kata laluan sementara dijana dan dipapar sekali. Minta pemilik tukar selepas log masuk pertama (Supabase > Authentication).
 */
import { randomBytes } from 'node:crypto';
import { parseArgs } from 'node:util';
import { createClient } from '@supabase/supabase-js';
import { db, tutupDb } from '../lib/data/db';
import * as s from '../lib/data/skema';

const { values } = parseArgs({ options: { emel: { type: 'string' }, nama: { type: 'string' }, peranan: { type: 'string', default: 'OWNER' } } });
const emel = values.emel?.trim().toLowerCase();
const nama = values.nama?.trim();
const peranan = values.peranan === 'STAFF' ? 'STAFF' : 'OWNER';
if (!emel || !nama) {
  console.error('Guna: npm run cipta-pemilik -- --emel x@contoh.my --nama "Nama"');
  process.exit(1);
}
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const kunci = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !kunci) {
  console.error('NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY perlu ada dalam .env');
  process.exit(1);
}

const sb = createClient(url, kunci, { auth: { persistSession: false, autoRefreshToken: false } });
const kataLaluan = randomBytes(12).toString('base64url');
const { data, error } = await sb.auth.admin.createUser({ email: emel, password: kataLaluan, email_confirm: true });
if (error || !data.user) {
  console.error(`Gagal cipta pengguna: ${error?.message ?? 'tiada data'}`);
  process.exit(1);
}
await db.insert(s.adminProfile).values({ userId: data.user.id, name: nama, role: peranan }).onConflictDoUpdate({ target: s.adminProfile.userId, set: { name: nama, role: peranan } });
await tutupDb();
console.log(`Akaun ${peranan} dicipta untuk ${emel}.\nKata laluan sementara: ${kataLaluan}\nSimpan di tempat selamat dan tukar selepas log masuk.`);
