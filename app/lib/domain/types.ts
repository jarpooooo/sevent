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
  /** pabrik pemilik lot (demo: satu pabrik, id "pabrik"); dipakai agar dokumen memakai profil pabrik yang benar */
  ownerId?: string;
  reviews?: { average: number; counts: [number, number, number, number, number]; items: Review[] };
};

export const BUY_MODEL_LABEL: Record<BuyModel, string> = {
  tetap: "Harga tetap regional",
  lelang: "Lelang terbalik",
};

/** Dokumen pemasukan atau pengeluaran: jenis, nomor, tanggal. Diisi hanya bila ada; tidak ada isian bawaan. */
export type DokRef = { jenis: string; nomor: string; tanggal: string };

/**
 * Data kepabeanan per lot. Diisi pabrik, dikonfirmasi EXIM. Kosong berarti belum diisi dan dokumen
 * menandainya "menunggu"; HS Code, negara asal, dan nomor dokumen tidak pernah diisi otomatis.
 */
export type LotCustoms = {
  hsCode: string;
  negaraAsal: string;
  asalBahan: "" | "impor" | "domestik";
  kemasanJenis: string;
  kemasanJumlah: string;
  /** berat kotor dalam satuan lot, angka */
  beratKotor: string;
  dokPemasukan: DokRef;
};

/** Status pengeluaran barang (Compliance Lock). Hanya EXIM yang boleh menetapkan "terpenuhi". */
export type PengeluaranStatus = "draf" | "verifikasi" | "dokumen" | "ditahan" | "terpenuhi";
export const PENGELUARAN_LABEL: Record<PengeluaranStatus, string> = {
  draf: "Draf",
  verifikasi: "Menunggu verifikasi EXIM",
  dokumen: "Menunggu dokumen",
  ditahan: "Ditahan",
  terpenuhi: "Persyaratan terpenuhi",
};

/** Komponen kewajiban fiskal pada lembar rekonsiliasi. */
export type FiskalKey = "pabean" | "bm" | "ppnImpor" | "pph22" | "ppnbm" | "cukai" | "ppnDom";
export const FISKAL_LABEL: Record<FiskalKey, string> = {
  pabean: "Nilai pabean / dasar nilai",
  bm: "Bea Masuk (BM)",
  ppnImpor: "PPN impor",
  pph22: "PPh Pasal 22 impor",
  ppnbm: "PPnBM impor",
  cukai: "Cukai / pungutan lain",
  ppnDom: "PPN penyerahan domestik",
};
/** "belum" = belum diverifikasi. Itu BUKAN nihil: nominalnya tidak boleh dianggap Rp0. */
export type FiskalStatus = "belum" | "berlaku" | "dikecualikan" | "tidakBerlaku";
export type FiskalRow = { status: FiskalStatus; dasar: string; tarif: string; nominal: string };

/** Peran pengguna dan status pesanan dipakai bersama oleh klien dan server. */
export type Role = "umkm" | "pabrik" | "admin" | "exim";
export type Courier = "JNE" | "J&T";
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
  /** data penerima saat checkout (NIB tidak tampil di checkout, tapi ikut tersimpan untuk invoice bila ada) */
  buyer?: {
    person: string;
    business: string;
    phone: string;
    email?: string;
    npwp?: string;
    nib?: string;
    /** alamat usaha (alamat kirim ada di `address`) */
    alamatUsaha?: string;
  };
  /** pabrik penjual */
  sellerId?: string;
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
  /** nomor virtual account contoh dari PJP (simulasi, tidak ada uang bergerak) */
  va?: string;
  paidAt?: string;
  /** kurir eksternal pilihan UMKM saat checkout (hanya bila diantar) */
  courier?: Courier;
  /** siapa yang mengonfirmasi barang diterima: UMKM (ambil sendiri) atau kurir eksternal (diantar) */
  receivedBy?: "umkm" | "kurir";
  receivedAt?: string;

  /* ---- data dokumen: diisi pabrik, EXIM, atau admin sesuai tahap ---- */
  /** nomor resi (diantar) atau kode pickup (ambil sendiri), diisi pabrik saat status 3 */
  resi?: string;
  /** tanggal stock opname dan stok fisik hasil pemeriksaan, diisi pabrik saat status 2 */
  tglOpname?: string;
  stokFisik?: string;
  refItInventory?: string;
  /** Compliance Lock */
  statusPengeluaran?: PengeluaranStatus;
  /** hasil klasifikasi EXIM, mis. perca pemotongan, sisa bahan baku, produk reject */
  kategoriMaterial?: string;
  dokPengeluaran?: DokRef;
  persetujuanPengeluaran?: string;
  refLaporanFiskal?: string;
  refFakturPajak?: string;
  kodeBilling?: string;
  ntpn?: string;
  dasarFasilitas?: string;
  fiskal?: Partial<Record<FiskalKey, FiskalRow>>;
  catatanExim?: string;
};
