/** Papar teks; bahagian `[...]` (belum disahkan pemilik) ditanda supaya jelas ia contoh. */
export function TeksTbc({ teks }: { teks: string }) {
  const bahagian = teks.split(/(\[[^\]]+\])/g);
  return (
    <>
      {bahagian.map((b, i) =>
        b.startsWith('[') && b.endsWith(']') ? (
          <span key={i} className="yk-tbc">{b}</span>
        ) : (
          <span key={i}>{b}</span>
        ),
      )}
    </>
  );
}
