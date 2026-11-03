'use client';

import { useEffect, useState } from 'react';

/** Papar anak selepas halaman siap dimuat (gambar hero kedua dan seterusnya), supaya tidak berebut dengan gambar utama. */
export function SlaidLewat({ children, lewatMs = 1200 }: { children: React.ReactNode; lewatMs?: number }) {
  const [sedia, setSedia] = useState(false);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const mula = () => (t = setTimeout(() => setSedia(true), lewatMs));
    if (document.readyState === 'complete') mula();
    else window.addEventListener('load', mula, { once: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener('load', mula);
    };
  }, [lewatMs]);
  return sedia ? <>{children}</> : null;
}
