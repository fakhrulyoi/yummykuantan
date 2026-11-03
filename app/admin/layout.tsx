import type { Metadata } from 'next';
import './admin.css';

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s · Admin Yummy Kuantan' },
  robots: { index: false, follow: false },
};

export default function LayoutAdmin({ children }: { children: React.ReactNode }) {
  return <div className="ad min-h-screen bg-[#F6F2EC] text-[#1E1611] text-[14.5px] leading-normal">{children}</div>;
}
