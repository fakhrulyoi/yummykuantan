/** URL gambar yang dibenarkan disimpan: aset tempatan, muat naik tempatan (dev), atau storan awam Supabase projek ini. */
export function urlGambarSah(url: string): boolean {
  if (/^\/(seed|meja|reka|api\/fail)\/[\w\-./]+$/.test(url) && !url.includes('..')) return true;
  const sb = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !!sb && url.startsWith(`${sb.replace(/\/$/, '')}/storage/v1/object/public/`) && !/[\s"'<>]/.test(url);
}
