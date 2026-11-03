const LANGKAH = [
  { t: 'Pilih kek dan tarikh', d: 'Tengok tarikh yang masih kosong, pilih saiz dan tulisan atas kek.', p: 'Saiz, tulisan atas kek, ambil atau hantar.' },
  { t: 'Tekan Tempah', d: 'WhatsApp terbuka dengan mesej yang siap ditulis. Anda cuma tekan hantar.', p: 'WhatsApp terbuka dengan mesej siap ditulis.' },
  { t: 'Sahkan dan bayar di WhatsApp', d: 'Kami sahkan tarikh, caj penghantaran dan cara bayar. Ambil sendiri atau kami hantar.', p: 'Kami sahkan tarikh dan caj penghantaran.' },
];

export function CaraTempah() {
  return (
    <section id="cara" aria-labelledby="h-cara" className="px-5 pt-10 lg:max-w-[1360px] lg:mx-auto lg:px-10 lg:pt-24 lg:pb-6 scroll-mt-4">
      <h2 id="h-cara" className="text-[28px] lg:text-5xl">Cara tempah</h2>
      <ol className="list-none p-0 mt-3.5 grid gap-3.5 lg:mt-8 lg:grid-cols-3 lg:gap-7">
        {LANGKAH.map((l, i) => (
          <li key={l.t} className="flex gap-3.5 border-t border-yk-line pt-3.5 lg:block lg:border-yk-accent lg:pt-[18px]">
            <span className="font-serif text-[40px] lg:text-[56px] leading-none text-yk-accent" aria-hidden="true">{i + 1}</span>
            <span className="lg:block">
              <h3 className="font-sans font-bold text-[15.5px] lg:font-serif lg:font-normal lg:text-[26px] lg:mt-2.5">{l.t}</h3>
              <span className="text-yk-muted text-sm lg:hidden">{l.p}</span>
              <p className="hidden lg:block mt-1.5 text-yk-muted">{l.d}</p>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
