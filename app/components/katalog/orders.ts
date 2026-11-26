"use client";

import { useSyncExternalStore } from "react";

/**
 * Pesanan demo, disimpan di localStorage browser (bukan server). Tidak ada uang yang bergerak.
 * Status mengikuti aturan produk: dana ditahan PJP dan baru diteruskan ke pabrik setelah pembeli
 * mengonfirmasi barang diterima.
 */
export type Pickup = "ambil" | "kirim";

export type Order = {
  id: string;
  slug: string;
  code: string;
  title: string;
  unit: "kg" | "pcs";
  qty: number;
  /** harga per satuan saat dibayar (untuk lelang: harga yang berlaku saat menekan bayar) */
  price: number;
  pickup: Pickup;
  address?: string;
  /** 0 dibayar, 1 disiapkan, 2 dikirim/siap diambil, 3 selesai */
  status: 0 | 1 | 2 | 3;
  createdAt: string;
  model: "tetap" | "lelang";
};

export const ORDER_STEPS = (pickup: Pickup) => [
  { t: "Dibayar", d: "Dana ditahan penyedia pembayaran (PJP)." },
  { t: "Disiapkan", d: "Pabrik menyiapkan lot." },
  { t: pickup === "ambil" ? "Siap diambil" : "Dalam pengiriman", d: pickup === "ambil" ? "Ambil di lokasi pabrik." : "Lot menuju alamatmu." },
  { t: "Selesai", d: "Kamu konfirmasi diterima, dana diteruskan ke pabrik." },
];

const KEY = "cl-orders-v1";
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
    id: `CL-${Date.now().toString(36).toUpperCase().slice(-6)}`,
    status: 0,
    createdAt: new Date().toISOString(),
  };
  write([order, ...read()]);
  return order;
}

export function advanceOrder(id: string) {
  write(read().map((o) => (o.id === id && o.status < 3 ? { ...o, status: (o.status + 1) as Order["status"] } : o)));
}

export function clearOrders() {
  write([]);
}
