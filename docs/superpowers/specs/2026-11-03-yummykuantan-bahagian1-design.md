# Yummy Kuantan — Bahagian 1: Asas dan kedai (spec)

Tarikh: 3 November 2026
Status: untuk semakan pemilik projek (Yoi)
Rujukan design (diluluskan): https://claude.ai/artifact/9fPxNAqzxc8DiBbiwWc8a7

---

## 1. Tujuan dan ukuran berjaya

**Tujuan.** Laman web tempahan kek untuk Yummy Kuantan (bisnes kek kakak Yoi, Kuantan). Pelanggan pilih kek dan hantar tempahan terus ke WhatsApp. Pemilik urus produk, gambar, kandungan dan tempahan di admin tanpa sentuh kod.

**Berjaya bila:**
1. Pelanggan di phone boleh pilih kek di meja kek, pilih saiz dan sampai ke WhatsApp dengan mesej lengkap dalam 3 tekan atau kurang.
2. Setiap tempahan yang dihantar ke WhatsApp ada rekod di admin dengan nombor rujukan dan harga yang dikira oleh server.
3. Pemilik boleh tukar produk, harga, gambar meja kek, kandungan laman dan soalan lazim, kemudian terbitkan, tanpa bantuan developer.
4. Tiada dua tempahan dapat slot terakhir yang sama.
5. Lighthouse phone ≥ 90 untuk laman utama, koleksi dan halaman kek.

**Yang pemilik tetapkan:**
- Tiada bayaran online. Harga, slot dan bayaran disahkan di WhatsApp (+60 11-2302 3447).
- Hantar ke Kuantan dan Pekan sahaja. Caj hantar dimaklumkan di WhatsApp (diisi oleh admin per tempahan).
- Tema burgundy dan krim, logo unicorn Yummy Kuantan (versi garis krim di atas burgundy).
- Meja kek di laman utama. Gambar kek di meja boleh ditukar di admin.
- 3D hanya untuk kek tempahan khas (Bahagian 2).
- Kebanyakan pelanggan guna phone: reka untuk 390px dulu.
- Pelanggan tidak perlu akaun.
- Hosting: pelan percuma dahulu (Vercel + Supabase).

## 2. Skop

### Dalam Bahagian 1
- Laman kedai: laman utama (hero, ticker, tarikh kosong, **meja kek**, pilih ikut jenis, jalur reka 3D sebagai pautan, cara tempah, ulasan, galeri, soalan lazim, CTA WhatsApp, footer), koleksi (carian, tapis kategori, susun), halaman kek, senarai tempahan (troli), halaman selepas tempah, semak status.
- Aliran tempahan WhatsApp (tempah cepat dan senarai tempahan) dengan rekod di database.
- Tambahan (lilin, kad ucapan, pisau dan piring, beg hadiah).
- Admin: log masuk, papan pemuka ringkas, tempahan (senarai, butiran, status, caj hantar, tanda bayar, balas WhatsApp), produk, gambar meja kek, kandungan laman, soalan lazim, tetapan (tempah awal, kapasiti, slot, hari tutup, tambahan).
- Data mula dari katalog sebenar.

### Bukan dalam Bahagian 1
- Studio 3D sebenar, simpan reka, gambar rujukan (Bahagian 2). Dalam Bahagian 1, butang "Reka sendiri" dan jalur 3D di laman utama memaut ke halaman "Studio 3D akan datang" yang ada butang WhatsApp untuk tempahan khas.
- Kalendar visual, pelanggan, promosi, laporan, pilihan reka 3D di admin (Bahagian 3).
- Akaun pelanggan, bayaran online, notifikasi emel/SMS.

## 3. Keputusan teknikal

