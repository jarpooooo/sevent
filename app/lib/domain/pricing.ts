import type { Lot, Pickup } from "./types";

/**
 * Aturan harga dan komisi: logika murni (tanpa React, tanpa I/O) yang dipakai klien dan server.
 * Server memakai ulang fungsi yang sama untuk memvalidasi pesanan, jadi angka di layar dan di
 * backend tidak bisa berbeda.
 */

/** Komisi platform 2% dari nilai barang, ditanggung pabrik (bukan UMKM). */
export const COMMISSION_RATE = 0.02;
export const commission = (total: number) => Math.round(total * COMMISSION_RATE);
export const factoryNet = (total: number) => total - commission(total);

/**
 * Lelang terbalik: 72 jam, harga turun tiap 6 jam dalam 11 langkah (harga awal sampai batas bawah pabrik).
 * Tidak ada satu pemenang: harga terus turun selama stok masih ada. Reservasi stok dan harga 20 menit.
 */
export const AUCTION_TOTAL_S = 72 * 3600;
export const AUCTION_STEP_S = 6 * 3600;
export const AUCTION_STEPS = 11;
export const RESERVATION_TTL_S = 20 * 60;

export type AuctionState = {
  /** harga per kg pada langkah sekarang */
  price: number;
  /** langkah sekarang, 0 sampai AUCTION_STEPS - 1 */
  step: number;
  /** harga tiap langkah dari awal; hanya langkah <= step yang boleh ditampilkan ke UMKM */
  ladder: number[];
  /** detik tersisa dari 72 jam */
  remaining: number;
  /** detik yang sudah berjalan */
  elapsed: number;
  /** 0..1, porsi 72 jam yang sudah lewat */
  progress: number;
  /** true bila 72 jam habis: lot kembali ke pabrik */
  closed: boolean;
};

/**
 * Keadaan lelang `sinceLoadS` detik setelah halaman dibuka (jam demo dimulai dari auction.elapsedH).
 * Null bila lot bukan lelang. Batas bawah hanya dipakai menghitung tangga harga, tidak dikembalikan.
 */
export function auctionAt(lot: Lot, sinceLoadS: number): AuctionState | null {
  if (lot.model !== "lelang" || !lot.auction) return null;
  const { start, floor, elapsedH } = lot.auction;
  const elapsed = Math.min(AUCTION_TOTAL_S, elapsedH * 3600 + Math.max(0, sinceLoadS));
  const step = Math.min(AUCTION_STEPS - 1, Math.floor(elapsed / AUCTION_STEP_S));
  const ladder = Array.from({ length: AUCTION_STEPS }, (_, i) =>
    Math.round((start - ((start - floor) * i) / (AUCTION_STEPS - 1)) / 100) * 100,
  );
  return {
    price: ladder[step]!,
    step,
    ladder,
    remaining: AUCTION_TOTAL_S - elapsed,
    elapsed,
    progress: elapsed / AUCTION_TOTAL_S,
    closed: elapsed >= AUCTION_TOTAL_S,
  };
}

/** Harga satuan yang berlaku `sinceLoadS` detik setelah halaman dibuka (harga tetap, atau harga lelang). */
export const unitPriceAt = (lot: Lot, sinceLoadS: number) => auctionAt(lot, sinceLoadS)?.price ?? lot.price ?? 0;

/** Langkah ubah jumlah: 5 kg, atau 1 kg untuk lot ber-MOQ kecil. */
export const stepOf = (lot: Lot) => (lot.moq < 5 ? 1 : 5);

/** Jumlah awal: 25 kg atau MOQ bila lebih besar, dibatasi stok. */
export function defaultQty(lot: Lot) {
  return Math.min(Math.max(lot.moq, 25), lot.stock);
}

export type Quote =
  | {
      ok: true;
      qty: number;
      unitPrice: number;
      subtotal: number;
      commission: number;
      factoryNet: number;
      /** ambil sendiri Rp0; diantar: ongkir dihitung setelah alamat dikonfirmasi */
      shipping: "Rp0" | "dihitung-kemudian";
    }
  | { ok: false; errors: string[] };

/** Menghitung dan memvalidasi pesanan: jumlah utuh, minimal MOQ (dibatasi stok), tidak melebihi stok. */
export function quote(lot: Lot, qty: number, pickup: Pickup, sinceLoadS = 0): Quote {
  const errors: string[] = [];
  const min = Math.min(lot.moq, lot.stock);
  if (!Number.isInteger(qty)) errors.push("Jumlah harus bilangan bulat.");
  else {
    if (qty < min) errors.push(`Jumlah minimal ${min} ${lot.unit}.`);
    if (qty > lot.stock) errors.push(`Stok hanya ${lot.stock} ${lot.unit}.`);
  }
  if (errors.length) return { ok: false, errors };
  const unitPrice = unitPriceAt(lot, sinceLoadS);
  const subtotal = qty * unitPrice;
  return {
    ok: true,
    qty,
    unitPrice,
    subtotal,
    commission: commission(subtotal),
    factoryNet: factoryNet(subtotal),
    shipping: pickup === "ambil" ? "Rp0" : "dihitung-kemudian",
  };
}
