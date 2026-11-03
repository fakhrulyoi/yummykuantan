import './admin/admin.css';
import Link from 'next/link';

export default function Dilarang() {
  return (
    <div className="ad min-h-screen grid place-items-center bg-[#F6F2EC] text-[#1E1611] px-4">
      <div className="ad-card p-6 max-w-[420px] text-center">
        <h1 className="font-serif font-normal text-[28px]">Tiada kebenaran</h1>
        <p className="text-[#6B5B4E] mt-2">Hanya pemilik kedai boleh buka halaman ini.</p>
        <Link href="/admin" className="ad-btn mt-4">Kembali ke papan pemuka</Link>
      </div>
    </div>
  );
}
