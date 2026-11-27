import { LOTS } from "../../../lib/data/seed/lots";
import type { Order } from "../../../lib/domain/types";

export type Row = { o: Order; sample: boolean };

const sampleOf = (slug: string, id: string, qty: number, pickup: Order["pickup"], status: Order["status"], at: string): Row => {
  const l = LOTS.find((x) => x.slug === slug)!;
  return {
    sample: true,
    o: {
      id, slug, code: l.code, title: l.title, unit: l.unit, qty, price: l.price ?? 0, pickup, status,
      createdAt: at, model: l.model, category: l.category, lotType: l.lotType, origin: l.origin,
      province: l.province, photo: l.photo, focus: l.focus, alt: l.alt,
      address: pickup === "kirim" ? "Jl. Contoh No. 12, Bantul" : undefined,
    },
  };
};

/** Contoh yang tampil hanya saat belum ada pesanan, supaya alur status terlihat. Tidak disimpan. */
export const SAMPLES: Row[] = [
  sampleOf("offcut-denim-polos", "KN-0192", 25, "kirim", 3, "2026-11-24T08:00:00.000Z"),
  sampleOf("sisa-potongan-kaos-polos-non-branded", "KN-0188", 24, "ambil", 2, "2026-11-22T09:30:00.000Z"),
  sampleOf("perca-satin-polos", "KN-0170", 10, "kirim", 5, "2026-11-12T10:00:00.000Z"),
];

export const when = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

export const tone = (s: Order["status"]) => (s === 0 ? "wait" : s === 5 ? "idle" : "ok");
