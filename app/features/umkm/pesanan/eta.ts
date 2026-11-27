import type { Pickup } from "../../../lib/domain/types";

/**
 * Estimasi kedatangan. Angka hari adalah asumsi contoh demo (bukan data pabrik atau kurir):
 * pabrik menyiapkan 1 sampai 2 hari kerja, kurir 1 sampai 3 hari (pilot Bantul, Sleman, Kota Yogyakarta).
 */
export const PREP_DAYS = [1, 2] as const;
export const SHIP_DAYS = [1, 3] as const;

const fmt = (d: Date) => d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });

function addBusiness(from: Date, n: number) {
  const x = new Date(from);
  while (n > 0) {
    x.setDate(x.getDate() + 1);
    const w = x.getDay();
    if (w !== 0 && w !== 6) n--;
  }
  return x;
}

const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

/** Rentang tanggal dihitung dari saat pembayaran dikonfirmasi pabrik. */
export function etaOf(from: Date, pickup: Pickup): { label: string; range: string; note: string } {
  const readyA = addBusiness(from, PREP_DAYS[0]);
  const readyB = addBusiness(from, PREP_DAYS[1]);
  if (pickup === "ambil") {
    return {
      label: "Siap diambil",
      range: `${fmt(readyA)} sampai ${fmt(readyB)}`,
      note: "Pabrik menyiapkan barang 1 sampai 2 hari kerja setelah pembayaran dikonfirmasi. Jadwal ambil disepakati dengan pabrik.",
    };
  }
  return {
    label: "Perkiraan tiba",
    range: `${fmt(addDays(readyA, SHIP_DAYS[0]))} sampai ${fmt(addDays(readyB, SHIP_DAYS[1]))}`,
    note: "Pabrik menyiapkan barang 1 sampai 2 hari kerja, lalu kurir 1 sampai 3 hari. Waktu dihitung sejak pembayaran dikonfirmasi pabrik.",
  };
}
