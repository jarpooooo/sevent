/**
 * Data katalog. SEMUA lot, harga, stok, MOQ, lokasi, dan ulasan di bawah ADALAH CONTOH DEMO untuk
 * mock up (bukan harga pasar, bukan stok asli). UI wajib menandainya. Foto adalah ilustrasi.
 *
 * Fokus pilot: cutting offcuts terpilah, lalu sisa gulungan dan perca. Satuan kg. MOQ default 5 kg.
 * Dua kanal jual:
 *  - "tetap"  : Harga tetap regional. Satu harga per kg untuk UMKM dalam radius 50 km dari pabrik.
 *  - "lelang" : Lelang terbalik. 72 jam, harga turun tiap 6 jam (11 langkah), batas bawah disembunyikan.
 * Angka MOQ di sini hanya contoh demo seperti di Figma.
 */
export type Category = "Cutting offcuts" | "Sisa gulungan" | "Perca";
export const CATEGORIES: Category[] = ["Cutting offcuts", "Sisa gulungan", "Perca"];

/** Tipe lot: menentukan bukti yang dinilai (foto bukti dinilai per tipe). */
export type LotType = "Homogen" | "Semi-campuran" | "Campuran penuh";
export const LOT_TYPES: LotType[] = ["Homogen", "Semi-campuran", "Campuran penuh"];

export type Unit = "kg";
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
  lotType: LotType;
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
  /**
   * Pengaturan lelang terbalik (model "lelang"). `floor` adalah batas bawah pabrik dan TIDAK boleh
   * ditampilkan ke UMKM. `elapsedH` = jam yang sudah berjalan saat halaman dibuka (demo).
   */
  auction?: { start: number; floor: number; elapsedH: number };
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
  tetap: "Harga tetap regional",
  lelang: "Lelang terbalik",
};

/** Peran pengguna dan status pesanan dipakai bersama oleh klien dan server. */
export type Role = "umkm" | "pabrik";
export type Pickup = "ambil" | "kirim";
/**
 * 0 Pesanan dibuat, 1 Pembayaran berhasil, 2 Barang dipersiapkan, 3 Dikirim atau siap diambil,
 * 4 Barang diterima, 5 Transaksi selesai (setelah masa komplain 48 jam).
 */
export type OrderStatus = 0 | 1 | 2 | 3 | 4 | 5;

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
  /** ringkasan produk saat dipesan, supaya halaman pesanan informatif tanpa membuka katalog */
  category?: Category;
  lotType?: LotType;
  origin?: string;
  province?: string;
  photo?: string;
  focus?: string;
  alt?: string;
  /** nama berkas bukti transfer yang diunggah (berkasnya sendiri tidak disimpan) */
  proofName?: string;
  paidAt?: string;
};
