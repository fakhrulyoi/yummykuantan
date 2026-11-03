const ZON = 'Asia/Kuala_Lumpur';
const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: ZON, year: 'numeric', month: '2-digit', day: '2-digit' });

const HARI = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'];
const BULAN = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];
const HARI_PENDEK = ['Ahd', 'Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab'];
const BULAN_PENDEK = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];

/** Tarikh hari ini di Malaysia sebagai `YYYY-MM-DD`. */
export function hariIniMYT(now: Date): string {
  return fmt.format(now);
}

function kekUTC(tarikh: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(tarikh);
  if (!m) return null;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.toISOString().slice(0, 10) === tarikh ? d : null;
}

export function tambahHari(tarikh: string, hari: number): string {
  const d = kekUTC(tarikh);
  if (!d) throw new Error(`Tarikh tidak sah: ${tarikh}`);
  d.setUTCDate(d.getUTCDate() + hari);
  return d.toISOString().slice(0, 10);
}

export function tarikhAwal(now: Date, leadDays: number[], minLeadDays: number): string {
  return tambahHari(hariIniMYT(now), Math.max(minLeadDays, ...leadDays));
}

export type SebabTarikh = 'FORMAT' | 'TERLALU_AWAL' | 'HARI_TUTUP';

export function tarikhDibenarkan(
  tarikh: string, now: Date, leadDays: number[], minLeadDays: number, tutup: Set<string>,
): { ok: true } | { ok: false; sebab: SebabTarikh } {
  if (!kekUTC(tarikh)) return { ok: false, sebab: 'FORMAT' };
  if (tarikh < tarikhAwal(now, leadDays, minLeadDays)) return { ok: false, sebab: 'TERLALU_AWAL' };
  if (tutup.has(tarikh)) return { ok: false, sebab: 'HARI_TUTUP' };
  return { ok: true };
}

/** `hari` tarikh berturut-turut bermula hari ini (MYT). */
export function jalurTarikh(now: Date, hari: number): string[] {
  const mula = hariIniMYT(now);
  return Array.from({ length: hari }, (_, i) => tambahHari(mula, i));
}

export function tarikhPenuh(tarikh: string): string {
  const d = kekUTC(tarikh);
  if (!d) return tarikh;
  return `${HARI[d.getUTCDay()]}, ${d.getUTCDate()} ${BULAN[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** Untuk jalur tarikh: `{ hari: 'Rab', tarikh: 11, bulan: 'Nov' }`. */
export function tarikhPendek(tarikh: string): { hari: string; tarikh: number; bulan: string } {
  const d = kekUTC(tarikh)!;
  return { hari: HARI_PENDEK[d.getUTCDay()], tarikh: d.getUTCDate(), bulan: BULAN_PENDEK[d.getUTCMonth()] };
}
