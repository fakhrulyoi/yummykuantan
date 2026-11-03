import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Untuk /admin: segarkan sesi Supabase (kuki), dan tolak server action tanpa sesi dengan 401
 * sebelum sampai ke kod halaman. Semakan profil dan peranan dibuat semula dalam setiap tindakan (requireAdminTindakan).
 */
export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const kunci = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !kunci) return res;

  const sb = createServerClient(url, kunci, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (senarai) => {
        for (const { name, value } of senarai) req.cookies.set(name, value);
        res = NextResponse.next({ request: req });
        for (const { name, value, options } of senarai) {
          res.cookies.set(name, value, { ...options, httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
        }
      },
    },
  });
  const { data } = await sb.auth.getUser();

  const tindakan = req.method === 'POST' && req.headers.has('next-action');
  const login = req.nextUrl.pathname === '/admin/login';
  if (tindakan && !login && !data.user) {
    return NextResponse.json({ ralat: 'Sesi tamat. Sila log masuk semula.' }, { status: 401 });
  }
  return res;
}

export const config = { matcher: ['/admin', '/admin/:path*'] };
