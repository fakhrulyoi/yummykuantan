import './admin/admin.css';
import Link from 'next/link';

export default function TiadaSesi() {
  return (
    <div className="ad min-h-screen grid place-items-center bg-[#F6F2EC] text-[#1E1611] px-4">
      <div className="ad-card p-6 max-w-[420px] text-center">
        <h1 className="font-serif font-normal text-[28px]">Sesi tamat</h1>
        <p className="text-[#6B5B4E] mt-2">Sila log masuk semula untuk teruskan.</p>
        <Link href="/admin/login" className="ad-btn mt-4">Log masuk</Link>
      </div>
    </div>
  );
}
