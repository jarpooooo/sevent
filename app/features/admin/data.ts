"use client";

import { useMemo } from "react";
import type { Order } from "../../lib/domain/types";
import { initialProfil, type Profil, useProfil } from "../akun/profil";
import { ACCOUNTS } from "../auth/session";
import { SAMPLES } from "../umkm/pesanan/samples";
import { useOrders } from "../umkm/pesanan/orders";

export type Kind = "umkm" | "pabrik";
/** Status verifikasi akun, dari yang sudah selesai sampai belum dikirim. */
export type VStatus = "ok" | "menunggu" | "revisi" | "belum";

export type Akun = {
  id: string;
  kind: Kind;
  /** true = baris contoh demo (tidak bisa diubah). Akun demo milik browser ini tidak ditandai. */
  sample: boolean;
  joined: string;
  p: Profil;
};

export const V_LABEL: Record<VStatus, string> = { ok: "Terverifikasi", menunggu: "Menunggu cek admin", revisi: "Perlu revisi", belum: "Belum dikirim" };
export const V_TONE: Record<VStatus, "ok" | "wait" | "idle"> = { ok: "ok", menunggu: "wait", revisi: "wait", belum: "idle" };

export const vstatus = (p: Profil): VStatus => (p.approvedAt ? "ok" : p.submittedAt ? "menunggu" : p.revisionNote ? "revisi" : "belum");

const at = (d: string) => `${d}T08:00:00.000Z`;
const base = (o: Partial<Profil> & Pick<Profil, "business" | "person" | "kota">): Profil => ({
  phone: "0812 xxxx xxxx",
  address: `${o.kota}, DI Yogyakarta`,
  nib: "",
  docs: [],
  provinsi: "DI Yogyakarta",
  email: "contoh@demo.id",
  ...o,
});
const ok = (d: string) => ({ submittedAt: at(d), approvedAt: at(d) });

/** Baris contoh demo supaya tabel, cari, dan filter terlihat berguna. Bukan data asli. */
const SAMPLE_UMKM: Akun[] = [
  { id: "u-kriya-b", kind: "umkm", sample: true, joined: at("2026-11-02"), p: base({ business: "Kriya B", person: "Dewi Lestari", kota: "Sleman", needs: { fabric: "denim", minSize: "20 cm", monthlyKg: "60", budget: "" }, docs: ["foto-produksi.jpg"], ...ok("2026-11-03") }) },
  { id: "u-tas-jogja", kind: "umkm", sample: true, joined: at("2026-11-08"), p: base({ business: "Tas Jogja Kreasi", person: "Rizki Pratama", kota: "Kota Yogyakarta", nib: "1234567890124", needs: { fabric: "kanvas, katun", minSize: "", monthlyKg: "35", budget: "700000" }, ...ok("2026-11-09") }) },
  { id: "u-konveksi-mandiri", kind: "umkm", sample: true, joined: at("2026-11-15"), p: base({ business: "Konveksi Mandiri", person: "Agus Salim", kota: "Bantul", needs: { fabric: "katun polos", minSize: "", monthlyKg: "120", budget: "" }, docs: ["katalog.pdf", "foto-mesin.jpg"], submittedAt: at("2026-11-26") }) },
  { id: "u-rumah-perca", kind: "umkm", sample: true, joined: at("2026-11-18"), p: base({ business: "Rumah Perca", person: "Siti Aminah", kota: "Kulon Progo", needs: { fabric: "perca campur", minSize: "", monthlyKg: "15", budget: "" }, docs: ["akun-instagram.png"], revisionNote: "Tambahkan foto tempat produksi." }) },
  { id: "u-batik-gk", kind: "umkm", sample: true, joined: at("2026-11-22"), p: base({ business: "Batik Gunungkidul", person: "Maria Ulfa", kota: "Gunungkidul", needs: { fabric: "katun primisima", minSize: "", monthlyKg: "40", budget: "" }, docs: ["nib.pdf"], submittedAt: at("2026-11-27") }) },
];

const KOSONG_PABRIK = { sektor: "" as const, jenisSisa: "", nomorIzinKB: "", kantorPabean: "", picNama: "", picTelepon: "", jamAmbil: "" };
const SAMPLE_PABRIK: Akun[] = [
  { id: "f-garmen-kota", kind: "pabrik", sample: true, joined: at("2026-10-28"), p: base({ business: "PT Garmen Kota Contoh", person: "Hendra Wijaya", kota: "Kota Yogyakarta", jabatan: "Manajer produksi", pabrik: { ...KOSONG_PABRIK, sektor: "hilir", jenisSisa: "perca cutting denim", nomorIzinKB: "CONTOH-KB-02", kantorPabean: "KPPBC contoh", picNama: "Joko", picTelepon: "0813 xxxx xxxx", jamAmbil: "Senin sampai Jumat, 08.00 sampai 15.00" }, ...ok("2026-10-30") }) },
  { id: "f-kain-sleman", kind: "pabrik", sample: true, joined: at("2026-11-10"), p: base({ business: "CV Kain Sleman Contoh", person: "Lina Marlina", kota: "Sleman", jabatan: "Direktur", pabrik: { ...KOSONG_PABRIK, sektor: "antara", jenisSisa: "sisa gulungan katun", nomorIzinKB: "CONTOH-KB-03", kantorPabean: "KPPBC contoh" }, submittedAt: at("2026-11-25") }) },
  { id: "f-perca-bantul", kind: "pabrik", sample: true, joined: at("2026-11-20"), p: base({ business: "Pabrik Perca Bantul Contoh", person: "Yoga Saputra", kota: "Bantul", jabatan: "Kepala gudang", pabrik: { ...KOSONG_PABRIK, sektor: "hilir" }, revisionNote: "Lengkapi nomor izin Kawasan Berikat." }) },
];

/** Akun demo milik browser ini (profil tersimpan, atau data bawaan akun demo bila belum disimpan). */
function real(kind: Kind, saved: Profil | null | undefined): Akun | null {
  if (saved === undefined) return null;
  return { id: `${kind}-demo`, kind, sample: false, joined: saved?.submittedAt ?? at("2026-11-01"), p: initialProfil(ACCOUNTS[kind], saved) };
}

export function useAkun(kind: Kind): Akun[] {
  const saved = useProfil(kind);
  return useMemo(() => {
    const r = real(kind, saved);
    return [...(r ? [r] : []), ...(kind === "umkm" ? SAMPLE_UMKM : SAMPLE_PABRIK)];
  }, [kind, saved]);
}

export const useAkunById = (kind: Kind, id: string | null) => useAkun(kind).find((a) => a.id === id);

export type Pesanan = { o: Order; sample: boolean };

export function usePesanan(): Pesanan[] {
  const orders = useOrders();
  return useMemo(() => [...orders.map((o) => ({ o, sample: false })), ...SAMPLES.map((r) => ({ o: r.o, sample: true }))], [orders]);
}

export const kotaOf = (p: Profil) => p.kota || p.address.split(",").pop()?.trim() || "-";
export const tgl = (iso: string) => new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
