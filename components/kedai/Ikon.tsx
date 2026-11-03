type P = { size?: number; className?: string };
const svg = (d: React.ReactNode, w = 1.6) =>
  function Ikon({ size = 20, className }: P) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={w} aria-hidden="true" className={className}>
        {d}
      </svg>
    );
  };

export const IkonSenarai = svg(<><path d="M5 8h14l-1.2 12H6.2L5 8z" /><path d="M9 8V6a3 3 0 016 0v2" /></>);
export const IkonCari = svg(<><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></>);
export const IkonMenu = svg(<path d="M4 8h16M4 16h16" />);
export const IkonKembali = svg(<path d="M15 5l-7 7 7 7" />, 1.8);
export const IkonKanan = svg(<path d="M9 5l7 7-7 7" />);
export const IkonWhatsApp = svg(<path d="M4 20l1.3-4A8 8 0 1112 20a8 8 0 01-4-1.1L4 20z" />, 1.7);
export const IkonTutup = svg(<path d="M5 5l14 14M19 5L5 19" />);
