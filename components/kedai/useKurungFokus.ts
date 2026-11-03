'use client';

import { useEffect, type RefObject } from 'react';

const BOLEH_FOKUS = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';

/** Kurung fokus dalam dialog, tutup dengan Escape, pulangkan fokus kepada pencetus. */
export function useKurungFokus(
  ref: RefObject<HTMLElement | null>,
  aktif: boolean,
  tutup: () => void,
  pencetus?: RefObject<HTMLElement | null> | (() => HTMLElement | null),
) {
  useEffect(() => {
    if (!aktif) return;
    const el = ref.current;
    const asal = typeof pencetus === 'function' ? pencetus() : pencetus?.current ?? (document.activeElement as HTMLElement | null);
    const pertama = el?.querySelector<HTMLElement>(BOLEH_FOKUS);
    pertama?.focus();
    const kekunci = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        tutup();
        return;
      }
      if (e.key !== 'Tab' || !el) return;
      const semua = [...el.querySelectorAll<HTMLElement>(BOLEH_FOKUS)].filter((x) => x.offsetParent !== null);
      if (!semua.length) return;
      const a = semua[0];
      const z = semua[semua.length - 1];
      if (e.shiftKey && document.activeElement === a) {
        e.preventDefault();
        z.focus();
      } else if (!e.shiftKey && document.activeElement === z) {
        e.preventDefault();
        a.focus();
      }
    };
    document.addEventListener('keydown', kekunci);
    return () => {
      document.removeEventListener('keydown', kekunci);
      asal?.focus?.();
    };
  }, [aktif, ref, tutup, pencetus]);
}