| Perkara | Pilihan | Sebab |
|---|---|---|
| Rangka | Next.js (App Router), TypeScript, Tailwind CSS | Satu projek untuk kedai dan admin; render di server untuk kelajuan phone |
| UI | Komponen sendiri ikut design; shadcn/ui untuk asas admin (dialog, select, toast) | Design kedai sudah diluluskan dan khusus |
| Animasi | Motion for React | Meja kek dan peralihan; ikut `prefers-reduced-motion` |
| Database | PostgreSQL (Supabase) melalui Prisma | Hubungan data jelas, migrasi terkawal |
| Fail | Supabase Storage | Gambar produk, gambar meja, hero |
| Log masuk admin | Supabase Auth (emel + kata laluan) | Percuma, selamat, tiada pendaftaran awam |
| Buang latar gambar meja | Dalam browser admin (`@imgly/background-removal`) | Tiada kos API, tiada server Python |
| Pengesahan input | Zod (dikongsi browser dan server) | Satu sumber peraturan |
| Hosting | Vercel (Hobby) + Supabase (Free) | Kos RM0 untuk mula |
| Ujian | Vitest (unit), Playwright (aliran), axe (aksesibiliti) | |

## 4. Struktur projek

```
yummy-kuantan/
├─ app/
│  ├─ (kedai)/
│  │  ├─ page.tsx                     laman utama
│  │  ├─ koleksi/page.tsx
│  │  ├─ kek/[slug]/page.tsx
│  │  ├─ senarai/page.tsx             senarai tempahan
│  │  ├─ tempahan/[ref]/page.tsx      selepas tempah (perlu token)
│  │  ├─ semak/page.tsx               semak status
│  │  └─ reka/page.tsx                "Studio 3D akan datang" (Bahagian 1)
│  ├─ admin/
│  │  ├─ login/page.tsx
│  │  ├─ page.tsx                     papan pemuka
│  │  ├─ tempahan/ (senarai + [id])
│  │  ├─ produk/ (senarai + [id])
│  │  ├─ kandungan/page.tsx
│  │  ├─ soalan/page.tsx
│  │  └─ tetapan/page.tsx
│  └─ api/upload/route.ts             muat naik gambar (URL bertanda tangan)
├─ components/kedai/                  MejaKek, KadKek, PilihSaiz, JalurTarikh, SenaraiTempahan, ...
├─ components/admin/                  BorangProduk, PenyuntingGambarMeja, JadualTempahan, ...
├─ lib/tempahan/                      fungsi tulen: harga, tarikh/kapasiti, mesej WhatsApp, telefon, rujukan
├─ lib/data/                          akses database (Prisma), satu fail per entiti
├─ lib/auth/                          semakan admin di server
├─ prisma/schema.prisma, prisma/seed.ts
└─ tests/ (unit/, e2e/)
```

Peraturan sempadan:
- `lib/tempahan` tiada import database atau React. Semua fungsi tulen dan diuji dengan unit test.
- Komponen kedai tidak panggil database terus. Data datang dari server component atau server action.
- Semua tindakan admin melalui server action yang memanggil `requireAdmin()` dahulu.

## 5. Model data

Wang dalam sen (integer). Tarikh tempahan sebagai `date` (tiada masa). Masa dipaparkan dalam `Asia/Kuala_Lumpur`.

```
Category        id, name, slug (unik), sortOrder
Product         id, slug (unik), name, categoryId, description, leadDays (int, lalai 3),
                allergens?, storage?, active (bool), onTable (bool), tablePosition (int?),
                allowDesign (bool), allowMessage (bool),
                tableImageUrl?, tableImageOriginalUrl?, tableImageDraftUrl?,
                draft (json?), publishedAt?, createdAt, updatedAt
ProductSize     id, productId, label, priceSen, sortOrder
ProductImage    id, productId, url, alt, sortOrder
Addon           id, name, note, priceSen, textKind (NONE | NUMBER | MESSAGE), active, sortOrder
Settings        id = 1, minLeadDays, dailyCapacity, deliveryAreas (text[] = {Kuantan, Pekan}),
                holdHours (lalai 48), whatsappNumber
TimeSlot        id, label, startsAt (time), endsAt (time), capacity, active, sortOrder
ClosedDate      date (unik), reason?
Order           id, ref (unik, contoh YK-24117), token (rawak, untuk halaman selepas tempah),
                kind (QUICK | LIST), customerName?, phone?, mode (PICKUP | DELIVERY)?,
                area?, address?, date?, timeSlotId?, notes?,
                status (enum di bawah), cakeSubtotalSen, addonSubtotalSen,
                deliveryFeeSen?, totalSen, paidAt?, waMessage (text),
                ipHash, createdAt, updatedAt
OrderItem       id, orderId, productId, productName, sizeLabel, unitPriceSen, qty, cakeMessage?
OrderAddon      id, orderId, addonId, name, unitPriceSen, qty, text?
SiteContent     key (unik), value (json), draft (json?), updatedAt
Faq             id, question, answer, sortOrder, visible, draftQuestion?, draftAnswer?
AdminProfile    userId (Supabase), name, role (OWNER | STAFF)
AuditLog        id, userId, action, entity, entityId, diff (json), createdAt
```

