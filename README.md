# Yummy Kuantan

Laman web tempahan kek untuk Yummy Kuantan, Kuantan. Pelanggan pilih kek dari meja kek atau koleksi, kemudian hantar tempahan terus ke WhatsApp. Setiap tempahan ada rekod di admin dengan rujukan dan harga yang dikira oleh server. Pemilik urus tempahan, produk, gambar meja, kandungan laman, soalan lazim dan tetapan tanpa sentuh kod.

- Design (canvas): https://claude.ai/artifact/9fPxNAqzxc8DiBbiwWc8a7
- Spec Bahagian 1: [`docs/superpowers/specs/2026-11-03-yummykuantan-bahagian1-design.md`](docs/superpowers/specs/2026-11-03-yummykuantan-bahagian1-design.md)
- Pelan kerja: [`docs/superpowers/plans/2026-11-03-yummykuantan-bahagian1.md`](docs/superpowers/plans/2026-11-03-yummykuantan-bahagian1.md)

## Apa yang ada (Bahagian 1)

**Kedai:** laman utama (hero, tarikh kosong, meja kek, pilih ikut jenis, cara tempah, ulasan, soalan lazim, galeri), koleksi (cari, tapis, susun), halaman kek (tempah cepat atau tambah ke senarai), senarai tempahan (tambahan, tarikh dan slot ikut kapasiti, pratonton mesej), halaman selepas tempah, semak status, halaman "Studio 3D akan datang".

**Admin (`/admin`):** log masuk (sekat 15 minit selepas 5 cubaan salah), papan pemuka, tempahan (cari, tapis, caj hantar, status, tanda bayar, Balas di WhatsApp, sejarah), produk (draf dan terbit, susun gambar), gambar meja kek (buang latar dalam browser), kandungan laman dengan pratonton phone, soalan lazim, tetapan (tempah awal, kapasiti, slot, hari tutup, tambahan, nombor WhatsApp). Staf boleh urus tempahan; hanya pemilik boleh ubah tetapan dan padam.

Belum ada: studio 3D sebenar (Bahagian 2), kalendar, pelanggan, promosi dan laporan (Bahagian 3).

## Teknologi

Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4, Drizzle ORM + PostgreSQL (Supabase), Supabase Auth dan Storage, Zod, `@imgly/background-removal`. Ujian: Vitest, Playwright, axe, Lighthouse CI.

## Jalankan di komputer

Perlu Node 22 dan PostgreSQL 16.

```bash
npm ci
cp .env.example .env            # isi DATABASE_URL dan IP_HASH_SALT (openssl rand -hex 32)
npm run db:migrate
npm run db:seed                 # 33 kek dari katalog WhatsApp, meja kek, soalan lazim, tetapan mula
npm run dev                     # http://localhost:3000
```

Tanpa kunci Supabase, gambar yang dimuat naik di admin disimpan dalam folder `.muatnaik/` (pembangunan sahaja). Log masuk admin perlukan projek Supabase (lihat di bawah).

Ujian:

```bash
npm test                        # unit (perlu DB yk_test)
npm run e2e                     # Playwright, phone dan desktop (perlu DB yk_e2e); guna pelayan Auth tiruan
```

## Sediakan Supabase (sekali sahaja)

1. Cipta projek di https://supabase.com (rantau Singapura).
2. **Database > Connection string**: salin URL pooler (port 6543, `?pgbouncer=true`) ke `DATABASE_URL`, dan URL terus (port 5432) ke `DIRECT_URL`.
3. **Settings > API**: salin `Project URL`, `anon key` dan `service_role key`.
4. **Storage**: cipta tiga bucket awam: `produk`, `meja`, `hero`.
5. **Authentication > Providers**: hidupkan Email, matikan "Allow new users to sign up".
6. Jalankan migrasi dan data mula ke Supabase, kemudian cipta akaun pemilik:

```bash
DATABASE_URL="<url terus 5432>" npm run db:migrate
npm run db:seed                 # dengan kunci Supabase dalam .env, gambar dimuat naik ke Storage
npm run cipta-pemilik -- --emel pemilik@contoh.my --nama "Nama Pemilik"
# Untuk staf: tambah --peranan STAFF
```

Kata laluan sementara dipapar sekali. Tukar selepas log masuk pertama.

## Pemboleh ubah persekitaran

| Nama | Untuk |
|---|---|
| `DATABASE_URL` | Sambungan aplikasi (pooler Supabase) |
| `DIRECT_URL` | Migrasi (sambungan terus) |
| `NEXT_PUBLIC_SUPABASE_URL` | URL projek Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Kunci awam (log masuk, muat naik bertanda tangan) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server sahaja: URL muat naik, skrip `cipta-pemilik` |
| `IP_HASH_SALT` | Garam rawak untuk hash IP (had kadar) |

Jangan sesekali commit `.env`. Repo ini awam.

## Deploy ke Vercel

1. Import repo `fakhrulyoi/yummykuantan` di https://vercel.com/new (rangka: Next.js).
2. Masukkan semua pemboleh ubah di atas dalam **Settings > Environment Variables** (Production dan Preview).
3. Deploy. Selepas siap, semak di phone sebenar: meja kek, tempah cepat, senarai tempahan, WhatsApp terbuka dengan mesej, log masuk admin, muat naik gambar meja.

## Backup

`.github/workflows/backup.yml` menjalankan `pg_dump` setiap Ahad 03:00 MYT dan menyimpan fail sebagai artifact GitHub selama 30 hari. Tetapkan rahsia repo `BACKUP_DATABASE_URL` (URL terus Supabase, port 5432) di **Settings > Secrets and variables > Actions**. Untuk pulihkan: muat turun artifact, `gunzip`, kemudian `psql "$DIRECT_URL" < fail.sql`.

## Struktur

- `app/(kedai)/` halaman pelanggan, `app/admin/` panel admin, `app/api/` muat naik.
- `components/kedai/`, `components/admin/` komponen.
- `lib/tempahan/` logik tempahan tulen (harga, tarikh, slot, mesej WhatsApp), diuji unit.
- `lib/data/` akses DB (Drizzle), `lib/auth/` Supabase dan `requireAdmin()`.
- `db/` skema migrasi, data mula dan gambar katalog.
- `design/` sumber prototaip design (rujukan sahaja).

## Hubungi kedai

WhatsApp +60 11-2302 3447 · Instagram dan TikTok @yummykuantan · Hantar ke Kuantan dan Pekan.
