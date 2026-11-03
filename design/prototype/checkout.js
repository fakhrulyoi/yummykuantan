const WA_NO = '601123023447'; const waLink = (t) => 'https://wa.me/' + WA_NO + '?text=' + encodeURIComponent(t);
class Component extends DCLogic {
  constructor(p) { super(p); this.state = { items: [{ id: 'a', name: 'Italian Cake', opt: '6 inci', note: 'Tulisan: Selamat Pengantin Baru', price: 100, qty: 1, img: '@@IMG:04_02@@' }, { id: 'b', name: 'Kekbatik Indulgence Cheese', opt: '7 inci', note: '', price: 55, qty: 2, img: '@@IMG:01_01@@' }], mode: 'pickup', area: 'Kuantan', day: 7, slot: 1, addr: '', name: '', phone: '', notes: '', tried: false, sent: false, add: { candle: 0, number: 0, card: 0, knife: 0, bag: 0 }, numText: '', cardText: '' }; }
  renderVals() {
    const s = this.state;
    const sel = (b) => (b ? 'true' : 'false');
    const days = [['Sab', 7, 0], ['Ahd', 8, 0], ['Isn', 9, 2], ['Sel', 10, 5], ['Rab', 11, 7], ['Kha', 12, 3], ['Jum', 13, 9], ['Sab', 14, 4], ['Ahd', 15, 1], ['Isn', 16, -1], ['Sel', 17, 8], ['Rab', 18, 10], ['Kha', 19, 6], ['Jum', 20, 12]];
    const dayName = { Sab: 'Sabtu', Ahd: 'Ahad', Isn: 'Isnin', Sel: 'Selasa', Rab: 'Rabu', Kha: 'Khamis', Jum: 'Jumaat' };
    const slots = [['10:00 hingga 12:00 pagi', 3], ['2:00 hingga 4:00 petang', 2], ['4:00 hingga 6:00 petang', 0]];
    // add-ons (sample prices, editable in admin)
    const ADD = [['candle', 'Lilin set 3 batang', 'Lilin putih panjang', 6], ['number', 'Lilin nombor', 'Emas, satu nombor setiap batang', 5], ['card', 'Kad ucapan', 'Kami tulis tangan ucapan anda', 3], ['knife', 'Pisau kek dan piring kertas', 'Set 10 piring', 4], ['bag', 'Beg kertas hadiah', 'Untuk dibawa sebagai hadiah', 4]];
    const add = s.add; const addSub = ADD.reduce((a, [k, , , p]) => a + p * add[k], 0);
    const cakeSub = s.items.reduce((a, i) => a + i.price * i.qty, 0);
    const sub = cakeSub + addSub;
    const setAdd = (k, n) => this.setState({ add: { ...add, [k]: Math.max(0, Math.min(10, n)) } });
    const d = days[s.day];
    const errs = [];
    if (!s.items.length) errs.push('sekurang-kurangnya satu kek');
    if (!s.name.trim()) errs.push('nama');
    if (s.phone.replace(/\D/g, '').length < 9) errs.push('nombor telefon');
    if (s.mode === 'delivery' && s.addr.trim().length < 8) errs.push('alamat penghantaran');
    const when = dayName[d[0]] + ', ' + d[1] + ' November 2026, ' + slots[s.slot][0];
    if (add.number && !s.numText.trim()) errs.push('nombor untuk lilin nombor');
    if (add.card && !s.cardText.trim()) errs.push('ucapan untuk kad');
    const addLines = ADD.filter(([k]) => add[k]).map(([k, n, , p]) => '- ' + n + ' x' + add[k] + ' (RM' + p * add[k] + ')' + (k === 'number' ? ': ' + (s.numText || '-') : k === 'card' ? ': "' + (s.cardText || '-') + '"' : '')).join('\n');
    const lines = s.items.map((i, k) => (k + 1) + '. ' + i.name + ', ' + i.opt + ' x' + i.qty + ' (RM' + i.price * i.qty + ')' + (i.note ? '\n   ' + i.note : '')).join('\n');
    const text = 'Salam Yummy Kuantan, saya nak tempah:\n\n' + lines + (addLines ? '\n\nTambahan:\n' + addLines : '') + '\n\nTarikh: ' + when + '\nCara: ' + (s.mode === 'delivery' ? 'Penghantaran ke ' + s.area + '\nAlamat: ' + (s.addr || '-') : 'Ambil sendiri') + '\nNama: ' + (s.name || '-') + (s.phone ? '\nTelefon: ' + s.phone : '') + (s.notes ? '\nNota: ' + s.notes : '') + '\n\nAnggaran: RM' + sub + (s.mode === 'delivery' ? ' (belum termasuk caj penghantaran)' : '') + '\nRujukan: YK-24117\n\nBoleh sahkan slot dan cara bayaran? Terima kasih.';
    const upd = (id, f) => this.setState({ items: s.items.map((i) => (i.id === id ? f(i) : i)).filter((i) => i.qty > 0) });
    return {
      cart: s.items.reduce((a, i) => a + i.qty, 0),
      items: s.items.map((i) => ({ ...i, line: i.price * i.qty, hasNote: !!i.note, inc: () => upd(i.id, (x) => ({ ...x, qty: Math.min(10, x.qty + 1) })), dec: () => upd(i.id, (x) => ({ ...x, qty: x.qty - 1 })), remove: () => upd(i.id, (x) => ({ ...x, qty: 0 })) })),
      empty: s.items.length === 0,
      isPickup: sel(s.mode === 'pickup'), isDelivery: sel(s.mode === 'delivery'), delivery: s.mode === 'delivery',
      setPickup: () => this.setState({ mode: 'pickup' }), setDelivery: () => this.setState({ mode: 'delivery' }),
      areas: ['Kuantan', 'Pekan'].map((a) => ({ name: a, on: sel(s.area === a), pick: () => this.setState({ area: a }) })),
      days: days.map(([dow, n, left], i) => ({ dow, date: n, full: left <= 0, status: left < 0 ? 'Cuti' : left === 0 ? 'Penuh' : left + ' slot', color: left <= 0 ? '#B0827F' : left <= 3 ? '#F2C28E' : '#BCD7AE', on: sel(s.day === i), pick: () => this.setState({ day: i, slot: 1 }) })),
      slots: slots.map(([t, left], i) => ({ t, note: left ? left + ' lagi' : 'Penuh', full: left === 0, on: sel(s.slot === i), pick: () => this.setState({ slot: i }) })),
      whenLabel: when,
      addr: s.addr, setAddr: (e) => this.setState({ addr: e.target.value }),
      name: s.name, setName: (e) => this.setState({ name: e.target.value }), phone: s.phone, setPhone: (e) => this.setState({ phone: e.target.value }),
      notes: s.notes, setNotes: (e) => this.setState({ notes: e.target.value }),
      addons: ADD.map(([k, n, note, p]) => ({ name: n, note, price: 'RM ' + p, qty: add[k], on: add[k] > 0 ? 'true' : 'false', inc: () => setAdd(k, add[k] + 1), dec: () => setAdd(k, add[k] - 1), decDis: add[k] === 0 })),
      hasNumber: add.number > 0, numText: s.numText, setNum: (e) => this.setState({ numText: e.target.value.replace(/[^0-9 ,]/g, '').slice(0, 12) }),
      hasCard: add.card > 0, cardText: s.cardText, cardLen: s.cardText.length, setCard: (e) => this.setState({ cardText: e.target.value.slice(0, 120) }),
      cakeSub, addSub, hasAdd: addSub > 0,
      sub, feeLabel: s.mode === 'pickup' ? 'Ambil sendiri, tiada caj' : 'Dimaklumkan di WhatsApp',
      preview: text,
      ok: errs.length === 0, notOk: errs.length > 0,
      showErr: s.tried && errs.length > 0, errText: 'Sila isi ' + errs.join(', ') + ' dulu.',
      tryIt: () => this.setState({ tried: true }),
      wa: waLink(text), markSent: () => this.setState({ sent: true }), sent: s.sent,
    };
  }
}
