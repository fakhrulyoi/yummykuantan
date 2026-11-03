import { describe, expect, test } from 'vitest';
import { binaMesejWhatsApp, isiTemplat, waUrl, type MesejTempahan } from '@/lib/tempahan/mesej';

const asas: MesejTempahan = {
  ref: 'YK-24117',
  kind: 'LIST',
  items: [{ productId: 'p', productName: 'Italian Cake', sizeLabel: '6 inci', unitPriceSen: 10000, qty: 1, cakeMessage: 'Selamat Pengantin Baru', leadDays: 3 }],
  addons: [{ addonId: 'a', name: 'Lilin set 3 batang', unitPriceSen: 600, qty: 1 }],
  totalSen: 10600,
  tarikh: '2026-11-11',
  slotLabel: '2:00 hingga 4:00 petang',
  mode: 'PICKUP',
  name: 'Nur Aisyah',
};

describe('binaMesejWhatsApp', () => {
  test('contoh spec 6.6 (ambil sendiri)', () => {
    expect(binaMesejWhatsApp(asas)).toBe(
      [
        'Salam Yummy Kuantan, saya nak tempah:',
        '',
        '1. Italian Cake, 6 inci x1 (RM100.00)',
        '   Tulisan: Selamat Pengantin Baru',
        '',
        'Tambahan:',
        '- Lilin set 3 batang x1 (RM6.00)',
        '',
        'Tarikh: Rabu, 11 November 2026, 2:00 hingga 4:00 petang',
        'Cara: Ambil sendiri',
        'Nama: Nur Aisyah',
        '',
        'Anggaran: RM106.00',
        'Rujukan: YK-24117',
        '',
        'Boleh sahkan slot dan cara bayaran? Terima kasih.',
      ].join('\n'),
    );
  });

  test('hantar ke Kuantan', () => {
    const m = binaMesejWhatsApp({ ...asas, mode: 'DELIVERY', area: 'Kuantan', address: 'No 5, Jalan Beserah' });
    expect(m).toContain('Cara: Hantar ke Kuantan\nAlamat: No 5, Jalan Beserah\nNama: Nur Aisyah');
    expect(m).toContain('Anggaran: RM106.00 (belum termasuk caj penghantaran)');
  });

  test('tempahan cepat minta tarikh, tiada Cara dan Nama', () => {
    const m = binaMesejWhatsApp({ ref: 'YK-24118', kind: 'QUICK', items: [{ ...asas.items[0], cakeMessage: undefined }], addons: [], totalSen: 10000 });
    expect(m).toContain('Tarikh yang saya mahu: ');
    expect(m).not.toContain('Cara:');
    expect(m).not.toContain('Nama:');
    expect(m).not.toContain('Tambahan:');
    expect(m).toContain('Rujukan: YK-24118');
  });

  test('beberapa kek, kuantiti dan tambahan dengan teks', () => {
    const m = binaMesejWhatsApp({
      ...asas,
      items: [asas.items[0], { productId: 'b', productName: 'Kekbatik Ganache', sizeLabel: '7 inci', unitPriceSen: 4800, qty: 2, leadDays: 3 }],
      addons: [
        { addonId: 'k', name: 'Kad ucapan', unitPriceSen: 300, qty: 1, text: 'Selamat hari jadi' },
        { addonId: 'n', name: 'Lilin nombor', unitPriceSen: 500, qty: 1, text: '25' },
      ],
    });
    expect(m).toContain('2. Kekbatik Ganache, 7 inci x2 (RM96.00)');
    expect(m).toContain('- Kad ucapan x1 (RM3.00): "Selamat hari jadi"');
    expect(m).toContain('- Lilin nombor x1 (RM5.00): 25');
  });
});

describe('waUrl', () => {
  test('aksara khas selamat dalam pautan', () => {
    const mesej = binaMesejWhatsApp({ ...asas, items: [{ ...asas.items[0], cakeMessage: 'Selamat #1 & semua?\nJumpa 🎉' }] });
    const url = waUrl('601123023447', mesej);
    expect(url.startsWith('https://wa.me/601123023447?text=')).toBe(true);
    expect(decodeURIComponent(url.split('text=')[1])).toBe(mesej);
    expect(url.slice('https://wa.me/'.length)).not.toMatch(/[#&\s]/);
    expect(url.split('?').length).toBe(2);
  });
});

describe('isiTemplat', () => {
  test('ganti kunci, biar kunci yang tiada', () => {
    expect(isiTemplat('Tempahan {ref}. Jumlah {jumlah}. {lain}', { ref: 'YK-1', jumlah: 'RM10.00' })).toBe('Tempahan YK-1. Jumlah RM10.00. {lain}');
  });
});
