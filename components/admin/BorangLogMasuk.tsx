'use client';

import { useActionState } from 'react';
import { logMasuk, type HasilLogMasuk } from '@/app/admin/login/actions';

export function BorangLogMasuk() {
  const [hasil, tindakan, sibuk] = useActionState<HasilLogMasuk, FormData>(logMasuk, undefined);
  return (
    <form action={tindakan} className="grid gap-3.5 mt-5">
      <div>
        <label className="ad-lbl" htmlFor="emel">Emel</label>
        <input id="emel" name="emel" type="email" className="ad-in" autoComplete="username" required defaultValue={hasil?.emel} key={hasil?.emel ?? ''} />
      </div>
      <div>
        <label className="ad-lbl" htmlFor="kataLaluan">Kata laluan</label>
        <input id="kataLaluan" name="kataLaluan" type="password" className="ad-in" autoComplete="current-password" required />
      </div>
      <div aria-live="polite">{hasil?.ralat && <p role="alert" className="text-[13.5px] text-[#8E2620]">{hasil.ralat}</p>}</div>
      <button type="submit" className="ad-btn w-full" disabled={sibuk}>{sibuk ? 'Sedang masuk…' : 'Log masuk'}</button>
    </form>
  );
}
