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

export const readLotCustoms = (slug: string): LotCustoms => ({ ...EMPTY_CUSTOMS, ...read()[slug] });

export function saveLotCustoms(slug: string, c: LotCustoms) {
  window.localStorage.setItem(KEY, JSON.stringify({ ...read(), [slug]: c }));
  subs.forEach((f) => f());
}

/** Semua data kepabeanan lot. Pakai `{...EMPTY_CUSTOMS, ...store[slug]}` untuk satu lot. */
export const useLotCustomsStore = () => useSyncExternalStore(subscribe, read, () => EMPTY_STORE);

/** true bila minimal HS Code, negara asal, dan asal bahan sudah diisi. */
export const customsComplete = (c: LotCustoms) => !!c.hsCode.trim() && !!c.negaraAsal.trim() && !!c.asalBahan;
