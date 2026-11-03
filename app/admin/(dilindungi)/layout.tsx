import { Sidebar } from '@/components/admin/Sidebar';
import { requireAdmin } from '@/lib/auth/admin';

export const dynamic = 'force-dynamic';

export default async function LayoutDilindungi({ children }: { children: React.ReactNode }) {
  const a = await requireAdmin();
  return (
    <div className="lg:flex min-h-screen">
      <Sidebar nama={a.name} peranan={a.role} />
      <main className="flex-1 min-w-0 px-4 py-5 lg:px-8 lg:pt-7 lg:pb-12 flex flex-col gap-5">{children}</main>
    </div>
  );
}
