"use client";

import { useMemo } from "react";
import { commission } from "../../lib/domain/pricing";
import type { PengeluaranStatus } from "../../lib/domain/types";
import { type Order, useOrders } from "../umkm/pesanan/orders";

export { commission };

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
  status: Order["status"];
  /** true = berasal dari checkout di browser ini, status bisa dimajukan pabrik */
  live: boolean;
  /** status pengeluaran barang (Compliance Lock); hanya untuk pesanan live */
  lock?: PengeluaranStatus;
};

const SEED: Incoming[] = [
  {
    id: "KN-0192",
    buyer: "Sari Jahit, Bantul",
    lot: "Offcut denim polos",
    unit: "kg",
    qty: 25,
    total: 100000,
    pickup: "ambil",
    status: 3,
    live: false,
  },
  {
    id: "KN-0187",
    buyer: "Kriya B, Sleman",
    lot: "Offcut denim polos",
    unit: "kg",
    qty: 100,
    total: 1000000,
    pickup: "kirim",
    status: 5,
    live: false,
  },
];

const fromOrder = (o: Order): Incoming => ({
  id: o.id,
  slug: o.slug,
  buyer: o.buyer ? (o.buyer.business || o.buyer.person) : "Sari Jahit, Bantul",
  lot: o.title,
  unit: o.unit,
  qty: o.qty,
  total: o.qty * o.price,
  pickup: o.pickup,
  status: o.status,
  live: true,
  lock: o.statusPengeluaran ?? "draf",
});

export function useIncoming(): Incoming[] {
  const orders = useOrders();
  return useMemo(() => [...orders.map(fromOrder), ...SEED], [orders]);
}

export const STATUS_LABEL = (s: Incoming["status"], pickup: Incoming["pickup"]) =>
  [
    "Pesanan dibuat",
    "Pembayaran berhasil",
    "Barang dipersiapkan",
    pickup === "ambil" ? "Siap diambil" : "Dikirim",
    "Barang diterima",
    "Transaksi selesai",
  ][s];
