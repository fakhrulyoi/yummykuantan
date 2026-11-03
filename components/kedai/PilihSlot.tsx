'use client';

export type SlotPapar = { id: string; label: string; baki: number };

export function PilihSlot({ slot, pilih, onPilih, ralat }: { slot: SlotPapar[]; pilih: string | null; onPilih: (id: string) => void; ralat?: string }) {
  return (
    <>
      <h3 className="font-serif font-normal text-2xl lg:text-[13.5px] lg:font-sans lg:font-semibold lg:text-yk-cream-2 px-4 pt-4 lg:px-0 lg:pt-0 lg:mt-[18px] lg:mb-1.5">Masa</h3>
      <div
        role="group"
        aria-label="Masa"
        aria-describedby={ralat ? 'ralat-slot' : undefined}
        className="grid gap-1.5 px-4 pt-2.5 lg:grid-cols-3 lg:gap-2 lg:p-0"
      >
        {slot.map((t) => (
          <button
            key={t.id}
            type="button"
            className="b-pill flex justify-between items-center lg:block lg:text-left"
            aria-pressed={pilih === t.id}
            disabled={t.baki <= 0}
            onClick={() => onPilih(t.id)}
          >
            {t.label}
            <span className="text-[12.5px] text-yk-muted lg:block">{t.baki > 0 ? `${t.baki} lagi` : 'Penuh'}</span>
          </button>
        ))}
      </div>
      {ralat && <p id="ralat-slot" className="px-4 lg:px-0 mt-1.5 text-[13.5px] text-yk-error">{ralat}</p>}
    </>
  );
}
