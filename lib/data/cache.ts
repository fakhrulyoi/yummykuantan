export const TAG = { produk: 'produk', kandungan: 'kandungan', soalan: 'soalan', tetapan: 'tetapan' } as const;
export type Tag = (typeof TAG)[keyof typeof TAG];
