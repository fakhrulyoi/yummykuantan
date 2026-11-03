import Image from 'next/image';

export function Logo({ tinggi, priority = false }: { tinggi: number; priority?: boolean }) {
  return (
    <Image
      src="/logo-krim.png"
      alt="Yummy Kuantan"
      width={260}
      height={360}
      priority={priority}
      sizes={`${Math.ceil((tinggi * 260) / 360)}px`}
      style={{ height: tinggi, width: 'auto' }}
    />
  );
}
