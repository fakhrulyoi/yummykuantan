# Yummy Kuantan Bahagian 1 (Asas dan kedai) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Laman kedai Yummy Kuantan (meja kek, koleksi, halaman kek, senarai tempahan, tempahan WhatsApp, semak status) dan admin asas (tempahan, produk, gambar meja, kandungan, soalan lazim, tetapan), semua data dari database.

**Architecture:** Satu aplikasi Next.js App Router. Logik tempahan sebagai fungsi tulen dalam `lib/tempahan` (diuji unit). Akses data dalam `lib/data` (Prisma ke Postgres Supabase). Halaman kedai dirender di server dan dicache dengan tag; admin terbit memanggil `revalidateTag`. Admin dilindungi Supabase Auth + `requireAdmin()`.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript 5 (strict), Tailwind CSS 4, Motion for React, Prisma 6, PostgreSQL (Supabase), Supabase Auth + Storage, Zod 3, `@imgly/background-removal`, Vitest, Playwright, `@axe-core/playwright`.

**Spec:** `docs/superpowers/specs/2026-11-03-yummykuantan-bahagian1-design.md`
**Design rujukan (diluluskan):** https://claude.ai/artifact/9fPxNAqzxc8DiBbiwWc8a7 — warna, susun atur, teks dan tingkah laku halaman diambil dari artboard yang sama nama (Main, Home_P, Katalog_D/P, Produk_D/P, Checkout_D, Troli_P, Status_P, Meja_D/P, Admin_*).

## Global Constraints

