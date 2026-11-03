'use client';

import { useEffect, useRef, useState } from 'react';

/** `true` sekali sahaja bila elemen hampir masuk skrin. Untuk tangguh gambar latar CSS di bawah lipatan. */
export function useNampak<T extends Element>(margin = '400px') {
  const ref = useRef<T>(null);
  const [nampak, setNampak] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || nampak) return;
    if (!('IntersectionObserver' in window)) return setNampak(true);
    const io = new IntersectionObserver((e) => {
      if (e.some((x) => x.isIntersecting)) {
        setNampak(true);
        io.disconnect();
      }
    }, { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [margin, nampak]);
  return [ref, nampak] as const;
}
