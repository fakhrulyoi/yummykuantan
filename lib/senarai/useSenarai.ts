'use client';

import { useCallback, useSyncExternalStore } from 'react';
import type { ItemInput } from '@/lib/tempahan/jenis';
import { bacaSenarai, bilKek, buangItem, KOSONG, KUNCI, tambahItem, ubahAddon, ubahQty, type Senarai } from './senarai';

const pendengar = new Set<() => void>();
let cache: { raw: string | null; nilai: Senarai } = { raw: null, nilai: KOSONG };

function baca(): Senarai {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KUNCI);
  } catch {
    return cache.nilai;
  }
  if (raw !== cache.raw) cache = { raw, nilai: bacaSenarai(raw) };
  return cache.nilai;
}

function tulis(s: Senarai) {
  const raw = JSON.stringify(s);
  try {
    window.localStorage.setItem(KUNCI, raw);
  } catch {
    /* storan penuh atau disekat: kekal dalam memori sahaja */
  }
  cache = { raw, nilai: s };
  pendengar.forEach((f) => f());
}

function langgan(f: () => void) {
  pendengar.add(f);
  const dariTab = (e: StorageEvent) => e.key === KUNCI && f();
  window.addEventListener('storage', dariTab);
  return () => {
    pendengar.delete(f);
    window.removeEventListener('storage', dariTab);
  };
}

export function useSenarai() {
  const senarai = useSyncExternalStore(langgan, baca, () => KOSONG);
  const ubah = useCallback((fn: (s: Senarai) => Senarai) => tulis(fn(baca())), []);
  return {
    senarai,
    bil: bilKek(senarai),
    tambah: useCallback((i: ItemInput) => ubah((s) => tambahItem(s, i)), [ubah]),
    ubah: useCallback((indeks: number, qty: number) => ubah((s) => ubahQty(s, indeks, qty)), [ubah]),
    buang: useCallback((indeks: number) => ubah((s) => buangItem(s, indeks)), [ubah]),
    ubahAddon: useCallback((id: string, qty: number, text?: string) => ubah((s) => ubahAddon(s, id, qty, text)), [ubah]),
    tetapHarga: useCallback((harga: number) => ubah((s) => ({ ...s, harga })), [ubah]),
    ganti: useCallback((s: Senarai) => tulis(s), []),
    kosongkan: useCallback(() => tulis(KOSONG), []),
  };
}
