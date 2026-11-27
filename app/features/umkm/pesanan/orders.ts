"use client";

import { useSyncExternalStore } from "react";

/**
 * Pesanan demo, disimpan di localStorage browser (bukan server). Tidak ada uang yang bergerak.
 * UMKM membayar ke virtual account PJP. Di produksi, PJP mengabari server lewat webhook; di demo, tombol
 * simulasi meniru webhook itu. Dana ditahan PJP sampai barang diterima. Komisi 2% ditanggung pabrik. Enam status mengikuti keputusan produk.
 */
import type { Courier, Order, OrderStatus, Pickup } from "../../../lib/domain/types";

export type { Courier, Order, OrderStatus, Pickup };

export const COURIERS: { v: Courier; logo: string; w: number; h: number }[] = [
  { v: "JNE", logo: "/images/kurir/jne.png", w: 640, h: 257 },
  { v: "J&T", logo: "/images/kurir/jnt.svg", w: 1000, h: 209 },
];

export const MAX_STATUS: OrderStatus = 5;
/** Masa komplain setelah barang diterima. */
export const COMPLAINT_HOURS = 48;

export const ORDER_STEPS = (pickup: Pickup) => [
  { t: "Pesanan dibuat", d: "Bayar ke virtual account." },
  { t: "Pembayaran berhasil", d: "PJP mengabari bahwa pembayaran masuk." },
  { t: "Barang dipersiapkan", d: "Pabrik menyiapkan lot." },
  {
    t: pickup === "ambil" ? "Siap diambil" : "Dikirim",
    d: pickup === "ambil" ? "Ambil di lokasi pabrik." : "Lot menuju alamatmu.",
  },
  {
    t: "Barang diterima",
    d: pickup === "ambil" ? "Kamu konfirmasi, masa komplain 48 jam." : "Kurir konfirmasi, masa komplain 48 jam.",
  },
  { t: "Transaksi selesai", d: "Dana diteruskan ke pabrik, komisi dicatat." },
];

const KEY = "kn-orders-v2";
const EMPTY: Order[] = [];

let raw: string | null | undefined;
let list: Order[] = EMPTY;
const subs = new Set<() => void>();

function read(): Order[] {
  if (typeof window === "undefined") return EMPTY;
  const r = window.localStorage.getItem(KEY);
  if (r === raw) return list;
  raw = r;
  try {
    list = r ? (JSON.parse(r) as Order[]) : EMPTY;
  } catch {
    list = EMPTY;
  }
  return list;
}

function write(next: Order[]) {
  window.localStorage.setItem(KEY, JSON.stringify(next));
  subs.forEach((f) => f());
}

function subscribe(cb: () => void) {
  subs.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    subs.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

export const useOrders = () => useSyncExternalStore(subscribe, read, () => EMPTY);

export function addOrder(o: Omit<Order, "id" | "status" | "createdAt">): Order {
  const order: Order = {
    ...o,
    id: `KN-${Date.now().toString(36).toUpperCase().slice(-6)}`,
    va: `8077${Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join("")}`,
    status: 0,
    statusPengeluaran: "draf",
    createdAt: new Date().toISOString(),
  };
  write([order, ...read()]);
  return order;
}

/** Simulasi webhook PJP: pembayaran ke virtual account diterima, status naik ke Pembayaran berhasil. */
export function confirmPayment(id: string) {
  write(
    read().map((o) =>
      o.id === id && o.status === 0 ? { ...o, status: 1 as OrderStatus, paidAt: new Date().toISOString() } : o,
    ),
  );
}

/** Jumlah yang sudah dipesan (dicadangkan) untuk satu lot, dari semua pesanan di browser ini. */
export const reservedOf = (orders: Order[], slug: string) =>
  orders.filter((o) => o.slug === slug).reduce((n, o) => n + o.qty, 0);

/** Stok tersedia = stok lot dikurangi pesanan. Stok fisik di gudang baru berkurang saat barang keluar. */
export function useAvailable(slug: string, stock: number) {
  return Math.max(0, stock - reservedOf(useOrders(), slug));
}

export const useOrder = (id: string | null) => useOrders().find((o) => o.id === id);

/** Ubah sebagian isi pesanan (data dokumen, status pengeluaran). Tidak mengubah status 6 tahap. */
export function patchOrder(id: string, patch: Partial<Order>) {
  write(read().map((o) => (o.id === id ? { ...o, ...patch } : o)));
}

/** Yang mengonfirmasi barang diterima: UMKM bila ambil sendiri, kurir eksternal (JNE atau J&T) bila diantar. */
export const receiverOf = (pickup: Pickup): "umkm" | "kurir" => (pickup === "ambil" ? "umkm" : "kurir");

export function advanceOrder(id: string) {
  write(
    read().map((o) => {
      if (o.id !== id || o.status >= MAX_STATUS) return o;
      const next = (o.status + 1) as OrderStatus;
      // 3 -> 4 adalah konfirmasi penerimaan; catat siapa yang mengonfirmasi
      return next === 4 ? { ...o, status: next, receivedBy: receiverOf(o.pickup), receivedAt: new Date().toISOString() } : { ...o, status: next };
    }),
  );
}

export function clearOrders() {
  write([]);
}
