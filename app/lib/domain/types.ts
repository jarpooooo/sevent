/**
 * Data katalog. SEMUA lot, harga, stok, MOQ, lokasi, dan ulasan di bawah ADALAH CONTOH DEMO untuk
 * mock up (bukan harga pasar, bukan stok asli). UI wajib menandainya. Foto adalah ilustrasi.
 *
 * Dua model beli:
 *  - "tetap"  : Fixed cost regional. Satu harga tetap per satuan untuk pembeli di provinsi pabrik.
 *  - "lelang" : Lelang nasional (Dutch auction). Harga turun bertahap selama TTL 15 menit.
 * Angka MOQ belum final di tim; di sini hanya contoh demo seperti di Figma.
 */
export type Category = "Baju" | "Celana" | "Kain";
export const CATEGORIES: Category[] = ["Baju", "Celana", "Kain"];

export type Unit = "kg" | "pcs";
export type BuyModel = "tetap" | "lelang";

export type Review = {
  initials: string;
  name: string;
  place: string;
  stars: number;
  date: string;
  qty: string;
  text: string;
};

export type Lot = {
  slug: string;
  /** kode lot yang tampil di foto dan panel beli */
  code: string;
  title: string;
  category: Category;
  unit: Unit;
  /** minimum beli (contoh demo) */
  moq: number;
  /** stok tersedia dan stok awal, dalam `unit` */
  stock: number;
  capacity: number;
  /** kota/kabupaten pabrik */
  origin: string;
  province: string;
  model: BuyModel;
  /** harga tetap per satuan (model "tetap") */
  price?: number;
  /** pengaturan lelang (model "lelang"); phaseS menggeser jam demo antar lot */
  auction?: { start: number; floor: number; phaseS: number };
  photo: string;
  /** object-position foto; foto yang sama dipotong berbeda untuk lot berbeda */
  focus: string;
  alt: string;
  spec: {
    jenis: string;
    komposisi: string;
    ukuran: string;
    warna: string;
    kondisi: string;
    kontaminasi: string;
  };
  notes: string;
  reviews?: { average: number; counts: [number, number, number, number, number]; items: Review[] };
};

export const BUY_MODEL_LABEL: Record<BuyModel, string> = {
  tetap: "Fixed cost Regional",
  lelang: "Lelang Nasional",
};

/** Peran pengguna dan status pesanan dipakai bersama oleh klien dan server. */
export type Role = "umkm" | "pabrik";
export type Pickup = "ambil" | "kirim";
/** 0 dibayar, 1 disiapkan, 2 dikirim/siap diambil, 3 selesai */
export type OrderStatus = 0 | 1 | 2 | 3;

export type Order = {
  id: string;
  slug: string;
  code: string;
  title: string;
  unit: Unit;
  qty: number;
  /** harga per satuan saat dibayar (untuk lelang: harga yang berlaku saat menekan bayar) */
  price: number;
  pickup: Pickup;
  address?: string;
  status: OrderStatus;
  createdAt: string;
  model: BuyModel;
};
