"use client";

import { useMemo } from "react";
import { type Order, useOrders } from "../katalog/orders";

/**
 * Pesanan yang masuk ke pabrik (demo). Terdiri dari pesanan yang kamu buat sebagai UMKM di browser
 * ini (nyata untuk demo) dan dua baris contoh. Komisi 2% dihitung dari nilai barang, ditanggung pabrik.
 */
export type Incoming = {
  id: string;
  slug?: string;
  buyer: string;
  lot: string;
  unit: "kg" | "pcs";
  qty: number;
  total: number;
  pickup: "ambil" | "kirim";
  status: 0 | 1 | 2 | 3;
  /** true = berasal dari checkout di browser ini, status bisa dimajukan pabrik */
  live: boolean;
};

const SEED: Incoming[] = [
  {
    id: "CL-0192",
    buyer: "Sari Jahit · Bantul",
    lot: "Offcut denim polos",
    unit: "kg",
    qty: 25,
    total: 100000,
    pickup: "ambil",
    status: 2,
    live: false,
  },
  {
    id: "CL-0187",
    buyer: "Kriya B · Sleman",
    lot: "Offcut denim polos",
    unit: "kg",
    qty: 100,
    total: 1000000,
    pickup: "kirim",
    status: 3,
    live: false,
  },
];

export const commission = (total: number) => Math.round(total * 0.02);

const fromOrder = (o: Order): Incoming => ({
  id: o.id,
  slug: o.slug,
  buyer: "Sari Jahit · Bantul",
  lot: o.title,
  unit: o.unit,
  qty: o.qty,
  total: o.qty * o.price,
  pickup: o.pickup,
  status: o.status,
  live: true,
});

export function useIncoming(): Incoming[] {
  const orders = useOrders();
  return useMemo(() => [...orders.map(fromOrder), ...SEED], [orders]);
}

export const STATUS_LABEL = (s: Incoming["status"], pickup: Incoming["pickup"]) =>
  [
    "Perlu disiapkan",
    "Disiapkan",
    pickup === "ambil" ? "Siap diambil" : "Dalam pengiriman",
    "Selesai",
  ][s];
