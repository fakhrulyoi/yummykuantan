import type { BarisAddon, BarisItem } from './jenis';
import { tarikhPenuh } from './tarikh';
import { formatRM } from './wang';

export type MesejTempahan = {
  ref: string;
  kind: 'QUICK' | 'LIST';
  items: BarisItem[];
  addons: BarisAddon[];
  totalSen: number;
  tarikh?: string;
  slotLabel?: string;
  mode?: 'PICKUP' | 'DELIVERY';
  area?: string;
  address?: string;
  name?: string;
  /** Caj hantar yang diketahui (sen); tiada = dimaklumkan di WhatsApp. */
  cajHantarSen?: number | null;
};

const rm = (sen: number) => formatRM(sen, { rapat: true });

/** Satu-satunya tempat mesej WhatsApp tempahan dibina (spec 6.6). */
export function binaMesejWhatsApp(t: MesejTempahan): string {
  const b: string[] = ['Salam Yummy Kuantan, saya nak tempah:', ''];

  t.items.forEach((it, i) => {
    b.push(`${i + 1}. ${it.productName}, ${it.sizeLabel} x${it.qty} (${rm(it.unitPriceSen * it.qty)})`);
    if (it.cakeMessage) b.push(`   Tulisan: ${it.cakeMessage}`);
  });

  if (t.addons.length) {
    b.push('', 'Tambahan:');
    for (const a of t.addons) {
      const teks = a.text ? (/^\d+$/.test(a.text) ? `: ${a.text}` : `: "${a.text}"`) : '';
      b.push(`- ${a.name} x${a.qty} (${rm(a.unitPriceSen * a.qty)})${teks}`);
    }
  }

  b.push('');
  if (t.kind === 'QUICK') {
    b.push(t.tarikh ? `Tarikh yang saya mahu: ${tarikhPenuh(t.tarikh)} (masa ambil atau hantar disahkan di WhatsApp)` : 'Tarikh yang saya mahu: ');
  } else {
    const tarikh = t.tarikh ? tarikhPenuh(t.tarikh) : '';
    b.push(`Tarikh: ${tarikh}${t.slotLabel ? `, ${t.slotLabel}` : ''}`);
    if (t.mode === 'DELIVERY') {
      b.push(`Cara: Hantar ke ${t.area ?? ''}`);
      if (t.address) b.push(`Alamat: ${t.address}`);
    } else {
      b.push('Cara: Ambil sendiri');
    }
    if (t.name) b.push(`Nama: ${t.name}`);
  }

  if (t.mode === 'DELIVERY' && t.cajHantarSen != null) {
    b.push('', `Kek dan tambahan: ${rm(t.totalSen)}`, `Caj hantar ke ${t.area ?? ''}: ${rm(t.cajHantarSen)}`, `Jumlah: ${rm(t.totalSen + t.cajHantarSen)}`);
  } else {
    b.push('', `Anggaran: ${rm(t.totalSen)}${t.mode === 'DELIVERY' ? ' (belum termasuk caj penghantaran)' : ''}`);
  }
  b.push(`Rujukan: ${t.ref}`, '', 'Boleh sahkan slot dan cara bayaran? Terima kasih.');
  return b.join('\n');
}

export function waUrl(nombor: string, mesej: string): string {
  return `https://wa.me/${nombor}?text=${encodeURIComponent(mesej)}`;
}

export function isiTemplat(templat: string, nilai: Record<string, string>): string {
  return templat.replace(/\{(\w+)\}/g, (asal, k: string) => (k in nilai ? nilai[k] : asal));
}
