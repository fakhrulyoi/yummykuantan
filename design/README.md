# Prototaip design

Sumber canvas design yang diluluskan (https://claude.ai/artifact/9fPxNAqzxc8DiBbiwWc8a7).

- `prototype/build.py` menjana fail `*.dc.html` dari `prototype/pages/` (token `@@...@@` diganti dengan CSS, header, footer, data produk dan pautan gambar).
- `prototype/map.json` memetakan nama gambar ke aset canvas; gambar sebenar ada dalam `../prisma/seed-data/gambar/`.
- Halaman: `Main`/`Home_P` (laman utama web/phone), `Katalog_*`, `Produk_*`, `Reka_*` (studio 3D), `Checkout_D`/`Troli_P` (senarai tempahan), `Status_P`, `Akaun_P`, `Meja_*` (meja kek), `Admin_*`.

Ini rujukan untuk rupa dan tingkah laku sahaja. Kod produksi ditulis semula dalam Next.js ikut pelan.
