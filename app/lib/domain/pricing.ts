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

/** Lelang Belanda Nasional: TTL 15 menit. Harga turun bertahap tiap AUCTION_STEP_S detik (nilai demo). */
export const AUCTION_TTL_S = 15 * 60;
export const AUCTION_STEP_S = 15;

export type AuctionState = {
  price: number;
  /** detik tersisa */
  remaining: number;
  /** 0..1, porsi waktu yang sudah lewat */
  progress: number;
};

/** Keadaan lelang pada detik `nowS`; null bila lot bukan lelang. phaseS menggeser jam demo antar lot. */
export function auctionAt(lot: Lot, nowS: number): AuctionState | null {
  if (lot.model !== "lelang" || !lot.auction) return null;
  const { start, floor, phaseS } = lot.auction;
  const elapsed = (nowS + phaseS) % AUCTION_TTL_S;
  const steps = AUCTION_TTL_S / AUCTION_STEP_S;
  const step = Math.floor(elapsed / AUCTION_STEP_S);
  const raw = start - ((start - floor) * step) / steps;
  return { price: Math.round(raw / 10) * 10, remaining: AUCTION_TTL_S - elapsed, progress: elapsed / AUCTION_TTL_S };
}

/** Harga satuan yang berlaku pada detik `nowS` (harga tetap, atau harga lelang saat itu). */
export const unitPriceAt = (lot: Lot, nowS: number) => auctionAt(lot, nowS)?.price ?? lot.price ?? 0;

/** Langkah ubah jumlah: kg per 5, pcs per 1. */
export const stepOf = (lot: Lot) => (lot.unit === "kg" ? 5 : 1);

/** Jumlah awal: 25 kg atau MOQ bila lebih besar, dibatasi stok. Untuk pcs, MOQ. */
export function defaultQty(lot: Lot) {
  const base = lot.unit === "kg" ? Math.max(lot.moq, 25) : lot.moq;
  return Math.min(base, lot.stock);
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
export function quote(lot: Lot, qty: number, pickup: Pickup, nowS = Math.floor(Date.now() / 1000)): Quote {
  const errors: string[] = [];
  const min = Math.min(lot.moq, lot.stock);
  if (!Number.isInteger(qty)) errors.push("Jumlah harus bilangan bulat.");
  else {
    if (qty < min) errors.push(`Jumlah minimal ${min} ${lot.unit}.`);
    if (qty > lot.stock) errors.push(`Stok hanya ${lot.stock} ${lot.unit}.`);
  }
  if (errors.length) return { ok: false, errors };
  const unitPrice = unitPriceAt(lot, nowS);
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
