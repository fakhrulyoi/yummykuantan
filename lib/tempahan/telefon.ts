/** Normalkan nombor telefon Malaysia ke `60XXXXXXXXX`; pulangkan `null` jika tidak sah. */
export function formatTelefon(input: string): string | null {
  let d = input.replace(/\D/g, '');
  if (d.startsWith('0')) d = `6${d}`;
  if (!d.startsWith('601')) return null;
  if (d.length < 11 || d.length > 12) return null;
  return d;
}

export function empatAkhir(telefon: string): string {
  return telefon.replace(/\D/g, '').slice(-4);
}
