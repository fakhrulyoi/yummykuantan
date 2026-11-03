import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

function env(nama: string): string {
  const v = process.env[nama];
  if (!v) throw new Error(`${nama} belum ditetapkan`);
  return v;
}

/** Klien Supabase untuk komponen server, server action dan route handler. Sesi dalam kuki httpOnly. */
export async function supabaseServer() {
  const kuki = await cookies();
  return createServerClient(env('NEXT_PUBLIC_SUPABASE_URL'), env('NEXT_PUBLIC_SUPABASE_ANON_KEY'), {
    cookies: {
      getAll: () => kuki.getAll(),
      setAll: (senarai) => {
        try {
          for (const { name, value, options } of senarai) kuki.set(name, value, { ...options, httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
        } catch {
          // Dipanggil dari komponen server: kuki tidak boleh ditulis di sini; middleware menyegarkan sesi.
        }
      },
    },
  });
}

/** Klien dengan kunci service role. Hanya untuk skrip dan tugasan pelayan yang dipercayai (bukan untuk input pengguna). */
export function supabasePentadbir() {
  return createClient(env('NEXT_PUBLIC_SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
