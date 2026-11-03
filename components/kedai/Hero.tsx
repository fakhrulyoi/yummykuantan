import Image from 'next/image';
import Link from 'next/link';
import type { NilaiKandungan } from '@/lib/kandungan/jenis';
import { SlaidLewat } from './SlaidLewat';

export function Hero({ hero }: { hero: NilaiKandungan['hero'] }) {
  const gambar = hero.gambar.slice(0, 5);
  const tempoh = gambar.length * 6;
  const perkataan = hero.tajuk.split(' ');
  return (
    <section aria-label="Pengenalan" className="relative h-[700px] lg:h-[820px] overflow-hidden bg-yk-bg-deep">
      {gambar.map((g, i) => (
        <div key={g.url} className="yk-slide" style={{ animationDelay: `${i * 6}s`, animationDuration: `${tempoh}s` }}>
          {i === 0 ? (
            <Image src={g.url} alt="" fill priority sizes="100vw" quality={70} style={{ objectFit: 'cover', objectPosition: g.posisi ?? '50% 50%', animationDuration: `${tempoh}s` }} />
          ) : (
            <SlaidLewat>
              <Image src={g.url} alt="" fill sizes="100vw" quality={70} style={{ objectFit: 'cover', objectPosition: g.posisi ?? '50% 50%', animationDuration: `${tempoh}s` }} />
            </SlaidLewat>
          )}
        </div>
      ))}
      <div aria-hidden="true" className="absolute inset-0 lg:hidden" style={{ background: 'linear-gradient(180deg, rgba(42,9,14,.35) 0%, rgba(42,9,14,0) 30%, rgba(42,9,14,.55) 58%, #4B141B 100%)' }} />
      <div aria-hidden="true" className="absolute inset-0 hidden lg:block" style={{ background: 'linear-gradient(90deg, rgba(42,9,14,.92) 0%, rgba(42,9,14,.7) 34%, rgba(42,9,14,.1) 66%, rgba(42,9,14,.35) 100%)' }} />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[220px] hidden lg:block" style={{ background: 'linear-gradient(180deg, rgba(60,13,19,0), #4B141B)' }} />

      <div className="absolute inset-x-5 bottom-[30px] lg:relative lg:inset-auto lg:max-w-[1360px] lg:mx-auto lg:px-10 lg:pt-[120px] lg:h-full">
        <h1 className="text-[50px] leading-[.96] lg:text-[clamp(60px,7.4vw,112px)] lg:max-w-[760px] lg:tracking-[-0.01em]">
          {perkataan.map((w, i) => (
            <span key={i} className="yk-w" style={{ animationDelay: `${(0.05 + i * 0.06).toFixed(2)}s` }}>
              {w}&#160;
            </span>
          ))}
        </h1>
        <span className="yk-gl w-[120px] mt-[18px] lg:w-[180px] lg:mt-7" />
        <p className="yk-in mt-3.5 text-[#ECDDD3] lg:hidden" style={{ animationDelay: '1.1s' }}>{hero.ayatPendek}</p>
        <p className="yk-in hidden lg:block mt-[26px] text-[19px] text-[#ECDDD3] max-w-[470px]" style={{ animationDelay: '1.2s' }}>{hero.ayat}</p>
        <div className="yk-in grid grid-cols-2 gap-2 mt-[18px] lg:flex lg:flex-wrap lg:gap-3 lg:mt-[34px]" style={{ animationDelay: '1.3s' }}>
          <Link className="b-btn yk-pulse !px-2.5 lg:!px-[26px]" href="/koleksi">Lihat koleksi</Link>
          <Link className="b-btn b-line !px-2.5 lg:!px-[26px] bg-[rgba(60,13,19,.5)] lg:bg-transparent" href="/reka">
            <span>Reka kek<span className="hidden lg:inline"> anda</span></span>
          </Link>
        </div>
        <div className="hidden lg:flex absolute left-10 right-10 bottom-11 justify-between items-end gap-5">
          <div className="relative h-[52px] min-w-[320px]">
            {gambar.map((g, i) => (
              <p key={g.url} className="yk-cap absolute left-0 bottom-0 whitespace-nowrap" style={{ animationDelay: `${i * 6}s`, animationDuration: `${tempoh}s` }}>
                <span className="block text-[13px] text-yk-accent font-semibold">Dalam gambar</span>
                <span className="font-serif text-[22px]">{g.nama}</span>
              </p>
            ))}
          </div>
          <div className="flex items-center gap-3.5 text-[13px] text-yk-muted">
            <span>Tatal</span>
            <span className="yk-cue" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}
