const nombor = new Intl.NumberFormat('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** `formatRM(10000) === 'RM 100.00'`; `{ rapat: true }` untuk mesej WhatsApp: `RM100.00`. */
export function formatRM(sen: number, opts?: { rapat?: boolean }): string {
  return `RM${opts?.rapat ? '' : ' '}${nombor.format(sen / 100)}`;
}