Status tempahan: `BARU_WA`, `MENUNGGU_BAYARAN`, `DISAHKAN`, `DALAM_PENYEDIAAN`, `SEDIA_DIAMBIL`, `DALAM_PENGHANTARAN`, `SELESAI`, `DIBATALKAN`.

Nombor rujukan: `YK-` + jujukan PostgreSQL bermula 24100.

Draf dan terbit:
- Produk: perubahan disimpan dalam `Product.draft` (json). "Terbitkan" menyalin draf ke lajur sebenar, kosongkan draf, set `publishedAt`, rekod `AuditLog`, dan `revalidateTag('produk')`.
- Gambar meja: muat naik ke `tableImageDraftUrl`. Terbit memindahkan ke `tableImageUrl`; gambar lama disimpan dalam `tableImageOriginalUrl` untuk "Guna gambar sebelum ini".
- Kandungan dan soalan lazim: corak sama (`draft` / `draftQuestion` / `draftAnswer`).

## 6. Aliran tempahan

### 6.1 Senarai tempahan di browser
Disimpan dalam `localStorage` (`yk-senarai-v1`): `[{productId, sizeId, qty, cakeMessage}]` dan `[{addonId, qty, text}]`. Harga dalam browser hanya untuk paparan.

### 6.2 Tempah cepat (meja kek, halaman kek)
1. Pelanggan pilih saiz, tekan "Tempah di WhatsApp".
2. Server action `buatTempahanCepat({productId, sizeId, qty, cakeMessage?})` → rekod `Order(kind=QUICK)` tanpa tarikh dan nama.
3. Mesej WhatsApp: kek, saiz, harga, rujukan, dan permintaan "Tarikh yang saya mahu: ..." untuk pelanggan isi.
4. Admin lengkapkan tarikh, slot dan nama semasa mengesahkan (medan boleh disunting di butiran tempahan). Tempahan cepat tanpa tarikh tidak dikira dalam kapasiti sehingga admin isi tarikh.
5. Pendua: kek + saiz + IP sama dalam 10 minit → pulangkan tempahan sedia ada. Had kadar sama seperti 6.3.

### 6.3 Senarai tempahan
1. Pelanggan isi cara terima, kawasan dan alamat (jika hantar), tarikh (jalur 14 hari dengan baki slot), slot, nama, telefon (pilihan), nota, tambahan.
2. Server action `buatTempahan(input)`:
   - Zod: medan wajib, panjang teks (ucapan kek ≤ 30, kad ≤ 120, nota ≤ 500), telefon Malaysia.
   - Kira semula harga dari database. Produk dan saiz mesti aktif. Kuantiti 1–10.
   - Tarikh ≥ hari ini + max(`Settings.minLeadDays`, `leadDays` setiap kek); bukan `ClosedDate`.
   - Dalam satu transaksi `SERIALIZABLE`: kira tempahan aktif untuk tarikh dan slot (status bukan `DIBATALKAN`, dan `BARU_WA` hanya jika `createdAt` dalam `holdHours`); tolak jika slot atau `dailyCapacity` penuh.
   - Hantar: kawasan dalam `deliveryAreas`, alamat ≥ 8 aksara.
   - Pendua: telefon + kek + tarikh sama dalam 10 minit → pulangkan tempahan sedia ada.
   - Had: 10 tempahan / jam / IP (hash). Medan perangkap bot mesti kosong.
