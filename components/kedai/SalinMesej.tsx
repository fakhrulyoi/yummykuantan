'use client';

import { useState } from 'react';

export function SalinMesej({ mesej }: { mesej: string }) {
  const [keadaan, setKeadaan] = useState<'biasa' | 'disalin' | 'gagal'>('biasa');
  const salin = async () => {
    try {
      await navigator.clipboard.writeText(mesej);
      setKeadaan('disalin');
    } catch {
      setKeadaan('gagal');
    }
  };
  return (
    <>
      <button type="button" className="b-btn b-line w-full" onClick={salin}>Salin mesej</button>
      <p aria-live="polite" className="text-[14.5px] text-yk-muted min-h-5 mt-1">
        {keadaan === 'disalin' ? 'Mesej disalin. Tampal di WhatsApp kami.' : keadaan === 'gagal' ? 'Tak dapat salin. Pilih teks di bawah dan salin sendiri.' : ''}
      </p>
    </>
  );
}
