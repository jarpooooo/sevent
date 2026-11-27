"use client";

import { useSyncExternalStore } from "react";

/**
 * Lot milik pabrik (demo, di localStorage browser). Empat lot contoh mengikuti Figma "Lot saya";
 * lot dari halaman Tambah lot ditambahkan di atasnya dengan status "Menunggu pemeriksaan".
 */
export type PabrikLotStatus = "Tayang" | "Lelang berjalan" | "Menunggu pemeriksaan";

export type PabrikLot = {
  id: string;
  name: string;
  /** "Regional, tetap", "Lelang terbalik", atau keduanya */
  channel: string;
  price: string;
  stock: number;
  capacity: number;
  status: PabrikLotStatus;
  /** true bila ditambahkan lewat halaman Tambah lot */
  added?: boolean;
  code?: string;
};

export const SEED_LOTS: PabrikLot[] = [
  { id: "denim", name: "Offcut denim polos", channel: "Regional, tetap", price: "Rp4.000 / kg", stock: 800, capacity: 1000, status: "Tayang" },
  { id: "kaos", name: "Sisa potongan kaos polos non-branded", channel: "Regional, tetap", price: "Rp12.000 / kg", stock: 300, capacity: 300, status: "Tayang" },
  { id: "katun", name: "Perca katun polos", channel: "Lelang terbalik", price: "Dari Rp8.000 / kg", stock: 300, capacity: 300, status: "Lelang berjalan" },
  { id: "chino", name: "Sisa potongan chino non-branded", channel: "Regional, tetap", price: "Rp18.000 / kg", stock: 95, capacity: 120, status: "Menunggu pemeriksaan" },
];

const KEY = "kn-lot-pabrik-v1";
const EMPTY: PabrikLot[] = [];
let raw: string | null | undefined;
let added: PabrikLot[] = EMPTY;
const subs = new Set<() => void>();

function read(): PabrikLot[] {
  if (typeof window === "undefined") return EMPTY;
  const r = window.localStorage.getItem(KEY);
  if (r === raw) return added;
  raw = r;
  try {
    added = r ? (JSON.parse(r) as PabrikLot[]) : EMPTY;
  } catch {
    added = EMPTY;
  }
  return added;
}

function subscribe(cb: () => void) {
  subs.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    subs.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

/** Lot yang ditambahkan pengguna (tanpa lot contoh). */
export const useAddedLots = () => useSyncExternalStore(subscribe, read, () => EMPTY);

export function addLot(lot: Omit<PabrikLot, "id" | "added" | "status">): PabrikLot {
  const l: PabrikLot = { ...lot, id: `baru-${Date.now().toString(36)}`, status: "Menunggu pemeriksaan", added: true };
  window.localStorage.setItem(KEY, JSON.stringify([l, ...read()]));
  subs.forEach((f) => f());
  return l;
}

export function clearAddedLots() {
  window.localStorage.removeItem(KEY);
  subs.forEach((f) => f());
}
