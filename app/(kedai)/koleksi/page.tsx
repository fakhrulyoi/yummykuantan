import type { Metadata } from 'next';
import { Koleksi } from '@/components/kedai/Koleksi';
import { senaraiKategori } from '@/lib/data/kandungan';
import { produkAktif } from '@/lib/data/produk';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Koleksi kek',
  description: 'Kek batik, brownies, Italian cake, kek kahwin dan kek hari jadi. Dibakar ikut tempahan di Kuantan.',
};

export default async function HalamanKoleksi({ searchParams }: { searchParams: Promise<{ kategori?: string }> }) {
  const [{ kategori: k }, produk, kategori] = await Promise.all([searchParams, produkAktif(), senaraiKategori()]);
  const ada = kategori.filter((c) => produk.some((p) => p.categorySlug === c.slug)).map((c) => ({ slug: c.slug, name: c.name }));
  return <Koleksi produk={produk} kategori={ada} kategoriAwal={typeof k === 'string' ? k : null} />;
}
