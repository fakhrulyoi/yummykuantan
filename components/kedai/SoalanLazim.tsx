import { TeksTbc } from './TeksTbc';

export function SoalanLazim({ soalan, waHref }: { soalan: { question: string; answer: string }[]; waHref: string }) {
  if (!soalan.length) return null;
  return (
    <section id="soalan" aria-labelledby="h-faq" className="px-5 pt-10 lg:max-w-[1360px] lg:mx-auto lg:px-10 lg:pt-6 lg:pb-24 lg:flex lg:flex-wrap lg:gap-x-16 lg:gap-y-8 scroll-mt-4">
      <div className="lg:flex-[1_1_280px] lg:max-w-[360px]">
        <h2 id="h-faq" className="text-[28px] lg:text-5xl lg:leading-none">Soalan lazim</h2>
        <p className="hidden lg:block mt-2.5 text-yk-muted">Jawapan untuk soalan yang paling kerap ditanya di WhatsApp.</p>
        <p className="hidden lg:block mt-3.5"><a href={waHref} className="font-semibold">Tak jumpa jawapan? Tanya di WhatsApp</a></p>
      </div>
      <div className="mt-2.5 border-t border-yk-line lg:mt-0 lg:flex-[999_1_560px]">
        {soalan.map((s) => (
          <details key={s.question} className="yk-faq">
            <summary className="font-serif font-normal text-[17px] lg:text-[22px]">{s.question}</summary>
            <p className="text-yk-cream-2 text-sm lg:text-base pb-[18px] lg:pr-10"><TeksTbc teks={s.answer} /></p>
          </details>
        ))}
      </div>
      <p className="lg:hidden text-[13px] text-yk-muted mt-3">
        Tak jumpa jawapan? <a href={waHref} className="font-semibold">Tanya di WhatsApp</a>
      </p>
    </section>
  );
}
