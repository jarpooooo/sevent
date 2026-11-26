import type { Lot } from "../domain/types";
import { LOTS } from "./seed/lots";

/**
 * Lapisan data lot. Halaman dan API hanya bicara lewat antarmuka ini, jadi pindah dari data lokal
 * ke Firestore cukup mengganti isi getLotsRepo() tanpa mengubah halaman atau komponen.
 */
export interface LotsRepo {
  list(): Promise<Lot[]>;
  bySlug(slug: string): Promise<Lot | undefined>;
}

export const localLotsRepo: LotsRepo = {
  async list() {
    return LOTS;
  },
  async bySlug(slug) {
    return LOTS.find((l) => l.slug === slug);
  },
};

/** Titik tukar backend: kembalikan repositori Firestore di sini setelah data dipindah. */
export function getLotsRepo(): LotsRepo {
  return localLotsRepo;
}