3. Simpan `Order`, `OrderItem`, `OrderAddon`, `waMessage`. Pulangkan `{ref, token, waUrl}`.
4. Browser buka `waUrl` (`https://wa.me/601123023447?text=...`) dan pergi ke `/tempahan/[ref]?t=token`.

### 6.4 Halaman selepas tempah
"Tekan hantar di WhatsApp" + butang "Buka WhatsApp semula" + "Salin mesej" + ringkasan tempahan + pautan semak status. Perlu `token` yang betul; tanpa token papar 404.

### 6.5 Semak status
Input rujukan + 4 digit akhir telefon. Papar langkah status ikut design (Dihantar di WhatsApp → Disahkan dan dibayar → Dalam penyediaan → Sedia untuk diambil / Dalam penghantaran → Selesai). Had 20 cubaan / jam / IP.

### 6.6 Mesej WhatsApp (format)
Dibina oleh `binaMesejWhatsApp(order)` sahaja.
```
Salam Yummy Kuantan, saya nak tempah:

1. Italian Cake, 6 inci x1 (RM100.00)
   Tulisan: Selamat Pengantin Baru

Tambahan:
- Lilin set 3 batang x1 (RM6.00)

Tarikh: Rabu, 11 November 2026, 2:00 hingga 4:00 petang
Cara: Ambil sendiri
Nama: Nur Aisyah

Anggaran: RM106.00
Rujukan: YK-24117

Boleh sahkan slot dan cara bayaran? Terima kasih.
```
Untuk hantar: tambah "Cara: Hantar ke Kuantan", "Alamat: ...", dan "(belum termasuk caj penghantaran)".

### 6.7 Balas dari admin
Butang "Balas di WhatsApp" membuka `wa.me/<telefon pelanggan>` dengan templat ikut status, contohnya "Salam, tempahan YK-24117 sudah disahkan. Jumlah {jumlah}. {caraBayar}". Pemboleh ubah `{...}` diisi dari tempahan dan kandungan laman. Templat disimpan dalam `SiteContent` (`waTemplates`).

## 7. Meja kek (`MejaKek`)

Props:
```ts
type KekMeja = { id: string; name: string; category: string; description: string;
  tableImage: string;            // gambar tanpa latar, kanvas 2:3, dasar kek di bawah
  sizes: { id: string; label: string; priceSen: number }[];
  leadDays: number; allowDesign: boolean; href: string };
type MejaKekProps = { items: KekMeja[]; autoplay?: boolean; onTempah: (id: string, sizeId: string) => void };
```
Data: produk `active && onTable` disusun ikut `tablePosition`.

Tingkah laku (ikut design yang diluluskan):
- **Desktop:** semua kek atas satu meja kayu. Tetikus atau fokus papan kekunci menyalakan lampu kek (cahaya dari atas, cahaya di meja, kek terang); kek lain malap; kek sebelah bergerak sedikit ke tepi. Tekan kek yang menyala → butiran.
- **Phone:** satu kek besar di tengah, kek sebelah nampak di tepi; sapu kiri/kanan, butang sebelum/seterusnya, titik. Tiada main automatik di phone.
- **Main automatik (desktop):** lampu bertukar setiap 2.6 saat sehingga pengguna berinteraksi; butang Jeda/Main.
- **Butiran:** kek terangkat ke dialog; saiz mengubah saiz kek (skala 0.8–1.0); harga ikut saiz; "Tempah di WhatsApp", "Lihat kek", "Reka sendiri dalam 3D" jika `allowDesign`. Tutup dengan butang, klik latar atau Esc; fokus kembali ke kek asal.
- **Aksesibiliti:** setiap kek ialah butang dengan label nama dan harga; anak panah kiri/kanan, Home, End; `aria-live` untuk nama kek yang menyala; dialog dengan fokus terkurung.
- **Kurang pergerakan:** tiada main automatik, tiada animasi angkat, peralihan serta-merta.
- **Gambar:** `next/image` dengan saiz 360/540/720 px; kek di luar skrin dimuat malas.

