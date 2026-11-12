import { sudahDiisi } from '@/lib/kandungan/kurungan';

/** Papar teks hanya jika sudah diisi pemilik. Teks `[...]` (belum disahkan) tidak dipapar langsung di laman. */
export function TeksTbc({ teks, sebelum = '', selepas = '' }: { teks: string | null | undefined; sebelum?: string; selepas?: string }) {
  if (!sudahDiisi(teks)) return null;
  return <>{sebelum}{teks}{selepas}</>;
}
