import { tarikhPenuh, hariIniMYT } from '@/lib/tempahan/tarikh';

/** Tajuk halaman admin ikut design (sub kecil di atas, tajuk serif). */
export function TajukAdmin({ tajuk, sub, children }: { tajuk: string; sub: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap justify-between items-end gap-4">
      <div>
        <p className="text-[13px] text-[#6B5B4E]">{sub}</p>
        <h1 className="font-serif font-normal text-[30px] lg:text-4xl mt-0.5">{tajuk}</h1>
      </div>
      <div className="flex gap-2 items-center">
        {children}
        <span className="text-[13.5px] text-[#6B5B4E] whitespace-nowrap">{tarikhPenuh(hariIniMYT(new Date()))}</span>
      </div>
    </div>
  );
}
