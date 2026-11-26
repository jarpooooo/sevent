import { cacheLife } from "next/cache";
import type { Lot } from "../domain/types";
import { getLotsRepo } from "./lots-repo";

/**
 * Akses lot dari server dengan cache (Cache Components): hasil dipakai ulang antar permintaan,
 * jadi katalog dan detail tidak menyentuh sumber data tiap kali dibuka.
 */
export async function getLots(): Promise<Lot[]> {
  "use cache";
  cacheLife("hours");
  return getLotsRepo().list();
}

export async function getLot(slug: string): Promise<Lot | undefined> {
  "use cache";
  cacheLife("hours");
  return getLotsRepo().bySlug(slug);
}
