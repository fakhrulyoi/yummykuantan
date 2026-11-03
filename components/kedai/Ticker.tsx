export function Ticker({ nama }: { nama: string[] }) {
  const baris = (salinan: boolean) =>
    nama.map((n, i) => (
      <span
        key={`${salinan}-${i}`}
        aria-hidden={salinan || undefined}
        className="inline-flex items-center gap-[22px] pr-[22px] lg:gap-9 lg:pr-9 font-serif text-[26px] lg:text-[40px] whitespace-nowrap"
        style={{ color: i % 2 ? '#EBCFC3' : '#F2E7DE' }}
      >
        {n}
        <span aria-hidden="true" className="w-[7px] h-[7px] lg:w-2.5 lg:h-2.5 rounded-full bg-yk-accent" />
      </span>
    ));
  return (
    <section aria-label="Jenis kek" className="yk-mqwrap border-y border-yk-line py-3.5 lg:py-[22px] bg-[#3F1017]">
      <div className="yk-mq" style={{ ['--d' as string]: '40s' }}>
        {baris(false)}
        {baris(true)}
      </div>
    </section>
  );
}
