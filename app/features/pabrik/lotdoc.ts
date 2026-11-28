"use client";

import { useSyncExternalStore } from "react";
import type { LotCustoms } from "../../lib/domain/types";

/**
 * Data kepabeanan per lot (demo, di localStorage browser). Diisi pabrik, dikonfirmasi EXIM.
 * Kuncinya slug lot. Tidak ada isian bawaan untuk HS Code, negara asal, atau nomor dokumen.
 */
export const EMPTY_CUSTOMS: LotCustoms = {
  hsCode: "",
  negaraAsal: "",
  asalBahan: "",
  kemasanJenis: "",
  kemasanJumlah: "",
  beratKotor: "",
  dokPemasukan: { jenis: "", nomor: "", tanggal: "" },
};

/**
 * Data kepabeanan contoh untuk lot demo, dipakai selama pabrik belum menyimpan datanya sendiri.
 * Rekaan untuk mencoba alur: HS Code, kemasan, dan dokumen ini bukan data nyata. Negara asal sengaja kosong:
 * diturunkan dari asal bahan (domestik jadi Indonesia).
 */
export const DEMO_CUSTOMS: Partial<LotCustoms> = {
  hsCode: "6310.10.00",
  asalBahan: "domestik",
  kemasanJenis: "karung",
  kemasanJumlah: "5",
  beratKotor: "26",
  dokPemasukan: { jenis: "Dokumen contoh", nomor: "CONTOH-IN-001", tanggal: "2026-10-15" },
};

/** Data lot: bawaan kosong, lalu contoh demo, lalu apa yang sudah disimpan pabrik. */
export const customsOf = (store: Record<string, LotCustoms>, slug: string): LotCustoms => ({ ...EMPTY_CUSTOMS, ...DEMO_CUSTOMS, ...store[slug] });

const KEY = "kn-lotdoc-v1";
type Store = Record<string, LotCustoms>;
const EMPTY_STORE: Store = {};
let raw: string | null | undefined;
let cur: Store = EMPTY_STORE;
const subs = new Set<() => void>();

function read(): Store {
  if (typeof window === "undefined") return EMPTY_STORE;
  const r = window.localStorage.getItem(KEY);
  if (r === raw) return cur;
  raw = r;
  try {
    cur = r ? (JSON.parse(r) as Store) : EMPTY_STORE;
  } catch {
    cur = EMPTY_STORE;
  }
  return cur;
}

function subscribe(cb: () => void) {
  subs.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    subs.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

export const readLotCustoms = (slug: string): LotCustoms => customsOf(read(), slug);

export function saveLotCustoms(slug: string, c: LotCustoms) {
  window.localStorage.setItem(KEY, JSON.stringify({ ...read(), [slug]: c }));
  subs.forEach((f) => f());
}

/** Semua data kepabeanan lot. Pakai `{...EMPTY_CUSTOMS, ...store[slug]}` untuk satu lot. */
export const useLotCustomsStore = () => useSyncExternalStore(subscribe, read, () => EMPTY_STORE);

/** true bila minimal HS Code, negara asal, dan asal bahan sudah diisi. */
/** Negara asal boleh kosong bila asal bahan domestik: dokumen menuliskannya sebagai Indonesia. */
export const customsComplete = (c: LotCustoms) => !!c.hsCode.trim() && !!c.asalBahan && (!!c.negaraAsal.trim() || c.asalBahan === "domestik");
