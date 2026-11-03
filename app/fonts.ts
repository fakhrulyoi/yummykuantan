import localFont from 'next/font/local';

export const serif = localFont({
  src: './fonts/LibreCaslonDisplay.woff2',
  weight: '400',
  variable: '--font-serif',
  display: 'swap',
});

export const sans = localFont({
  src: './fonts/Manrope.woff2',
  weight: '200 800',
  variable: '--font-sans',
  display: 'swap',
});

export const script = localFont({
  src: './fonts/PinyonScript.woff2',
  weight: '400',
  variable: '--font-script',
  display: 'swap',
});
