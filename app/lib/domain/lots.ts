import type { BuyModel, Category, Lot, Unit } from "./types";

export type LotFilter = {
  model?: BuyModel | "semua";
  category?: Category | "semua";
  unit?: Unit | "semua";
  q?: string;
};

/** Penyaringan lot: dipakai klien (filter instan di layar) dan server (API /api/lots). */
export function filterLots(lots: Lot[], f: LotFilter): Lot[] {
  const q = f.q?.trim().toLowerCase();
  return lots.filter(
    (l) =>
      (!f.model || f.model === "semua" || l.model === f.model) &&
      (!f.category || f.category === "semua" || l.category === f.category) &&
      (!f.unit || f.unit === "semua" || l.unit === f.unit) &&
      (!q || `${l.title} ${l.category} ${l.origin} ${l.province} ${l.code}`.toLowerCase().includes(q)),
  );
}

/** Lot lain: model yang sama lebih dulu, lalu kategori yang sama. */
export function relatedLots(all: Lot[], lot: Lot, count = 4): Lot[] {
  const score = (l: Lot) => (l.model === lot.model ? 2 : 0) + (l.category === lot.category ? 1 : 0);
  return all
    .filter((l) => l.slug !== lot.slug)
    .map((l, i) => ({ l, i, s: score(l) }))
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .slice(0, count)
    .map((x) => x.l);
}
