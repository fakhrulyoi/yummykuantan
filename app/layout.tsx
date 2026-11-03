import type { Metadata, Viewport } from 'next';
import { sans, script, serif } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Yummy Kuantan', template: '%s · Yummy Kuantan' },
  description: 'Kek tempahan di Kuantan. Pilih kek, tempah terus di WhatsApp. Hantar ke Kuantan dan Pekan.',
};

export const viewport: Viewport = { themeColor: '#4B141B' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ms" className={`${serif.variable} ${sans.variable} ${script.variable}`}>
      <body>{children}</body>
    </html>
  );
}
