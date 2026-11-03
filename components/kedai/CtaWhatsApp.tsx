import { IkonWhatsApp } from './Ikon';

export function CtaWhatsApp({ waHref, papar, kawasan }: { waHref: string; papar: string; kawasan: string }) {
  return (
    <section aria-labelledby="h-wa" className="mt-10 lg:mt-0 bg-yk-accent text-yk-bg">
      <div className="px-5 py-[30px] lg:max-w-[1360px] lg:mx-auto lg:px-10 lg:py-16 lg:flex lg:flex-wrap lg:justify-between lg:items-center lg:gap-7">
        <div className="lg:max-w-[640px]">
          <h2 id="h-wa" className="text-[32px] leading-[1.02] lg:text-[52px] lg:leading-none text-yk-bg">
            Ada soalan<span className="hidden lg:inline"> tentang kek</span>? Terus WhatsApp kami.
          </h2>
          <p className="mt-2 lg:mt-2.5 lg:text-[17px] text-yk-line">
            {papar}<span className="hidden lg:inline">. Penghantaran sekitar {kawasan}.</span>
          </p>
        </div>
        <a className="b-btn b-dark w-full mt-4 lg:w-auto lg:mt-0 lg:!min-h-[60px] lg:!px-[30px] lg:!text-base" href={waHref}>
          <IkonWhatsApp /> WhatsApp sekarang
        </a>
      </div>
    </section>
  );
}
