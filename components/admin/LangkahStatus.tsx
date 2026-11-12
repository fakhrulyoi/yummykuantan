'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { tukarStatus } from '@/app/admin/(dilindungi)/tempahan/actions';
import { langkahSeterusnya } from '@/lib/data/labelStatus';
import type { OrderStatus } from '@/lib/tempahan/jenis';

/** Butang sekali tekan untuk langkah status seterusnya. */
export function LangkahStatus({ id, status, mode, besar = false, rujukan }: { id: string; status: OrderStatus; mode: string | null; besar?: boolean; rujukan?: string }) {
  const router = useRouter();
  const [sibuk, mula] = useTransition();
  const [ralat, setRalat] = useState<string | null>(null);
  const l = langkahSeterusnya(status, mode);
  if (!l) return null;
  return (
    <span className={besar ? 'block' : 'inline-block'}>
      <button
        type="button"
        className={`ad-btn ${besar ? 'w-full' : '!min-h-10 !px-3 !text-[13.5px]'}`}
        disabled={sibuk}
        aria-label={rujukan ? `${l.label}, ${rujukan}` : undefined}
        onClick={() =>
          mula(async () => {
            setRalat(null);
            const r = await tukarStatus(id, l.status).catch(() => ({ ok: false as const, ralat: 'Tak dapat simpan. Cuba lagi.' }));
            if (!r.ok) return setRalat(r.ralat);
            router.refresh();
          })
        }
      >
        {sibuk ? 'Menyimpan…' : l.label}
      </button>
      {ralat && <span role="alert" className="block text-[12.5px] text-[#8E2620] mt-1">{ralat}</span>}
    </span>
  );
}
