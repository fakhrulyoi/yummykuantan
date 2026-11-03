// CakeShowcase: featured cakes come from PRODUCTS (admin: "Tonjolkan di laman utama", order, "Reka sendiri" flag).
const SHOW = PRODUCTS.filter((p) => p.feat > 0).sort((a, b) => a.feat - b.feat);
const rm = (n) => 'RM ' + Number(n).toFixed(2);
function showcase(s, set, nearLabel, page) {
  const n = SHOW.length; const i = Math.min(s.sh || 0, n - 1); const p = SHOW[i]; const zi = Math.min(s.shSize || 0, p.sizes.length - 1); const z = p.sizes[zi];
  const go = (k) => set({ sh: (k + n) % n, shSize: 0 });
  return {
    shItems: SHOW.map((x, k) => ({ id: x.id, name: x.name, img: x.hero || x.img, from: rm(x.price), cat: x.cat, on: k === i ? 'true' : 'false', label: x.name + ', dari ' + rm(x.price), pick: () => go(k) })),
    shNo: String(i + 1).padStart(2, '0'), shTotal: String(n).padStart(2, '0'),
    shPrev: () => go(i - 1), shNext: () => go(i + 1),
    shKey: (e) => { if (e.key === 'ArrowRight') { e.preventDefault && e.preventDefault(); go(i + 1); } if (e.key === 'ArrowLeft') { e.preventDefault && e.preventDefault(); go(i - 1); } },
    sh: { name: p.name, cat: p.cat, desc: p.desc, price: rm(z.p), from: rm(p.price), prep: p.prep, near: nearLabel, reka: !!p.reka, oneSize: p.sizes.length === 1, sizeLabel: z.l,
      href: page === 'P' ? 'Produk_P.dc.html' : 'Produk_D.dc.html', rekaHref: page === 'P' ? 'Reka_P.dc.html' : 'Reka_D.dc.html',
      wa: waLink('Salam Yummy Kuantan, saya nak tempah ' + p.name + ', ' + z.l + ' (' + rm(z.p) + ').\nTarikh yang saya mahu: ' + nearLabel + '\n\nBoleh sahkan slot dan cara bayaran? Terima kasih.') },
    shSizes: p.sizes.map((x, k) => ({ l: x.l, price: rm(x.p), on: k === zi ? 'true' : 'false', pick: () => set({ shSize: k }) })),
  };
}
