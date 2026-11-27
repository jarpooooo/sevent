export type ProductKey = "denim" | "kaos" | "katun" | "chino";

/** Warna ubin per produk, sama dengan legenda di Figma. `dark` = teks gelap di atas ubin. */
export const PRODUCTS: Record<ProductKey, { name: string; short: string; color: string; dark: boolean }> = {
  denim: { name: "Offcut denim polos", short: "Offcut denim polos", color: "#16746a", dark: false },
  kaos: { name: "Sisa potongan kaos polos non-branded", short: "Potongan kaos polos", color: "#3f7f7a", dark: false },
  katun: { name: "Perca katun polos", short: "Perca katun polos", color: "#86afab", dark: true },
  chino: { name: "Sisa potongan chino non-branded", short: "Potongan chino", color: "#e8a33d", dark: true },
};

export type ChartTile = {
  id: string;
  product: ProductKey;
  kg: number;
  value: number;
  /** belum dikonfirmasi UMKM: ubin putus-putus */
  pending?: boolean;
};

export type ChartCol = {
  key: string;
  /** label di bawah kolom, mis. "Sen" atau "M1" */
  label: string;
  /** nama penuh untuk tooltip hari, mis. "Senin" */
  full?: string;
  /** dari atas ke bawah, seperti di Figma */
  tiles: ChartTile[];
};