## 8. Admin

Semua halaman di bawah `/admin` memanggil `requireAdmin()` (server). Staf tidak boleh padam produk, tukar tetapan atau urus admin lain.

| Halaman | Isi |
|---|---|
| Log masuk | Emel + kata laluan. Sekat 15 minit selepas 5 cubaan salah. Lupa kata laluan melalui Supabase. |
| Papan pemuka | Tempahan baru hari ini, menunggu bayaran, 7 hari akan datang (ikut tarikh), tempahan cepat yang belum lengkap |
| Tempahan | Senarai, cari (rujukan, nama, telefon), tapis status, tersembunyi `BARU_WA` > 48 jam (ada suis "Tunjuk semua"). Butiran: sunting tarikh/slot/nama/alamat, tukar status, isi caj hantar, tanda bayar, Balas di WhatsApp, sejarah perubahan |
| Produk | Ikut design: gambar (seret susun), nama, kategori, penerangan, saiz dan harga, tempah awal, alergen, cara simpan, suis Aktif / Paparkan di meja kek (+ kedudukan) / Reka sendiri / Tulisan atas kek. Simpan draf, Terbitkan, Padam (Pemilik sahaja, dengan pengesahan) |
| Gambar meja kek | Dalam halaman produk. Muat naik → buang latar dalam browser → pratonton di meja mini → slider "kemaskan tepi" (hakis 0–4 px) → simpan sebagai draf. "Guna gambar sebelum ini". Panduan foto (dari sisi, latar kosong, kek penuh). Hasil dinormalkan ke kanvas 2:3, dasar di bawah |
| Kandungan laman | Hero (tajuk, ayat, gambar slideshow), alamat, waktu buka, WhatsApp, Instagram, TikTok, footer, templat balasan WhatsApp. Draf dan terbit dengan pratonton phone |
| Soalan lazim | Ubah, susun, sembunyi, tambah. Jawapan dengan `[...]` ditanda "Perlu diisi" dan tidak boleh diterbitkan |
| Tetapan | Tempoh tempah awal, kapasiti sehari, slot (label, masa, kapasiti), hari tutup, tambahan (nama, nota, harga, jenis teks), nombor WhatsApp |

## 9. Keselamatan

- Harga dan jumlah sentiasa dikira di server.
- Server action admin: `requireAdmin()` + semakan peranan; semua perubahan direkod dalam `AuditLog`.
- Supabase: Row Level Security aktif; aplikasi guna kunci servis hanya di server; storan awam hanya untuk gambar yang diterbitkan.
- Muat naik: URL bertanda tangan, jenis `image/*`, maksimum 10 MB, nama fail rawak.
- Had kadar pada tempahan, semak status dan log masuk (jadual `RateLimit` di Postgres; tiada perkhidmatan tambahan).
- Teks pelanggan dipaparkan sebagai teks biasa (tiada HTML).
- Kunci dalam environment variable Vercel sahaja.

## 10. Ralat dan keadaan kosong

- Mesej salah dalam Bahasa Melayu di sebelah medan.
- Slot penuh semasa hantar: "Slot ini baru penuh. Pilih slot lain." Input lain kekal.
- Server gagal: "Tak dapat simpan sekarang. Cuba lagi." + butang "WhatsApp terus" (mesej dibina di browser, ditanda "belum direkod").
- Keadaan kosong dengan ayat dan tindakan untuk: senarai tempahan, carian, admin tiada tempahan, produk tanpa gambar meja.
- Ralat server direkod di Vercel log.

## 11. Ujian

