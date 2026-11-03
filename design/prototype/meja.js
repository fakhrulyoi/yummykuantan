// Meja kek (CakeTable): cakes standing on a long table. Light one by hovering, focusing or tapping; open it to see the details.
// Data comes from PRODUCTS (admin: "Paparkan di meja", order, cut-out photo, "Tunjuk butang Reka sendiri").
const MEJA = PRODUCTS.filter((p) => p.feat > 0 && CUT[p.id]).sort((a, b) => a.feat - b.feat).map((p) => ({ ...p, cutImg: CUT[p.id] }));
let MEJA_X = null;
const rmx = (n) => 'RM ' + Number(n).toFixed(2);
function meja(s, set, page) {
  const n = MEJA.length; const lit = s.lit; const auto = s.auto;
  const choose = (i) => set({ lit: i, auto: false });
  const items = MEJA.map((p, i) => {
    const on = lit === i; const shift = lit === null || lit === undefined || on ? 0 : (i < lit ? -1 : 1) * (page === 'P' ? 0 : 16);
    return {
      id: p.id, name: p.name, img: p.cutImg, x: page === 'P' ? (19 + i * 62 + 31) + '%' : ((i + 0.5) / n * 100).toFixed(3) + '%', label: p.name + ', dari ' + rmx(p.price) + '. Tekan untuk lihat.',
      on: on ? 'true' : 'false', tab: on || (lit == null && i === 0) ? '0' : '-1',
      tx: shift + 'px', lift: on ? '-8px' : '0px', glow: on ? '1' : '0',
      hover: () => { if (lit !== i) choose(i); }, focus: () => { if (lit !== i) choose(i); },
      tap: () => { if (lit === i) set({ open: i, auto: false, size: 0 }); else choose(i); },
    };
  });
  const cur = lit === null || lit === undefined ? null : MEJA[lit];
  const op = s.open === null || s.open === undefined ? null : MEJA[s.open];
  const zi = op ? Math.min(s.size || 0, op.sizes.length - 1) : 0; const z = op ? op.sizes[zi] : null;
  const scaleFor = (k, m) => (m > 1 ? 0.8 + (0.2 * k) / (m - 1) : 1);
  return {
    mItems: items, mHasLit: !!cur, mNoLit: !cur,
    mName: cur ? cur.name : '', mTag: cur ? 'dari ' + rmx(cur.price) : '', mDesc: cur ? cur.desc : '',
    mOpenLit: () => { if (lit != null) set({ open: lit, auto: false, size: 0 }); },
    mKey: (e) => { const k = e.key; if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(k)) return; e.preventDefault && e.preventDefault(); const from = lit == null ? 0 : lit; choose(k === 'Home' ? 0 : k === 'End' ? n - 1 : Math.max(0, Math.min(n - 1, from + (k === 'ArrowRight' ? 1 : -1)))); },
    mPrev: () => choose(((lit == null ? 0 : lit) - 1 + n) % n), mNext: () => choose(((lit == null ? -1 : lit) + 1) % n),
    mDots: MEJA.map((p, i) => ({ on: lit === i ? 'true' : 'false', w: lit === i ? '22px' : '7px', pick: () => choose(i), label: 'Kek ' + (i + 1) })),
    mTrack: page === 'P' ? 'translateX(' + (-(lit == null ? 0 : lit) * 62) + '%)' : 'none',
    mDown: (e) => { MEJA_X = e.clientX; }, mUp: (e) => { if (MEJA_X == null) return; const dx = e.clientX - MEJA_X; MEJA_X = null; if (Math.abs(dx) > 40) choose(Math.max(0, Math.min(n - 1, (lit == null ? 0 : lit) + (dx < 0 ? 1 : -1)))); },
    mAutoLabel: auto ? 'Jeda' : 'Main', mToggleAuto: () => set({ auto: !auto }),
    // detail
    dOpen: !!op, dClose: () => set({ open: null }), dKey: (e) => { if (e.key === 'Escape') set({ open: null }); },
    d: op ? { name: op.name, cat: op.cat, desc: op.desc, img: op.cutImg, no: String(s.open + 1).padStart(2, '0') + ' / ' + String(n).padStart(2, '0'),
      price: rmx(z.p), size: z.l, scale: scaleFor(zi, op.sizes.length).toFixed(3), prep: op.prep, reka: !!op.reka,
      href: page === 'P' ? 'Produk_P.dc.html' : 'Produk_D.dc.html', rekaHref: page === 'P' ? 'Reka_P.dc.html' : 'Reka_D.dc.html',
      wa: waLink('Salam Yummy Kuantan, saya nak tempah ' + op.name + ', ' + z.l + ' (' + rmx(z.p) + ').\n\nBoleh sahkan tarikh, slot dan cara bayaran? Terima kasih.') } : {},
    dSizes: op ? op.sizes.map((x, k) => ({ l: x.l, price: rmx(x.p), on: k === zi ? 'true' : 'false', pick: () => set({ size: k }) })) : [],
    dMulti: op ? op.sizes.length > 1 : false,
  };
}
