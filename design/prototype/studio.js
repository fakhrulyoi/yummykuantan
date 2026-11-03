const WA_NO = '601123023447'; const waLink = (t) => 'https://wa.me/' + WA_NO + '?text=' + encodeURIComponent(t);
class Component extends DCLogic {
  constructor(p) { super(p); this.state = { tab: 0, shape: 'round', tiers: 2, size: 8, flavour: 'Vanila', filling: 'Krim strawberi', color: 'blush', hex: '', custom: false, hexErr: '', angle: 1, decor: { fruit: true, rosette: true }, msg: 'Selamat Hari Jadi, Aisyah', font: 'script', ink: '#7A4E3A', saved: false, sheet: false, sent: false, cart: 0, notes: '', refs: [], refErr: '' }; }
  renderVals() {
    const s = this.state;
    const sel = (b) => (b ? 'true' : 'false');
    const shapeName = { round: 'Bulat', square: 'Segi empat', heart: 'Hati', rect: 'Segi empat panjang' };
    const shapeExtra = { round: 0, square: 15, heart: 25, rect: 30 };
    const base = { 4: 45, 6: 100, 8: 160, 10: 230 };
    const flavours = [['Vanila', 0], ['Coklat', 0], ['Pandan', 0], ['Mentega tulen', 10], ['Red velvet', 10], ['Matcha', 15]];
    const fillings = [['Krim strawberi', 0], ['Krim vanila', 0], ['Ganache coklat', 8], ['Karamel masin', 10], ['Biscoff', 12], ['Sos gula melaka', 8]];
    const decor = [['fruit', 'Strawberi segar', 'Penuh di atas kek', 25], ['rosette', 'Piping krim', 'Tepi atas dan bawah', 0], ['pearl', 'Mutiara gula', 'Satu jalur setiap tingkat', 15], ['macaron', 'Makaron', '4 biji, warna lembut', 30], ['ribbon', 'Reben satin', 'Sekeliling tingkat bawah', 12], ['gold', 'Daun emas', 'Boleh dimakan', 25], ['candle', 'Lilin', 'Set 3 batang', 6], ['topper', 'Topper nama', 'Akrilik emas. Pratonton guna contoh nama', 25], ['print', 'Cetakan foto', 'Tidak dipaparkan dalam pratonton. Gambar disahkan di WhatsApp', 35]];
    const sizes = []; for (let i = 0; i < s.tiers; i++) sizes.push(s.size - i * 2);
    const turntable = s.shape === 'round' && s.tiers === 2;
    const ck = s.custom ? 'ivory' : s.color;
    const view = turntable ? 't' + s.angle : { round: s.tiers === 1 ? 'r1' : 'r3', square: 'sq', heart: 'ht', rect: 'rc' }[s.shape];
    // layered preview: base cake sprite + one transparent sprite per chosen decoration, drawn in physical order.
    // Each sprite holds 13 views side by side: t0..t7 (round 2-tier turntable), r1, r3, sq, ht, rc.
    const VIEWS = ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7', 'r1', 'r3', 'sq', 'ht', 'rc'];
    const pos = (VIEWS.indexOf(view) * 100 / 12).toFixed(4) + '% 0';
    const layerKeys = [];
    if (s.decor.rosette) layerKeys.push('S_L_piping_' + ck);
    ['pearl', 'ribbon', 'fruit'].forEach((k) => { if (s.decor[k]) layerKeys.push('S_L_' + k); });
    if (s.decor.macaron) layerKeys.push('S_L_' + (s.decor.fruit ? 'macaron_f' : 'macaron'));
    ['gold', 'candle', 'topper'].forEach((k) => { if (s.decor[k]) layerKeys.push('S_L_' + k); });
    const refs = s.refs || [];
    const addRefs = (e) => {
      const files = Array.from((e.target && e.target.files) || []); let err = '';
      const ok = files.filter((f) => { if (!/^image\//.test(f.type)) { err = 'Hanya gambar JPG, PNG atau HEIC.'; return false; } if (f.size > 10 * 1024 * 1024) { err = 'Gambar melebihi 10 MB. Pilih gambar yang lebih kecil.'; return false; } return true; });
      const room = 4 - refs.length; if (ok.length > room) err = 'Maksimum 4 gambar rujukan.';
      const add = ok.slice(0, Math.max(0, room)).map((f) => ({ name: f.name, url: URL.createObjectURL(f) }));
      this.setState({ refs: refs.concat(add), refErr: err }); if (e.target) e.target.value = '';
    };
    const lines = [{ label: shapeName[s.shape] + ', ' + s.size + ' inci', v: base[s.size] + shapeExtra[s.shape] }];
    sizes.slice(1).forEach((z, i) => lines.push({ label: (i ? 'Tingkat ketiga' : 'Tingkat kedua') + ', ' + z + ' inci', v: base[z] }));
    const f = flavours.find((x) => x[0] === s.flavour); if (f[1]) lines.push({ label: 'Sponge ' + f[0].toLowerCase(), v: f[1] * s.tiers });
    const fi = fillings.find((x) => x[0] === s.filling); if (fi[1]) lines.push({ label: 'Inti ' + fi[0].toLowerCase(), v: fi[1] * s.tiers });
    if (s.custom) lines.push({ label: 'Padanan warna khas', v: 10 });
    decor.forEach(([k, n, , p]) => { if (s.decor[k] && p) lines.push({ label: n, v: k === 'pearl' ? p * s.tiers : p }); });
    const total = lines.reduce((a, l) => a + l.v, 0);
    const needs = s.tiers === 3 || s.custom || s.decor.print || s.decor.topper;
    const topSize = sizes[sizes.length - 1]; const msgMax = topSize <= 4 ? 14 : topSize <= 6 ? 22 : 30;
    const tabs = ['Bentuk', 'Saiz', 'Rasa', 'Warna', 'Hiasan', 'Tulisan dan rujukan'];
    const fonts = { script: ['Tulisan tangan', "'Pinyon Script', cursive", '20px'], serif: ['Serif', "'Libre Caslon Display', serif", '16px'], sans: ['Moden', "'Manrope', sans-serif", '15px'] };
    // krim segar: reject colours that are too dark or too saturated
    const check = (v) => { const m = /^#?([0-9a-fA-F]{6})$/.exec(v.trim()); if (!m) return 'format'; const n = parseInt(m[1], 16); const r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); const l = (mx + mn) / 2; const sat = mx === mn ? 0 : (l > .5 ? (mx - mn) / (2 - mx - mn) : (mx - mn) / (mx + mn)); if (l < 0.72) return 'dark'; if (sat > 0.6 && l < 0.9) return 'bright'; return ''; };
    return {
      cart: s.cart,
      img: IMGS['S_B_' + ck], pos, layers: layerKeys.map((k) => ({ src: IMGS[k] })), alt: 'Pratonton kek ' + shapeName[s.shape].toLowerCase() + ', ' + s.tiers + ' tingkat',
      summary: shapeName[s.shape] + ', ' + s.tiers + ' tingkat, ' + sizes.join(' + ') + ' inci',
      summary2: 'Sponge ' + s.flavour.toLowerCase() + ', inti ' + s.filling.toLowerCase(),
      angle: s.angle, noRotate: !turntable,
      setAngle: (e) => this.setState({ angle: +e.target.value }),
      rotL: () => this.setState({ angle: (s.angle + 7) % 8 }), rotR: () => this.setState({ angle: (s.angle + 1) % 8 }),
      saveLabel: s.saved ? 'Disimpan' : 'Simpan reka', save: () => this.setState({ saved: true }),
      refLine: s.saved ? 'Disimpan sebagai YK-D-261103-0427' : 'Belum disimpan',
      tabs: tabs.map((t, i) => ({ label: t, n: i + 1, on: sel(s.tab === i), pick: () => this.setState({ tab: i }) })),
      tShape: s.tab === 0, tSize: s.tab === 1, tFlavour: s.tab === 2, tColour: s.tab === 3, tDecor: s.tab === 4, tMsg: s.tab === 5,
      isFirst: s.tab === 0, prevTab: () => this.setState({ tab: Math.max(0, s.tab - 1) }),
      nextLabel: s.tab === 5 ? 'Semak harga' : 'Seterusnya: ' + tabs[s.tab + 1], nextTab: () => s.tab === 5 ? this.setState({ sheet: true }) : this.setState({ tab: s.tab + 1 }),
      shapes: Object.keys(shapeName).map((k) => ({ name: shapeName[k], note: shapeExtra[k] ? '+RM ' + shapeExtra[k] : 'Termasuk', on: sel(s.shape === k), pick: () => this.setState({ shape: k, tiers: k === 'round' ? s.tiers : 1 }) })),
      tierOpts: [1, 2, 3].map((n) => { const dis = (n > 1 && s.shape !== 'round') || (n === 3 && s.size < 8) || (n === 2 && s.size < 6); return { name: ['Satu', 'Dua', 'Tiga'][n - 1], note: n > 1 && s.shape !== 'round' ? 'Bulat sahaja' : dis ? 'Perlu ' + (n === 3 ? 8 : 6) + ' inci' : n === 1 ? 'Termasuk' : '+' + (n === 2 ? (s.size - 2) : (s.size - 2) + '+' + (s.size - 4)) + ' inci', on: sel(s.tiers === n), dis, pick: () => this.setState({ tiers: n }) }; }),
      sizeOpts: [4, 6, 8, 10].map((z) => { const dis = (s.tiers === 3 && z < 8) || (s.tiers === 2 && z < 6); return { name: z + ' inci', note: dis ? 'Terlalu kecil' : 'Hidang ' + { 4: '2 hingga 4', 6: '10 hingga 12', 8: '18 hingga 22', 10: '30 hingga 35' }[z] + ', RM ' + base[z], on: sel(s.size === z), dis, pick: () => this.setState({ size: z }) }; }),
      flavours: flavours.map(([n, p]) => ({ name: n, note: p ? '+RM ' + p + ' setingkat' : 'Termasuk', on: sel(s.flavour === n), pick: () => this.setState({ flavour: n }) })),
      fillings: fillings.map(([n, p]) => ({ name: n, note: p ? '+RM ' + p + ' setingkat' : 'Termasuk', on: sel(s.filling === n), pick: () => this.setState({ filling: n }) })),
      swatches: COLORS.map(([k, n, h]) => ({ name: n, hex: h, on: sel(!s.custom && s.color === k), pick: () => this.setState({ color: k, custom: false, hex: '', hexErr: '' }) })),
      hex: s.hex, hexVal: s.custom ? s.hex : '#F3EBDD',
      setHex: (e) => { const v = e.target.value; const c = check(v); if (!c) this.setState({ hex: ('#' + v.trim().replace('#', '')).toUpperCase(), custom: true, hexErr: '' }); else this.setState({ hex: v, hexErr: v.length ? c : '' }); },
      setPicker: (e) => { const v = e.target.value.toUpperCase(); const c = check(v); c ? this.setState({ hex: v, hexErr: c }) : this.setState({ hex: v, custom: true, hexErr: '' }); },
      hexNote: s.hexErr === 'format' ? 'Masukkan 6 aksara selepas #, contoh #EBC4BA.' : s.hexErr === 'dark' ? 'Warna ini terlalu gelap untuk krim segar. Pilih warna yang lebih lembut.' : s.hexErr === 'bright' ? 'Warna ini terlalu terang untuk krim segar. Pilih warna yang lebih lembut.' : s.custom ? 'Warna khas dipadankan dengan tangan, +RM 10. Pratonton menunjukkan krim putih.' : 'Warna pilihan di atas tiada caj tambahan.',
      hexColor: s.hexErr ? '#FFB9AE' : '#D3B1AB',
      decor: decor.map(([k, n, note, p]) => ({ name: n, note, price: p ? '+RM ' + (k === 'pearl' ? p * s.tiers : p) : 'Termasuk', on: !!s.decor[k], toggle: () => this.setState({ decor: { ...s.decor, [k]: !s.decor[k] } }) })),
      msg: s.msg.slice(0, msgMax), msgLen: Math.min(s.msg.length, msgMax), msgMax, setMsg: (e) => this.setState({ msg: e.target.value }),
      fonts: Object.keys(fonts).map((k) => ({ name: fonts[k][0], css: fonts[k][1], size: fonts[k][2], on: sel(s.font === k), pick: () => this.setState({ font: k }) })),
      inks: [['Coklat lembut', '#7A4E3A'], ['Putih', '#FFFFFF'], ['Emas', '#B8925A'], ['Merah jambu', '#D98C95']].map(([n, h]) => ({ name: n, hex: h, on: sel(s.ink === h), pick: () => this.setState({ ink: h }) })),
      refs: refs.map((r, i) => ({ url: r.url, name: r.name, label: 'Buang gambar ' + (i + 1), remove: () => this.setState({ refs: refs.filter((_, j) => j !== i), refErr: '' }) })),
      hasRefs: refs.length > 0, canAddRef: refs.length < 4, addRefs, refErr: s.refErr, refCount: refs.length + '/4',
      refNote: refs.length ? 'Gambar disimpan bersama reka anda. Pautannya dimasukkan dalam mesej WhatsApp supaya kami boleh lihat.' : 'Ada gambar dari Pinterest, TikTok atau galeri? Tambah di sini, tak perlu hantar asing.',
      notes: s.notes, setNotes: (e) => this.setState({ notes: e.target.value }),
      total: total.toLocaleString('ms-MY'),
      lines: lines.map((l) => ({ label: l.label, amount: 'RM ' + l.v })),
      sheet: s.sheet, openSheet: () => this.setState({ sheet: true }), closeSheet: () => this.setState({ sheet: false }),
      needs, primaryLabel: 'Hantar reka di WhatsApp',
      primary: () => this.setState({ sent: true, saved: true }), sent: s.sent,
      wa: waLink('Salam Yummy Kuantan, saya nak tempah kek reka sendiri:\n\nRujukan reka: YK-D-261103-0427\nBentuk: ' + shapeName[s.shape] + ', ' + s.tiers + ' tingkat (' + sizes.join(' + ') + ' inci)\nSponge: ' + s.flavour + '\nInti: ' + s.filling + '\nWarna krim: ' + (s.custom ? 'Khas ' + s.hex : COLORS.find((c) => c[0] === s.color)[1]) + '\nHiasan: ' + (decor.filter(([k]) => s.decor[k]).map(([, n]) => n).join(', ') || 'Tiada') + '\nTulisan: ' + (s.msg ? s.msg.slice(0, msgMax) : 'Tiada') + (refs.length ? '\nGambar rujukan: ' + refs.length + ' gambar, [pautan galeri reka]' : '') + (s.notes ? '\nNota: ' + s.notes : '') + '\n\nAnggaran: RM' + total + '\nPratonton 3D: [pautan reka]\n\nBoleh semak dan sahkan harga serta tarikh? Terima kasih.'),
      needsNote: 'Harga ini anggaran. Kami semak reka anda dan sahkan harga, tarikh serta cara bayaran di WhatsApp.',
    };
  }
}
