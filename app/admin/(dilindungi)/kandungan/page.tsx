import Link from 'next/link';
import { BorangKandungan } from '@/components/admin/BorangKandungan';
import { TajukAdmin } from '@/components/admin/TajukAdmin';
import { requireAdmin } from '@/lib/auth/admin';
import { db } from '@/lib/data/db';
import * as s from '@/lib/data/skema';
import { bacaUntukSunting, kunciSah } from '@/lib/data/kandunganAdmin';
import type { KunciKandungan } from '@/lib/kandungan/jenis';

export const metadata = { title: 'Kandungan laman' };

const BAHAGIAN: { k: KunciKandungan; nama: string }[] = [
  { k: 'hero', nama: 'Bahagian utama (hero)' },
  { k: 'hubungi', nama: 'Hubungi, alamat dan waktu' },
  { k: 'ulasan', nama: 'Kata pelanggan' },
  { k: 'galeri', nama: 'Galeri dari dapur' },
  { k: 'footer', nama: 'Footer' },
  { k: 'waTemplates', nama: 'Templat balasan WhatsApp' },
];

export default async function HalamanKandungan({ searchParams }: { searchParams: Promise<{ b?: string }> }) {
  await requireAdmin();
  const { b } = await searchParams;
  const k: KunciKandungan = typeof b === 'string' && kunciSah(b) ? b : 'hero';
  const [d, semua] = await Promise.all([bacaUntukSunting(k), db.select({ key: s.siteContent.key, value: s.siteContent.value, draft: s.siteContent.draft }).from(s.siteContent)]);
  const perlu = new Set(semua.filter((r) => JSON.stringify(r.draft ?? r.value).includes('[')).map((r) => r.key));
  const nama = BAHAGIAN.find((x) => x.k === k)!.nama;
  return (
    <>
      <TajukAdmin tajuk="Kandungan laman" sub="Ubah teks dan gambar laman. Simpan draf dahulu, kemudian Terbitkan." />
      <div className="flex gap-4 flex-wrap items-start">
        <nav className="ad-card overflow-hidden flex-[1_1_240px] lg:flex-[0_0_240px]" aria-label="Bahagian laman">
          <p className="ad-th px-3.5 py-2.5">Bahagian</p>
          {BAHAGIAN.map((x) => (
            <Link key={x.k} href={`/admin/kandungan?b=${x.k}`} aria-current={x.k === k ? 'page' : undefined} className="k-sec !no-underline">
              <span>{x.nama}</span>
              {perlu.has(x.k) && <span className="ad-badge !h-[22px] !text-[11.5px] bg-[#FFF1D6] text-[#7A4B00]">Perlu diisi</span>}
            </Link>
          ))}
          <Link href="/admin/soalan" className="k-sec !no-underline">Urus soalan lazim</Link>
        </nav>
        <BorangKandungan key={k} kunci={k} awal={d.nilai} terbit={d.terbit} adaDraf={d.adaDraf} tajuk={nama} />
      </div>
    </>
  );
}
