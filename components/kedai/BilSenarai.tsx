'use client';

import Link from 'next/link';
import { useSenarai } from '@/lib/senarai/useSenarai';
import { IkonSenarai } from './Ikon';

export function PautanSenaraiPhone() {
  const { bil } = useSenarai();
  return (
    <Link className="b-ic relative" href="/senarai" aria-label={`Senarai tempahan, ${bil} kek`}>
      <IkonSenarai />
      <span
        aria-hidden="true"
        className="absolute top-[5px] right-[3px] min-w-[18px] h-[18px] rounded-full bg-yk-accent text-yk-bg text-[11px] font-bold leading-[18px] text-center px-1"
      >
        {bil}
      </span>
    </Link>
  );
}

export function PautanSenaraiDesktop() {
  const { bil } = useSenarai();
  return (
    <Link
      href="/senarai"
      className="inline-flex items-center gap-2 min-h-11 px-3.5 border border-yk-line-strong rounded-full no-underline font-semibold text-[14.5px]"
    >
      <IkonSenarai />
      Senarai ({bil})
    </Link>
  );
}
