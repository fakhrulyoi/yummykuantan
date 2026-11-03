export type KekMeja = {
  id: string;
  name: string;
  category: string;
  description: string;
  /** gambar tanpa latar, kanvas 2:3, dasar kek di bawah */
  tableImage: string;
  sizes: { id: string; label: string; priceSen: number }[];
  leadDays: number;
  allowDesign: boolean;
  href: string;
};
export type MejaKekProps = { items: KekMeja[]; autoplay?: boolean };
