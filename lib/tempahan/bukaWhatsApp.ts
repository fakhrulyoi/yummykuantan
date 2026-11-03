/**
 * Buka tetingkap secara serta-merta (sebelum await) supaya tidak disekat pelayar phone,
 * kemudian arahkan ke WhatsApp bila URL sedia.
 */
export function sediaTetingkap(): { pergi: (url: string) => void; batal: () => void } {
  let w: Window | null = null;
  try {
    w = window.open('about:blank', '_blank');
  } catch {
    w = null;
  }
  return {
    pergi(url) {
      if (w && !w.closed) w.location.href = url;
      else window.location.href = url;
    },
    batal() {
      try {
        w?.close();
      } catch {
        /* abaikan */
      }
    },
  };
}
