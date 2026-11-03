# Yummy Kuantan

Laman web tempahan kek untuk Yummy Kuantan, Kuantan. Pelanggan pilih kek (atau reka kek sendiri) dan hantar tempahan terus ke WhatsApp. Pemilik urus produk, gambar, kandungan dan tempahan di admin.

## Status

Peringkat: design diluluskan, spec dan pelan Bahagian 1 siap. Kod belum dimulakan.

- Design (canvas): https://claude.ai/artifact/9fPxNAqzxc8DiBbiwWc8a7
- Spec Bahagian 1: [`docs/superpowers/specs/2026-11-03-yummykuantan-bahagian1-design.md`](docs/superpowers/specs/2026-11-03-yummykuantan-bahagian1-design.md)
- Pelan kerja Bahagian 1: [`docs/superpowers/plans/2026-11-03-yummykuantan-bahagian1.md`](docs/superpowers/plans/2026-11-03-yummykuantan-bahagian1.md)

## Pecahan projek

1. **Asas dan kedai** — katalog, meja kek, senarai tempahan, tempahan WhatsApp, admin asas.
2. **Studio 3D** — reka kek 3D sebenar (React Three Fiber), simpan reka, gambar rujukan.
3. **Admin penuh** — kalendar, pelanggan, promosi, laporan, pilihan reka 3D.

## Struktur repo (sekarang)

- `docs/` — spec dan pelan.
- `design/prototype/` — sumber prototaip canvas (penjana halaman `build.py`, halaman, logik studio, senarai tempahan, meja kek). Rujukan sahaja, bukan kod produksi.
- `design/aset/logo/` — logo versi garis krim dan versi warna.
- `prisma/seed-data/gambar/` — foto produk dari katalog dan gambar meja kek tanpa latar, untuk data mula.

## Teknologi (dirancang)

Next.js (App Router), TypeScript, Tailwind CSS, Motion, Prisma + PostgreSQL (Supabase), Supabase Auth dan Storage, Vercel. Ujian: Vitest, Playwright, axe.

## Hubungi kedai

WhatsApp +60 11-2302 3447 · Instagram dan TikTok @yummykuantan · Hantar ke Kuantan dan Pekan.
