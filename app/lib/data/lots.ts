import type { Lot } from "../domain/types";
import { getLotsRepo } from "./lots-repo";

/**
 * Akses lot saat build statis (output: "export"): data dibaca sekali ketika halaman
 * katalog, detail, dan checkout di-prerender.
 */
export async function getLots(): Promise<Lot[]> {
  return getLotsRepo().list();
}

export async function getLot(slug: string): Promise<Lot | undefined> {
  return getLotsRepo().bySlug(slug);
}
