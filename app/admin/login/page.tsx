import type { Metadata } from 'next';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { BorangLogMasuk } from '@/components/admin/BorangLogMasuk';
import { adminSemasa } from '@/lib/auth/admin';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Log masuk' };

export default async function HalamanLogMasuk() {
  if (await adminSemasa()) redirect('/admin');
  return (
    <div className="min-h-screen grid place-items-center px-4 py-10">
      <div className="w-full max-w-[400px]">
        <div className="flex items-center gap-3 justify-center">
          <Image src="/logo-warna.png" alt="" width={64} height={64} className="h-16 w-auto" priority />
          <div>
            <p className="font-serif text-2xl leading-[1.1]">Yummy Kuantan</p>
            <p className="text-[13px] text-[#6B5B4E]">Panel admin</p>
          </div>
        </div>
        <div className="ad-card p-6 mt-6">
          <h1 className="font-serif font-normal text-[28px]">Log masuk</h1>
          <p className="text-[13.5px] text-[#6B5B4E] mt-1">Untuk pemilik dan staf kedai sahaja.</p>
          <BorangLogMasuk />
        </div>
      </div>
    </div>
  );
}
