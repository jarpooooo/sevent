"use client";

import { useSyncExternalStore } from "react";

/**
 * Pesanan demo, disimpan di localStorage browser (bukan server). Tidak ada uang yang bergerak.
 * UMKM transfer langsung ke pabrik dan mengunggah bukti. Kami hanya mencatat komisi 2% yang
 * ditanggung pabrik. Enam status mengikuti keputusan produk.
 */
import type { Order, OrderStatus, Pickup } from "../../../lib/domain/types";

export type { Order, OrderStatus, Pickup };

export const MAX_STATUS: OrderStatus = 5;
/** Masa komplain setelah barang diterima. */
export const COMPLAINT_HOURS = 48;

export const ORDER_STEPS = (pickup: Pickup) => [
  { t: "Pesanan dibuat", d: "Transfer ke pabrik dan unggah bukti." },
  { t: "Pembayaran berhasil", d: "Pabrik memeriksa bukti transfer." },
  { t: "Barang dipersiapkan", d: "Pabrik menyiapkan lot." },
  {
    t: pickup === "ambil" ? "Siap diambil" : "Dikirim",
    d: pickup === "ambil" ? "Ambil di lokasi pabrik." : "Lot menuju alamatmu.",
  },
  { t: "Barang diterima", d: "Kamu konfirmasi, masa komplain 48 jam." },
  { t: "Transaksi selesai", d: "Komisi dicatat, pesanan ditutup." },
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
    id: `CL-${Date.now().toString(36).toUpperCase().slice(-6)}`,
    status: 0,
    createdAt: new Date().toISOString(),
  };
  write([order, ...read()]);
  return order;
}

/** UMKM mengunggah bukti transfer: status naik ke Pembayaran berhasil, pabrik memeriksa bukti. */
export function submitProof(id: string, proofName: string) {
  write(
    read().map((o) =>
      o.id === id && o.status === 0 ? { ...o, status: 1 as OrderStatus, proofName, paidAt: new Date().toISOString() } : o,
    ),
  );
}

export const useOrder = (id: string | null) => useOrders().find((o) => o.id === id);

export function advanceOrder(id: string) {
  write(read().map((o) => (o.id === id && o.status < MAX_STATUS ? { ...o, status: (o.status + 1) as OrderStatus } : o)));
}

export function clearOrders() {
  write([]);
}