- Bahasa laman dan mesej: Bahasa Melayu. Tiada emoji sebagai elemen design.
- Wang disimpan dalam sen (integer). Paparan UI: `RM 100.00`; dalam mesej WhatsApp: `RM100.00`.
- Zon masa: semua tarikh tempahan dikira dalam `Asia/Kuala_Lumpur`; tarikh disimpan `YYYY-MM-DD`.
- Nombor WhatsApp kedai: `601123023447`. Instagram dan TikTok: `@yummykuantan`.
- Kawasan hantar: `Kuantan`, `Pekan` sahaja.
- Warna token: `--yk-bg #4B141B`, `--yk-bg-deep #3A0E14`, `--yk-panel #5A1B23`, `--yk-line #74343C`, `--yk-line-strong #8A4A52`, `--yk-cream #F2E7DE`, `--yk-cream-2 #E6CFC6`, `--yk-muted #D3B1AB`, `--yk-accent #EBCFC3`, `--yk-warn #F2C28E`, `--yk-ok #BCD7AE`, `--yk-error #FFB9AE`. Admin: latar `#F6F2EC`, sidebar `#4B141B`.
- Font: Libre Caslon Display (tajuk), Manrope (teks), Pinyon Script (gaya tulisan); melalui `next/font`, subset latin.
- Butang radius 2px; pil 999px. Sasaran sentuh ≥ 44px.
- Reka untuk 390px dahulu; desktop maksimum lebar kandungan 1360px.
- `prefers-reduced-motion: reduce` mematikan main automatik, animasi angkat, marquee dan slideshow.
- Status tempahan (enum): `BARU_WA, MENUNGGU_BAYARAN, DISAHKAN, DALAM_PENYEDIAAN, SEDIA_DIAMBIL, DALAM_PENGHANTARAN, SELESAI, DIBATALKAN`.
- Rujukan: `YK-` + jujukan Postgres `order_ref_seq` bermula 24100.
- Had: ucapan kek ≤ 30 aksara, kad ≤ 120, nota ≤ 500, kuantiti 1–10, alamat ≥ 8 aksara, muat naik ≤ 10 MB `image/*`.
- Had kadar: tempahan 10/jam/IP; semak status 20/jam/IP; log masuk admin sekat 15 minit selepas 5 cubaan salah.
- `holdHours` lalai 48; pendua dalam 10 minit.
- Tiada kunci rahsia dalam kod; semua dalam env (`DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `IP_HASH_SALT`).

## Review Focus

1. **Tengah malam waktu Malaysia:** tempahan pada 00:30 MYT (16:30 UTC hari sebelum) mesti kira tempoh tempah awal dari tarikh MYT, bukan UTC. Ujian dalam Task 4.
2. **Harga dalam senarai pelanggan sudah lapuk** (admin ubah harga selepas pelanggan tambah ke senarai): server guna harga baru, pulangkan `hargaBerubah: true`, dan halaman senarai papar "Harga dikemas kini" sebelum buka WhatsApp. Ujian dalam Task 7 dan Task 12.
3. **Kek atau saiz dinyahaktif semasa ada dalam senarai pelanggan:** server tolak dengan `ITEM_TIDAK_AKTIF` + indeks item; senarai buang item itu dan papar sebabnya. Ujian dalam Task 3 dan Task 12.
4. **Teks pelanggan dengan aksara khas** (`#`, `&`, `?`, baris baru, emoji dalam ucapan) mesti selamat dalam pautan `wa.me`. Ujian dalam Task 5.
5. **Tekan Tempah dua kali / butang Kembali lalu hantar semula:** pulangkan rujukan yang sama, satu rekod sahaja. Ujian dalam Task 7.

---

## File Structure

```
app/
  layout.tsx, globals.css                         token warna, font
  (kedai)/layout.tsx                              Header, Footer, BarWhatsApp (phone)
  (kedai)/page.tsx                                laman utama
  (kedai)/koleksi/page.tsx
  (kedai)/kek/[slug]/page.tsx
  (kedai)/senarai/page.tsx
  (kedai)/tempahan/[ref]/page.tsx
  (kedai)/semak/page.tsx
  (kedai)/reka/page.tsx
  (kedai)/actions.ts                              server action kedai
  admin/login/page.tsx, admin/(dilindungi)/layout.tsx
  admin/(dilindungi)/page.tsx                     papan pemuka
  admin/(dilindungi)/tempahan/page.tsx, [id]/page.tsx, actions.ts
  admin/(dilindungi)/produk/page.tsx, [id]/page.tsx, actions.ts
  admin/(dilindungi)/kandungan/page.tsx, actions.ts
  admin/(dilindungi)/soalan/page.tsx, actions.ts
  admin/(dilindungi)/tetapan/page.tsx, actions.ts
  api/upload/route.ts
components/kedai/  Header, Footer, Logo, KadKek, PilihSaiz, JalurTarikh, PilihSlot, SoalanLazim, ...
components/kedai/meja/  MejaKek.tsx, DialogKek.tsx, useMejaKek.ts
components/admin/  Sidebar, JadualTempahan, BorangProduk, PenyuntingGambarMeja, ...
lib/tempahan/  wang.ts, telefon.ts, rujukan.ts, harga.ts, tarikh.ts, slot.ts, mesej.ts, skema.ts, jenis.ts
lib/senarai/   senarai.ts (fungsi tulen), useSenarai.ts
lib/gambar/    meja.ts
lib/data/      db.ts, produk.ts, tempahan.ts, kandungan.ts, soalan.ts, tetapan.ts, hadKadar.ts, audit.ts, cache.ts
lib/auth/      supabase.ts, admin.ts
prisma/        schema.prisma, migrations/, seed.ts, seed-data/ (katalog.json, gambar/)
tests/unit/, tests/e2e/, tests/db.ts (reset DB ujian)
.github/workflows/ci.yml, backup.yml
```

---

### Task 1: Projek asas, token design dan alat ujian

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `app/layout.tsx`, `app/globals.css`, `vitest.config.ts`, `playwright.config.ts`, `.env.example`, `.github/workflows/ci.yml`, `tests/unit/asap.test.ts`, `tests/e2e/asap.spec.ts`

**Interfaces:**
- Produces: kelas Tailwind dari token (`bg-yk-bg`, `text-yk-cream`, `border-yk-line`, …), pemboleh ubah font `--font-serif`, `--font-sans`, `--font-script`; skrip `npm run test` (Vitest), `npm run e2e` (Playwright, projek `phone` 390×844 dan `desktop` 1440×900).

- [ ] **Step 1:** `npx create-next-app@latest` (TypeScript, App Router, Tailwind, ESLint, `src` = tidak). Pasang `vitest`, `@playwright/test`, `@axe-core/playwright`, `zod`, `motion`.
- [ ] **Step 2:** Tulis `tests/e2e/asap.spec.ts`: buka `/`, jangka `html[lang="ms"]` dan warna latar `body` = `rgb(75, 20, 27)`. Tulis `tests/unit/asap.test.ts`: `expect(1).toBe(1)`.
- [ ] **Step 3:** Jalankan `npm run e2e -- asap` → FAIL (lang/latar belum ditetapkan).
- [ ] **Step 4:** `app/layout.tsx`: `<html lang="ms">`, tiga font `next/font/google` dengan `variable`. `globals.css`: token dari Global Constraints sebagai `@theme`, `body { background: var(--yk-bg); color: var(--yk-cream) }`, peraturan `prefers-reduced-motion`.
- [ ] **Step 5:** `npm run test && npm run e2e -- asap` → PASS. CI (`ci.yml`): `npm ci`, `npm run lint`, `npm run test`, `npx playwright install --with-deps`, `npm run e2e`.
- [ ] **Step 6:** Commit `chore: projek asas, token design, alat ujian`.

### Task 2: Skema database dan data mula

**Files:**
- Create: `prisma/schema.prisma`, `prisma/seed.ts`, `prisma/seed-data/katalog.json`, `prisma/seed-data/gambar/` (gambar katalog `NN_01.jpg`…, `cut_NN.webp`), `lib/data/db.ts`, `tests/db.ts`, `tests/unit/seed.test.ts`, `supabase/config.toml`

**Interfaces:**
- Produces: model Prisma tepat seperti spec §5 (nama medan sama), enum `OrderStatus`, `OrderKind (QUICK|LIST)`, `ReceiveMode (PICKUP|DELIVERY)`, `AddonTextKind (NONE|NUMBER|MESSAGE)`, `AdminRole (OWNER|STAFF)`; jadual `RateLimit (key text, windowStart timestamptz, count int, PK(key, windowStart))`; jujukan `order_ref_seq START 24100`; `export const db: PrismaClient` (singleton); `resetDb(): Promise<void>` + `seedDb(): Promise<void>` untuk ujian.

- [ ] **Step 1:** Tulis `tests/unit/seed.test.ts` (guna DB ujian dari `supabase start`): selepas `seedDb()`, jangka 6 kategori, 33 produk, 8 produk `onTable` dengan `tablePosition` 1–8 berurutan dan `tableImageUrl` bukan null, Italian Cake ada saiz `6 inci 10000`, `8 inci 28000`, `10 inci 38000`, 3 `TimeSlot` (kapasiti 3,2,2), `Settings.dailyCapacity = 12`, `minLeadDays = 3`, produk kategori Kek kahwin `leadDays = 7`, 5 `Addon` (600, 500, 300, 400, 400 sen), 10 `Faq` dengan tepat 3 `visible = true`.
- [ ] **Step 2:** `npx vitest run tests/unit/seed.test.ts` → FAIL.
- [ ] **Step 3:** Tulis skema + migrasi (`npx prisma migrate dev --name awal`). `katalog.json` dijana dari senarai `P` dalam fail design (`build.py`): id, nama, kategori, saiz, penerangan. Meja: `['04','09','10','11','15','16','18','32']` mengikut kedudukan. FAQ dari `faq.py` design; `visible` hanya untuk soalan tanpa `[`. `seed.ts` memuat naik gambar ke bucket `produk` dan `meja` (Supabase Storage, `upsert: true`) dan menyimpan URL awam.
- [ ] **Step 4:** Ujian → PASS.
- [ ] **Step 5:** Commit `feat(db): skema dan data mula katalog`.

### Task 3: Wang, telefon, rujukan dan kiraan harga

**Files:**
- Create: `lib/tempahan/jenis.ts`, `wang.ts`, `telefon.ts`, `rujukan.ts`, `harga.ts`
- Test: `tests/unit/wang.test.ts`, `telefon.test.ts`, `harga.test.ts`

**Interfaces:**
- Produces:
  - `formatRM(sen: number, opts?: { rapat?: boolean }): string` — `formatRM(10000) === 'RM 100.00'`, `formatRM(10000,{rapat:true}) === 'RM100.00'`.
  - `formatTelefon(input: string): string | null` — pulangkan `60XXXXXXXXX` (10–11 digit selepas 60) atau `null`.
  - `empatAkhir(telefon: string): string`.
  - `formatRujukan(n: number): string` — `formatRujukan(24117) === 'YK-24117'`.
  - Jenis dalam `jenis.ts`:
    ```ts
    type ItemInput = { productId: string; sizeId: string; qty: number; cakeMessage?: string };
    type AddonInput = { addonId: string; qty: number; text?: string };
    type SaizKatalog = { sizeId: string; productId: string; productName: string; label: string; priceSen: number; active: boolean; leadDays: number; allowMessage: boolean };
    type AddonKatalog = { addonId: string; name: string; priceSen: number; textKind: 'NONE'|'NUMBER'|'MESSAGE'; active: boolean };
    type BarisItem = { productId: string; productName: string; sizeLabel: string; unitPriceSen: number; qty: number; cakeMessage?: string; leadDays: number };
    type BarisAddon = { addonId: string; name: string; unitPriceSen: number; qty: number; text?: string };
    type KodRalat = 'ITEM_TIDAK_AKTIF'|'ADDON_TIDAK_AKTIF'|'KUANTITI'|'TEKS_DIPERLUKAN'|'TEKS_PANJANG'|'SENARAI_KOSONG';
    ```
  - `kiraHarga(items: ItemInput[], addons: AddonInput[], saiz: Map<string, SaizKatalog>, tambahan: Map<string, AddonKatalog>): { ok: true; items: BarisItem[]; addons: BarisAddon[]; cakeSubtotalSen: number; addonSubtotalSen: number; totalSen: number } | { ok: false; ralat: KodRalat; indeks?: number }`

- [ ] **Step 1: Ujian gagal.**
  - `telefon.test.ts`: `'011-2302 3447'`, `'+60 11-2302 3447'`, `'601123023447'`, `'0123456789'` → `'601123023447'`, `'601123023447'`, `'601123023447'`, `'60123456789'`; `'12345'`, `'0112302'`, `'+6591234567'` → `null`.
  - `harga.test.ts`: Italian Cake 6 inci x1 + Kekbatik 7 inci x2 (5500) + lilin set x1 (600) → `cakeSubtotalSen 21000`, `addonSubtotalSen 600`, `totalSen 21600`; harga diambil dari `saiz` walaupun input tiada harga; saiz `active:false` → `{ok:false, ralat:'ITEM_TIDAK_AKTIF', indeks:1}`; qty 0 atau 11 → `KUANTITI`; lilin nombor tanpa `text` → `TEKS_DIPERLUKAN`; ucapan 31 aksara → `TEKS_PANJANG`; ucapan pada produk `allowMessage:false` diabaikan (dibuang); senarai kosong → `SENARAI_KOSONG`.
- [ ] **Step 2:** `npx vitest run tests/unit/telefon.test.ts tests/unit/harga.test.ts tests/unit/wang.test.ts` → FAIL.
- [ ] **Step 3:** Laksana fungsi di atas. Telefon: buang bukan digit; `0` di depan → `60`; mesti bermula `601` dan panjang 11–12.
- [ ] **Step 4:** Ujian → PASS.
- [ ] **Step 5:** Commit `feat(tempahan): wang, telefon, rujukan, kira harga`.

### Task 4: Tarikh dibenarkan dan baki slot

**Files:**
- Create: `lib/tempahan/tarikh.ts`, `lib/tempahan/slot.ts`
- Test: `tests/unit/tarikh.test.ts`, `tests/unit/slot.test.ts`

**Interfaces:**
- Produces:
  - `hariIniMYT(now: Date): string` (YYYY-MM-DD).
  - `tarikhAwal(now: Date, leadDays: number[], minLeadDays: number): string` = hari ini MYT + `max(minLeadDays, ...leadDays)`.
  - `tarikhDibenarkan(tarikh: string, now: Date, leadDays: number[], minLeadDays: number, tutup: Set<string>): { ok: true } | { ok: false; sebab: 'FORMAT'|'TERLALU_AWAL'|'HARI_TUTUP' }`
  - `jalurTarikh(now: Date, hari: number /* 14 */): string[]`
  - `tarikhPenuh(tarikh: string): string` → `'Rabu, 11 November 2026'`.
  - `type TempahanKiraan = { date: string; timeSlotId: string | null; status: OrderStatus; createdAt: Date }`
  - `bakiSlot(tarikh: string, slot: { id: string; capacity: number; active: boolean }[], dailyCapacity: number, tempahan: TempahanKiraan[], now: Date, holdHours: number): { harian: number; slot: Record<string, number> }` — tolak `DIBATALKAN`; `BARU_WA` hanya dikira jika `now - createdAt < holdHours`; baki slot = `min(capacity - bil slot, harian)`, tidak negatif.

- [ ] **Step 1: Ujian gagal.** `tarikh.test.ts`: `now = 2026-11-03T16:30:00Z` (00:30 MYT 4 Nov), lead 3 → `tarikhAwal === '2026-11-07'`; `'2026-11-06'` → `TERLALU_AWAL`; tarikh dalam `tutup` → `HARI_TUTUP`; `'11/07/2026'` → `FORMAT`; lead [3,7] → guna 7; `tarikhPenuh('2026-11-11') === 'Rabu, 11 November 2026'`; `jalurTarikh(now,14)` bermula `'2026-11-04'`, panjang 14. `slot.test.ts`: kapasiti slot 2, satu `DISAHKAN` + satu `DIBATALKAN` → baki 1; `BARU_WA` dicipta 49 jam lalu tidak dikira, 47 jam lalu dikira; `dailyCapacity` 2 dengan dua tempahan di slot lain → semua slot baki 0; `timeSlotId: null` dikira dalam harian sahaja.
- [ ] **Step 2:** Jalankan → FAIL.
- [ ] **Step 3:** Laksana. Penukaran zon guna `Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kuala_Lumpur' })`; nama hari/bulan Melayu dari jadual tetap (Ahad…Sabtu, Januari…Disember).
- [ ] **Step 4:** PASS.
- [ ] **Step 5:** Commit `feat(tempahan): tarikh dan baki slot`.

### Task 5: Mesej WhatsApp

**Files:**
- Create: `lib/tempahan/mesej.ts`
- Test: `tests/unit/mesej.test.ts`

**Interfaces:**
- Consumes: `BarisItem`, `BarisAddon`, `formatRM`, `tarikhPenuh` (Task 3–4).
- Produces:
  - `type MesejTempahan = { ref: string; kind: 'QUICK'|'LIST'; items: BarisItem[]; addons: BarisAddon[]; totalSen: number; tarikh?: string; slotLabel?: string; mode?: 'PICKUP'|'DELIVERY'; area?: string; address?: string; name?: string }`
  - `binaMesejWhatsApp(t: MesejTempahan): string`
  - `waUrl(nombor: string, mesej: string): string` → `https://wa.me/${nombor}?text=${encodeURIComponent(mesej)}`
  - `isiTemplat(templat: string, nilai: Record<string, string>): string` (ganti `{kunci}`; kunci tiada → biar asal).

- [ ] **Step 1: Ujian gagal.** Contoh spec §6.6 (ambil sendiri, Italian Cake 6 inci + ucapan, lilin set, Rabu 11 November 2026 2:00 hingga 4:00 petang, Nur Aisyah, RM106.00, YK-24117) → padan rentetan tepat. Hantar ke Kuantan → mengandungi `Cara: Hantar ke Kuantan`, `Alamat: …`, `Anggaran: RM106.00 (belum termasuk caj penghantaran)`. Tempahan cepat → `Tarikh yang saya mahu: ` tanpa baris Cara/Nama. Kad ucapan → `- Kad ucapan x1 (RM3.00): "Selamat hari jadi"`; lilin nombor → `- Lilin nombor x1 (RM5.00): 25`. `waUrl` dengan ucapan `Selamat #1 & semua?\nJumpa 🎉` → `decodeURIComponent(url.split('text=')[1])` sama dengan mesej asal, dan url tiada `#` mentah.
- [ ] **Step 2:** FAIL. **Step 3:** Laksana. **Step 4:** PASS.
- [ ] **Step 5:** Commit `feat(tempahan): mesej WhatsApp`.

### Task 6: Skema input dan had kadar

**Files:**
- Create: `lib/tempahan/skema.ts`, `lib/data/hadKadar.ts`
- Test: `tests/unit/skema.test.ts`, `tests/unit/hadKadar.test.ts`

**Interfaces:**
- Produces:
  - `skemaTempahan` (Zod): `{ items: ItemInput[] (1..20), addons: AddonInput[], mode: 'PICKUP'|'DELIVERY', area?: 'Kuantan'|'Pekan', address?: string, date: string, timeSlotId: string, name: string (1..60), phone: string, notes?: string (≤500), lamanWeb: string /* perangkap bot, mesti '' */ }` dengan `superRefine`: DELIVERY → area wajib dan address ≥ 8; phone wajib dan lulus `formatTelefon` (mesej `Nombor telefon tidak sah`).
  - `skemaTempahanCepat`: `{ productId, sizeId, qty (1..10), cakeMessage? (≤30), lamanWeb: '' }`.
  - `skemaSemak`: `{ ref: /^YK-\d{5,}$/, empat: /^\d{4}$/ }`.
  - `hadKadar(kunci: string, had: number, tetingkapSaat: number): Promise<boolean>` — `true` jika dibenarkan; satu `INSERT … ON CONFLICT DO UPDATE SET count = count + 1 RETURNING count` pada `RateLimit`.
  - `hashIp(ip: string): string` (SHA-256 dengan `IP_HASH_SALT`).

- [ ] **Step 1:** Ujian: DELIVERY tanpa alamat → ralat pada medan `address` dengan mesej `'Sila isi alamat penghantaran'`; `area: 'Kuala Lumpur'` ditolak; `lamanWeb: 'x'` ditolak; `hadKadar('t:ip',2,3600)` → true, true, false.
- [ ] **Step 2–4:** FAIL → laksana → PASS.
- [ ] **Step 5:** Commit `feat(tempahan): skema input dan had kadar`.

### Task 7: Simpan tempahan (server)

**Files:**
- Create: `lib/data/tempahan.ts`, `lib/data/produk.ts` (bacaan katalog sahaja), `lib/data/tetapan.ts`, `app/(kedai)/actions.ts`
- Test: `tests/unit/simpanTempahan.test.ts` (DB ujian)

**Interfaces:**
- Consumes: Task 3–6.
- Produces:
  - `type HasilTempahan = { ok: true; ref: string; token: string; waUrl: string; totalSen: number; hargaBerubah: boolean } | { ok: false; ralat: KodRalat | 'SLOT_PENUH' | 'HARI_PENUH' | 'TERLALU_AWAL' | 'HARI_TUTUP' | 'HAD_KADAR' | 'INPUT'; indeks?: number; medan?: Record<string, string> }`
  - `simpanTempahan(input: unknown, ctx: { ip: string; now?: Date; hargaPelanggan?: number }): Promise<HasilTempahan>`
  - `simpanTempahanCepat(input: unknown, ctx: { ip: string; now?: Date }): Promise<HasilTempahan>`
  - `cariTempahanUntukPelanggan(ref: string, token: string): Promise<OrderDenganItem | null>`
  - `semakStatus(ref: string, empat: string, ip: string): Promise<{ ok: true; status: OrderStatus; kind: OrderKind; date: string | null; mode: string | null } | { ok: false; ralat: 'TIADA' | 'HAD_KADAR' }>`
  - Server action `buatTempahan(formData | json)`, `buatTempahanCepat(json)`, `semakTempahan(json)` dalam `app/(kedai)/actions.ts` (ambil IP dari `headers()`).

- [ ] **Step 1: Ujian gagal** (setiap ujian `resetDb()` + `seedDb()`):
  - tempahan sah → rekod `Order` dengan `ref` `YK-241xx`, `totalSen` dari DB, `waMessage` sama dengan `binaMesejWhatsApp`, `token` panjang 32.
  - `hargaPelanggan` 20000 tetapi harga DB 21600 → `hargaBerubah: true`, `totalSen: 21600`.
  - saiz dinyahaktif → `{ ok:false, ralat:'ITEM_TIDAK_AKTIF', indeks:0 }`.
  - slot berkapasiti 1: dua `simpanTempahan` serentak (`Promise.all`) → tepat satu `ok:true`, satu `SLOT_PENUH`.
  - input sama dihantar dua kali (telefon + kek + tarikh) dalam 10 minit → ref sama, `count(Order) === 1`.
  - tempah cepat dua kali dari IP sama, kek dan saiz sama → ref sama.
  - IP sama ke-11 dalam sejam → `HAD_KADAR`.
  - `semakStatus` dengan 4 digit salah → `TIADA`.
- [ ] **Step 2:** FAIL.
- [ ] **Step 3:** Laksana. Transaksi `db.$transaction(fn, { isolationLevel: 'Serializable' })`, cuba semula hingga 3 kali pada ralat serialisasi (`P2034`) sebelum pulangkan `SLOT_PENUH`. Rujukan dari `SELECT nextval('order_ref_seq')`. Token `crypto.randomBytes(16).toString('hex')`.
- [ ] **Step 4:** PASS.
- [ ] **Step 5:** Commit `feat(tempahan): simpan tempahan dengan semakan server`.

### Task 8: Rangka kedai (header, footer, kandungan, cache)

**Files:**
- Create: `app/(kedai)/layout.tsx`, `components/kedai/Header.tsx`, `Footer.tsx`, `Logo.tsx`, `BarWhatsApp.tsx`, `lib/data/kandungan.ts`, `lib/data/cache.ts`, `public/logo-krim.png`, `public/logo-warna.png`
- Test: `tests/e2e/rangka.spec.ts`

**Interfaces:**
- Produces: `bacaKandungan<K extends KunciKandungan>(k: K): Promise<NilaiKandungan[K]>` (versi diterbitkan, `unstable_cache` dengan tag `kandungan`); `TAG = { produk: 'produk', kandungan: 'kandungan', soalan: 'soalan', tetapan: 'tetapan' }`; `KunciKandungan = 'hero' | 'hubungi' | 'footer' | 'waTemplates'`.

- [ ] **Step 1:** E2E: phone — logo `img[alt="Yummy Kuantan"]` tinggi 50px dalam header, butang menu, ikon senarai dengan bilangan; desktop — nav (Koleksi, Reka kek, Tarikh kosong, Tentang kami) dan logo 76px di tengah; footer ada `WhatsApp +60 11-2302 3447`, `Instagram @yummykuantan`, `TikTok @yummykuantan`, `Penghantaran: Kuantan dan Pekan`.
- [ ] **Step 2–4:** FAIL → laksana ikut artboard Main/Home_P → PASS.
- [ ] **Step 5:** Commit `feat(kedai): header, footer, kandungan`.

### Task 9: Meja kek

**Files:**
- Create: `components/kedai/meja/useMejaKek.ts`, `MejaKek.tsx`, `DialogKek.tsx`
- Test: `tests/unit/useMejaKek.test.ts`, `tests/e2e/meja.spec.ts`

**Interfaces:**
- Consumes: `formatRM`; server action `buatTempahanCepat` (Task 7).
- Produces:
  - Jenis `KekMeja` dan `MejaKekProps` tepat seperti spec §7.
  - `mejaReducer(state: { lit: number | null; auto: boolean; open: number | null; saiz: number }, aksi: { t: 'nyala'; i: number } | { t: 'seterusnya' } | { t: 'sebelum' } | { t: 'buka'; i: number } | { t: 'tutup' } | { t: 'saiz'; k: number } | { t: 'auto'; on: boolean } | { t: 'kekunci'; key: string }, n: number)`.
  - `skalaSaiz(k: number, bil: number): number` → 0.8 hingga 1.0 (`bil === 1` → 1).

- [ ] **Step 1: Ujian gagal.** Unit: `nyala` mematikan `auto`; `kekunci 'End'` → `lit = n-1`; `seterusnya` dari `n-1` (phone) kekal `n-1` (tiada pusingan pada sapuan) dan butang seterusnya berpusing (desktop: `mod n`); `buka` set `saiz:0`; `skalaSaiz(2,3) === 1`, `skalaSaiz(0,3) === 0.8`. E2E (DB seed): desktop — hover kek ke-5 → `aria-pressed="true"` dan nama `Tall Cake Italian` dalam `aria-live`; klik → dialog `role="dialog"` dengan `RM 250.00`; Esc → dialog tutup dan fokus pada kek ke-5. Phone — sapu kiri pada pentas → kek ke-2 menyala; "Lihat kek ini" → dialog → pilih `8 inci` → harga `RM 280.00` → "Tempah di WhatsApp" → navigasi ke URL `wa.me/601123023447` yang mengandungi `YK-` (pintas `window.open` dalam ujian). Kurang pergerakan (`page.emulateMedia({ reducedMotion: 'reduce' })`) → tiada pertukaran automatik selepas 3 saat.
- [ ] **Step 2:** FAIL.
- [ ] **Step 3:** Laksana ikut artboard Meja_D dan Meja_P (ukuran, cahaya, kayu, malap `brightness(.24) saturate(.5)`, ofset jiran 16px desktop, pentas phone 540px dengan kek 250×375 dan langkah 62%). Main automatik 2600ms hanya desktop (`matchMedia('(min-width: 1024px)')`). Sapuan: `pointerdown`/`pointerup`, ambang 40px. Dialog: fokus terkurung, `Escape`, klik latar.
- [ ] **Step 4:** PASS.
- [ ] **Step 5:** Commit `feat(kedai): meja kek`.

### Task 10: Laman utama

**Files:**
- Create: `app/(kedai)/page.tsx`, `components/kedai/Hero.tsx`, `Ticker.tsx`, `TarikhKosong.tsx`, `PilihJenis.tsx`, `JalurReka.tsx`, `CaraTempah.tsx`, `Ulasan.tsx`, `Galeri.tsx`, `SoalanLazim.tsx`, `CtaWhatsApp.tsx`, `lib/data/soalan.ts`
- Test: `tests/e2e/laman-utama.spec.ts`

**Interfaces:**
- Consumes: `bacaKandungan('hero')`, `bakiSlot`, `jalurTarikh`, produk `onTable`, `Faq` `visible`.
- Produces: `senaraiSoalanTerbit(): Promise<{ question: string; answer: string }[]>` (tag `soalan`).

- [ ] **Step 1:** E2E: susunan bahagian sama seperti artboard Main/Home_P (hero → ticker → tarikh kosong → meja kek → pilih ikut jenis → jalur reka → cara tempah → ulasan → galeri → soalan lazim → CTA); tarikh kosong 7 hari dari esok dengan "Penuh" untuk hari tanpa baki; tepat 3 soalan lazim dipapar (seed) dan `details` boleh dibuka; jalur reka memaut ke `/reka`; `axe` tiada isu serious/critical.
- [ ] **Step 2–4:** FAIL → laksana → PASS.
- [ ] **Step 5:** Commit `feat(kedai): laman utama`.

### Task 11: Koleksi dan halaman kek

**Files:**
- Create: `app/(kedai)/koleksi/page.tsx`, `app/(kedai)/kek/[slug]/page.tsx`, `components/kedai/KadKek.tsx`, `PilihSaiz.tsx`, `GaleriKek.tsx`, `lib/senarai/senarai.ts`, `lib/senarai/useSenarai.ts`
- Test: `tests/unit/senarai.test.ts`, `tests/e2e/koleksi.spec.ts`

**Interfaces:**
- Produces:
  - `type Senarai = { v: 1; items: ItemInput[]; addons: AddonInput[]; harga?: number }`
  - `tambahItem(s: Senarai, i: ItemInput): Senarai` (gabung jika produk + saiz + ucapan sama, qty maks 10), `ubahQty(s, indeks, qty)`, `buangItem(s, indeks)`, `ubahAddon(s, addonId, qty, text?)`, `bacaSenarai(raw: string | null): Senarai` (JSON rosak/versi lain → senarai kosong).
  - `useSenarai(): { senarai: Senarai; tambah; ubah; buang; ubahAddon; kosongkan; bil: number }` dengan kunci `yk-senarai-v1`.

- [ ] **Step 1:** Unit untuk fungsi senarai (termasuk JSON rosak). E2E: koleksi — carian "batik" → hanya kek batik; tapis "Kek kahwin" → 5 kek; susun "Harga terendah" → kad pertama `dari RM 45.00`; carian "xyz" → `Tiada kek dijumpai` + butang `Kosongkan carian`. Halaman kek Italian Cake — 3 saiz, tukar ke 10 inci → `RM 380.00`; "Tambah ke senarai" → bilangan header 1; "Tempah di WhatsApp" → rekod `QUICK`.
- [ ] **Step 2–4:** FAIL → laksana ikut Katalog_D/P, Produk_D/P → PASS.
- [ ] **Step 5:** Commit `feat(kedai): koleksi, halaman kek, senarai di browser`.

### Task 12: Senarai tempahan, selepas tempah, semak status, halaman reka

**Files:**
- Create: `app/(kedai)/senarai/page.tsx`, `components/kedai/SenaraiTempahan.tsx`, `JalurTarikh.tsx`, `PilihSlot.tsx`, `TambahSekali.tsx`, `app/(kedai)/tempahan/[ref]/page.tsx`, `app/(kedai)/semak/page.tsx`, `app/(kedai)/reka/page.tsx`
- Test: `tests/e2e/senarai.spec.ts`, `tests/e2e/semak.spec.ts`

**Interfaces:**
- Consumes: `useSenarai`, `buatTempahan`, `semakTempahan`, `bakiSlot` (data dari server component).

- [ ] **Step 1: Ujian gagal.**
  - Aliran penuh phone: tambah 2 kek → +1 lilin set → pilih Hantar + Pekan + alamat → tarikh pertama yang ada → slot 2:00 hingga 4:00 petang → nama → pratonton mesej mengandungi `Lilin set 3 batang x1 (RM6.00)` dan `Hantar ke Pekan` → hantar → halaman `/tempahan/YK-…?t=…` dengan "Buka WhatsApp semula" dan "Salin mesej".
  - Tanpa nama → mesej `Sila isi nama` di sebelah medan; tiada rekod dicipta. Tanpa telefon → `Sila isi nombor telefon`.
  - Senarai kosong → `Senarai kosong.` + butang `Lihat koleksi`.
  - Admin ubah harga sebelum hantar (ubah DB dalam ujian) → notis `Harga dikemas kini` dan jumlah baru dipapar; tekan sekali lagi → hantar.
  - Item dinyahaktif dalam senarai → item dibuang dengan notis `Kek ini tidak lagi ditawarkan`.
  - Slot penuh semasa hantar → `Slot ini baru penuh. Pilih slot lain.`; medan lain kekal.
  - Server gagal (pintas action dengan 500) → butang `WhatsApp terus` muncul.
  - `/tempahan/YK-24100` tanpa token → 404.
  - Semak status: rujukan + 4 digit betul → langkah "Dihantar di WhatsApp" aktif.
  - `/reka` → tajuk "Studio 3D akan datang" + butang WhatsApp tempahan khas.
- [ ] **Step 2–4:** FAIL → laksana ikut Checkout_D, Troli_P, Status_P → PASS.
- [ ] **Step 5:** Commit `feat(kedai): senarai tempahan, selepas tempah, semak status`.

### Task 13: Log masuk dan perlindungan admin

**Files:**
- Create: `lib/auth/supabase.ts`, `lib/auth/admin.ts`, `app/admin/login/page.tsx`, `app/admin/(dilindungi)/layout.tsx`, `components/admin/Sidebar.tsx`, `lib/data/audit.ts`, `scripts/cipta-pemilik.ts`
- Test: `tests/e2e/admin-auth.spec.ts`

**Interfaces:**
- Produces:
  - `requireAdmin(peranan?: 'OWNER'): Promise<{ userId: string; name: string; role: 'OWNER' | 'STAFF' }>` — tiada sesi → `redirect('/admin/login')`; peranan tak cukup → `forbidden()`.
  - `rekodAudit(userId: string, action: string, entity: string, entityId: string, diff: unknown): Promise<void>`.
  - `npm run cipta-pemilik -- --emel x --nama y` (cipta pengguna Supabase + `AdminProfile OWNER`).

- [ ] **Step 1:** E2E: `/admin` tanpa sesi → `/admin/login`; kata laluan salah 5 kali → `Cuba lagi selepas 15 minit`; log masuk betul → papan pemuka dengan sidebar ikut Admin_Dash; pengguna Supabase tanpa `AdminProfile` → ditolak; server action admin dipanggil tanpa sesi → ralat 401.
- [ ] **Step 2–4:** FAIL → laksana (`@supabase/ssr`, kuki httpOnly) → PASS.
- [ ] **Step 5:** Commit `feat(admin): log masuk dan perlindungan`.

### Task 14: Admin tempahan dan papan pemuka

**Files:**
- Create: `app/admin/(dilindungi)/page.tsx`, `tempahan/page.tsx`, `tempahan/[id]/page.tsx`, `tempahan/actions.ts`, `components/admin/JadualTempahan.tsx`, `ButiranTempahan.tsx`
- Test: `tests/e2e/admin-tempahan.spec.ts`

**Interfaces:**
- Produces server action: `tukarStatus(id: string, status: OrderStatus)`, `kemaskiniTempahan(id: string, data: { date?: string; timeSlotId?: string; customerName?: string; phone?: string; address?: string; deliveryFeeSen?: number })` (semak `bakiSlot` bila tarikh/slot berubah), `tandaBayar(id: string, dibayar: boolean)`, `pautanBalas(id: string): Promise<string>` (`waUrl(telefon, isiTemplat(waTemplates[status], {ref, jumlah, caraBayar}))`).

- [ ] **Step 1:** E2E: papan pemuka papar bilangan "Baru hari ini" = tempahan seed hari ini; senarai cari `YK-241` dan tapis status; `BARU_WA` > 48 jam tersembunyi sehingga "Tunjuk semua"; butiran tempahan seed (Italian Cake 6 inci, hantar ke Kuantan, `totalSen` 10000): isi caj hantar RM15 → jumlah dipapar `RM 115.00`; tukar status ke `DISAHKAN` → `AuditLog` bertambah; "Balas di WhatsApp" → href `wa.me/60…` mengandungi rujukan; tempahan cepat: isi tarikh ke hari penuh → `Slot ini penuh`; tapis status tanpa hasil → `Tiada tempahan untuk status ini`.
- [ ] **Step 2–4:** FAIL → laksana ikut Admin_Dash, Admin_Tempahan → PASS.
- [ ] **Step 5:** Commit `feat(admin): tempahan dan papan pemuka`.

### Task 15: Admin produk (draf dan terbit)

**Files:**
- Create: `app/admin/(dilindungi)/produk/page.tsx`, `produk/[id]/page.tsx`, `produk/actions.ts`, `components/admin/BorangProduk.tsx`, `SusunGambar.tsx`, `app/api/upload/route.ts`, `lib/data/terbit.ts`
- Test: `tests/unit/terbit.test.ts`, `tests/e2e/admin-produk.spec.ts`

**Interfaces:**
- Produces: `simpanDrafProduk(id: string, draf: DrafProduk, userId: string)`, `terbitProduk(id: string, userId: string)` (salin draf → lajur, saiz dan gambar diganti dalam transaksi, `revalidateTag('produk')`), `padamProduk(id)` (OWNER; tolak jika ada tempahan aktif — nyahaktif sahaja), `POST /api/upload { bucket: 'produk'|'meja'|'hero', jenis: string, saiz: number } → { url, path }` (URL bertanda tangan Supabase, tolak bukan `image/*` atau > 10 MB).
  - `type DrafProduk = { name; categoryId; description; leadDays; allergens?; storage?; active; onTable; tablePosition?; allowDesign; allowMessage; sizes: { id?; label; priceSen }[]; images: { url; alt }[] }`

- [ ] **Step 1:** Unit: `terbitProduk` mengemas kini lajur dan mengosongkan `draft`; draf dengan saiz kosong ditolak (`Sekurang-kurangnya satu saiz`). E2E: ubah harga 6 inci Italian Cake ke RM110 → "Simpan draf" → laman masih RM 100.00 → "Terbitkan" → laman RM 110.00; Staf tidak nampak "Padam produk"; muat naik PDF → `Hanya gambar`.
- [ ] **Step 2–4:** FAIL → laksana ikut Admin_Produk → PASS.
- [ ] **Step 5:** Commit `feat(admin): produk dengan draf dan terbit`.

### Task 16: Admin gambar meja kek

**Files:**
- Create: `components/admin/PenyuntingGambarMeja.tsx`, `lib/gambar/meja.ts`
- Modify: `app/admin/(dilindungi)/produk/actions.ts` (tambah `simpanDrafGambarMeja`, `terbitGambarMeja`, `pulihGambarMeja`)
- Test: `tests/unit/gambarMeja.test.ts`, `tests/e2e/admin-meja.spec.ts`

**Interfaces:**
- Produces:
  - `kotakKanvas(kotak: { w: number; h: number }, kanvas = { w: 600, h: 900 }): { x: number; y: number; w: number; h: number }` — skala supaya muat 98% tinggi dan 98% lebar, tengah mendatar, dasar di bawah.
  - `normalkanGambarMeja(potongan: ImageBitmap, hakisPx: 0|1|2|3|4): Promise<Blob>` — hakis alfa, potong ke kotak alfa, letak di kanvas 600×900, WebP kualiti 0.86.
  - Server action `simpanDrafGambarMeja(productId, url)`, `terbitGambarMeja(productId)` (lama → `tableImageOriginalUrl`), `pulihGambarMeja(productId)`.

- [ ] **Step 1:** Unit `kotakKanvas`: 300×300 → `{ x: 6, y: 312, w: 588, h: 588 }`; 200×1000 → `{ x: 211.8, y: 18, w: 176.4, h: 882 }`. E2E (model `@imgly` dipintas dengan potongan siap dalam ujian): muat naik → pratonton meja mini → slider hakis → "Simpan" → `tableImageDraftUrl` terisi; "Terbitkan" → laman utama guna URL baru; "Guna gambar sebelum ini" → URL lama dipulihkan; fail `.heic` → mesej `Tukar gambar ke JPG atau PNG dahulu`.
- [ ] **Step 2–4:** FAIL → laksana (`removeBackground` dari `@imgly/background-removal` dimuat malas hanya pada halaman ini; papar "Sedang buang latar…") → PASS.
- [ ] **Step 5:** Commit `feat(admin): gambar meja kek`.

### Task 17: Admin kandungan laman dan soalan lazim

**Files:**
- Create: `app/admin/(dilindungi)/kandungan/page.tsx`, `kandungan/actions.ts`, `app/admin/(dilindungi)/soalan/page.tsx`, `soalan/actions.ts`, `components/admin/PratontonPhone.tsx`
- Test: `tests/unit/soalan.test.ts`, `tests/e2e/admin-kandungan.spec.ts`

**Interfaces:**
- Produces: `simpanDrafKandungan(k: KunciKandungan, nilai)`, `terbitKandungan(k)`, `simpanDrafSoalan(id, q, a)`, `terbitSoalan(id)` — tolak jika soalan atau jawapan mengandungi `[` (`Jawapan masih ada [kurungan]. Isi dahulu sebelum terbit.`), `susunSoalan(ids: string[])`, `tunjukSoalan(id, visible)`; `adaKurungan(teks: string): boolean`.

- [ ] **Step 1:** Unit `adaKurungan`. E2E: ubah tajuk hero → pratonton phone berubah → laman awam belum berubah → Terbitkan → laman berubah; soalan dengan `[3 hari]` → lencana "Perlu diisi" dan Terbitkan ditolak; isi jawapan → terbit → muncul di laman.
- [ ] **Step 2–4:** FAIL → laksana ikut Admin_Kandungan → PASS.
- [ ] **Step 5:** Commit `feat(admin): kandungan dan soalan lazim`.

### Task 18: Admin tetapan

**Files:**
- Create: `app/admin/(dilindungi)/tetapan/page.tsx`, `tetapan/actions.ts`, `components/admin/BorangSlot.tsx`, `BorangTambahan.tsx`, `HariTutup.tsx`
- Test: `tests/e2e/admin-tetapan.spec.ts`

**Interfaces:**
- Produces: `simpanTetapan({ minLeadDays (0..30), dailyCapacity (1..200), holdHours (1..168), whatsappNumber })` (OWNER), `simpanSlot`, `padamSlot` (nyahaktif jika ada tempahan), `tambahHariTutup(date, reason?)`, `buangHariTutup(date)`, `simpanTambahan`.

- [ ] **Step 1:** E2E: Staf → halaman tetapan dibaca sahaja; Pemilik tambah hari tutup esok lusa → hari itu "Tutup" pada jalur tarikh senarai; kapasiti slot 4:00 hingga 6:00 → 0 → slot "Penuh"; harga lilin set → RM7 → senarai kira RM7.00; nombor WhatsApp tidak sah → `Nombor WhatsApp tidak sah`.
- [ ] **Step 2–4:** FAIL → laksana → PASS.
- [ ] **Step 5:** Commit `feat(admin): tetapan`.

### Task 19: Kelajuan, aksesibiliti, deploy dan backup

**Files:**
- Create: `tests/e2e/a11y.spec.ts`, `lighthouserc.json`, `.github/workflows/backup.yml`, `vercel.json` (jika perlu), `README.md`
- Modify: `next.config.ts` (`images.remotePatterns` untuk Supabase, `formats: ['image/avif','image/webp']`), `.github/workflows/ci.yml` (Lighthouse CI)

- [ ] **Step 1:** Ujian: `a11y.spec.ts` (axe pada `/`, `/koleksi`, `/kek/italian-cake`, `/senarai`, phone dan desktop) → tiada serious/critical; `lighthouserc.json` assert phone `performance ≥ 0.9`, `largest-contentful-paint ≤ 2500`, `cumulative-layout-shift ≤ 0.1` untuk `/`, `/koleksi`, `/kek/italian-cake`.
- [ ] **Step 2:** Jalankan → betulkan apa yang gagal (saiz `next/image`, `priority` hanya gambar hero pertama, import dinamik `MejaKek` dialog dan `@imgly`).
- [ ] **Step 3:** `backup.yml`: jadual mingguan Ahad 03:00 MYT, `pg_dump $DATABASE_URL | gzip` sebagai artifact GitHub (simpan 30 hari). README: setup tempatan (`supabase start`, `prisma migrate`, `seed`, `cipta-pemilik`), env, deploy Vercel.
- [ ] **Step 4:** CI hijau; deploy pratonton Vercel; semak manual di phone sebenar: meja kek, tempah cepat, senarai, WhatsApp terbuka.
- [ ] **Step 5:** Commit `chore: kelajuan, aksesibiliti, deploy, backup`.