**Unit (Vitest), `lib/tempahan`:**
- `kiraHarga`: saiz, kuantiti, tambahan, jumlah; harga browser diabaikan.
- `tarikhDibenarkan`: tempoh tempah awal terpanjang, hari tutup, hari ini/semalam.
- `bakiSlot`: status dikira, `BARU_WA` lebih 48 jam dilepaskan, kapasiti harian.
- `binaMesejWhatsApp`: ambil sendiri, hantar, tempah cepat, tambahan dengan teks.
- `formatTelefon`: `011-2302 3447`, `+60 11-2302 3447`, `601123023447` → `601123023447`; `12345`, `0112302` dan nombor bukan Malaysia ditolak.
- `nomborRujukan`.

**Aliran (Playwright), di 390×844 dan 1440×900:**
1. Laman utama → meja kek → pilih kek → saiz → Tempah → rekod tempahan wujud → pautan WhatsApp mengandungi rujukan dan harga server.
2. Koleksi → halaman kek → tambah ke senarai → tambahan → tarikh → slot → nama → hantar → halaman selepas tempah.
3. Slot terakhir: dua tempahan serentak → satu berjaya, satu dapat "Slot ini baru penuh".
4. Admin log masuk → tukar harga produk → Terbitkan → harga baru di laman.
5. Admin tukar gambar meja → Terbitkan → meja kek guna gambar baru.
6. Semak status dengan rujukan + 4 digit telefon.

**Aksesibiliti:** axe pada laman utama, koleksi, halaman kek, senarai — tiada isu "serious" atau "critical".

## 12. Kelajuan

- Halaman kedai dirender di server dan dicache (`revalidateTag` bila admin terbit).
- Gambar WebP/AVIF melalui `next/image`, saiz ikut skrin, dimuat malas di bawah lipatan.
- Font: Libre Caslon Display, Manrope, Pinyon Script dihos sendiri (`next/font`), subset Latin.
- JavaScript meja kek dimuat hanya di laman utama.
- Sasaran: Lighthouse phone ≥ 90; LCP < 2.5 s di 4G; CLS < 0.1.

## 13. Deploy dan operasi

- GitHub repo; push ke `main` → Vercel production; setiap cabang → pratonton.
- Migrasi Prisma dijalankan dalam langkah build.
- Backup: skrip `pg_dump` mingguan (GitHub Actions) ke storan peribadi; naik taraf ke backup harian Supabase bila pelan berbayar.
- Domain: guna `*.vercel.app` dahulu; domain sendiri disambung bila pemilik sedia.

## 14. Data mula (`prisma/seed.ts`)

- 6 kategori dan 33 produk dari katalog WhatsApp (nama, saiz, harga, penerangan, gambar sebenar).
- 8 kek meja (Italian Cake, 2 Tier Wedding Cake, Birthday Cake, Vintage Love Cake, Tall Cake Italian, Burnt Cheese Cake Italian, 1 Tier Wedding Cake, Brownies Tower) dengan gambar tanpa latar sedia ada.
- 10 soalan lazim. Soalan yang jawapannya sudah pasti (cara tempah, kawasan hantar, warna krim, gambar contoh) diterbitkan. Soalan dengan jawapan `[...]` (halal, bayaran, caj hantar, alamat, cara simpan, batal) disimpan sebagai draf tersembunyi sehingga pemilik isi.
- Tetapan contoh: tempah awal 3 hari (kek kahwin 7), kapasiti 12 sehari, slot 10:00–12:00 (3), 2:00–4:00 (2), 4:00–6:00 (2).
- Tambahan contoh: lilin set RM6, lilin nombor RM5, kad ucapan RM3, pisau dan piring RM4, beg hadiah RM4.
- Akaun Pemilik dicipta melalui skrip setup (emel diberi semasa setup).

## 15. Perkara belum disahkan oleh pemilik (tidak menghalang pembinaan)

Diisi di admin selepas pelancaran: status halal, cara bayar dan deposit, caj hantar Kuantan dan Pekan, alamat dapur dan waktu operasi, tempoh tempah awal sebenar, kapasiti dan slot sebenar, harga tambahan, alergen dan cara simpan setiap kek, polisi batal dan tukar tarikh.
