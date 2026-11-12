import type { NilaiKandungan } from '@/lib/kandungan/jenis';

export function Ulasan({ ulasan }: { ulasan: NilaiKandungan['ulasan'] }) {
  if (!ulasan.petikan.length) return null;
  return (
    <section aria-labelledby="h-rev" className="pt-10 lg:max-w-[1360px] lg:mx-auto lg:px-10 lg:pt-[72px] lg:pb-24">
      <div className="px-5 lg:px-0 lg:flex lg:justify-between lg:items-end lg:gap-4 lg:flex-wrap">
        <h2 id="h-rev" className="text-[28px] lg:text-5xl">Kata pelanggan</h2>
        <p className="hidden lg:block text-yk-muted text-[15.5px]">Dipetik daripada mesej WhatsApp pelanggan</p>
      </div>
      <div tabIndex={0} role="group" aria-label="Petikan pelanggan, leret untuk lihat lagi" className="flex gap-3.5 overflow-x-auto snap-x snap-mandatory scroll-px-5 px-5 pt-3.5 pb-1.5 lg:grid lg:grid-cols-4 lg:gap-9 lg:p-0 lg:mt-8 lg:overflow-visible">
        {ulasan.petikan.map((u) => (
          <figure key={u.teks} className="flex-none w-[290px] snap-start m-0 border-t border-yk-accent pt-3.5 lg:w-auto lg:pt-5">
            <blockquote className="m-0 font-serif text-[21px] lg:text-2xl leading-[1.35]">{u.teks}</blockquote>
            <figcaption className="mt-2.5 lg:mt-3.5 text-yk-muted text-[15px] lg:text-[15px]">{u.oleh}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
