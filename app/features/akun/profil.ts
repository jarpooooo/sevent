"use client";

import { useSyncExternalStore } from "react";
import type { Account, Role } from "../auth/session";

/** Kegiatan usaha pabrik menurut kelompok industri (Hulu: benang, Antara: kain, Hilir: garmen). */
export type SektorPabrik = "" | "hulu" | "antara" | "hilir";
export const SEKTOR_LABEL: Record<Exclude<SektorPabrik, "">, string> = {
  hulu: "Hulu, pemintalan benang",
  antara: "Antara, kain dan tekstil",
  hilir: "Hilir, garmen",
};

/**
 * Data profil yang diisi pengguna. Disimpan di browser (demo tanpa server); berkas hanya dicatat namanya.
 * Semua field baru opsional supaya profil lama tetap valid. Tidak ada isian bawaan untuk NPWP, nomor izin,
 * kantor pabean, atau rekening: kolom itu kosong sampai diisi, dan dokumen menandainya "menunggu".
 */
export type Profil = {
  person: string;
  business: string;
  phone: string;
  address: string;
  nib: string;
  docs: string[];
  /** ISO, terisi saat verifikasi dikirim */
  submittedAt?: string;
  /** ISO, terisi saat admin menyetujui */
  approvedAt?: string;
  /** catatan admin bila meminta revisi data */
  revisionNote?: string;
  /** kebutuhan material (UMKM): tahap 3 verifikasi */
  needs?: { fabric: string; minSize: string; monthlyKg: string; budget: string };

  /* ---- detail umum ---- */
  /** jabatan penanggung jawab: dipakai di kolom tanda tangan dokumen */
  jabatan?: string;
  /** email kontak dokumen; bawaan dari akun masuk */
  email?: string;
  /** NPWP 15 atau 16 digit. Wajib untuk pabrik (invoice), opsional untuk UMKM */
  npwp?: string;
  kota?: string;
  provinsi?: string;
  /** alamat kirim bila beda dari alamat usaha (UMKM) */
  alamatKirim?: string;

  /* ---- detail UMKM ---- */
  usaha?: {
    /** jenis usaha, mis. konveksi, penjahit rumahan, pengrajin perca */
    jenis: string;
    /** produk utama yang dibuat */
    produk: string;
    /** lama usaha, tahun */
    lamaTahun: string;
    /** jumlah pekerja */
    pekerja: string;
    /** akun usaha (Instagram, marketplace, atau situs) */
    akun: string;
  };

  /* ---- detail pabrik ---- */
  pabrik?: {
    sektor: SektorPabrik;
    /** jenis sisa produksi utama, mis. perca cutting denim */
    jenisSisa: string;
    /** nomor izin fasilitas Kawasan Berikat */
    nomorIzinKB: string;
    /** kantor pabean pengawas */
    kantorPabean: string;
    /** petugas lapangan yang menyerahkan barang */
    picNama: string;
    picTelepon: string;
    /** jam serah terima atau pengambilan barang */
    jamAmbil: string;
  };
  /** rekening pencairan dana ke pabrik (diisi pabrik, dipakai PJP saat settlement) */
  rekening?: { bank: string; nomor: string; atasNama: string };
};

const key = (r: Role) => `kn-profil-v1-${r}`;
const subs = new Set<() => void>();
const cache = new Map<string, { raw: string | null; val: Profil | null }>();

export function readProfil(role: Role): Profil | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(key(role));
  const c = cache.get(role);
  if (c && c.raw === raw) return c.val;
  let val: Profil | null = null;
  try {
    val = raw ? (JSON.parse(raw) as Profil) : null;
  } catch {
    val = null;
  }
  cache.set(role, { raw, val });
  return val;
}

export function saveProfil(role: Role, p: Profil) {
  window.localStorage.setItem(key(role), JSON.stringify(p));
  subs.forEach((f) => f());
}

function subscribe(cb: () => void) {
  subs.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    subs.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

/** undefined = belum hidrasi, null = belum pernah disimpan. */
export function useProfil(role: Role): Profil | null | undefined {
  return useSyncExternalStore(
    subscribe,
    () => readProfil(role),
    () => undefined,
  );
}

const digits = (v: string) => v.replace(/[\s.-]/g, "");
/** NIB berisi 13 digit. */
export const nibValid = (v: string) => /^\d{13}$/.test(digits(v));
/** NPWP berisi 15 atau 16 digit (titik dan strip diabaikan). */
export const npwpValid = (v: string) => /^\d{15,16}$/.test(digits(v));
export const phoneValid = (v: string) => /^(\+62|62|0)8\d{7,12}$/.test(v.replace(/[\s-]/g, ""));
export const emailValid = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
/** Nomor rekening: 6 sampai 20 digit. */
export const rekeningValid = (v: string) => /^\d{6,20}$/.test(digits(v));

/** Isian awal: profil tersimpan, atau data akun. NPWP, nomor izin, kantor pabean, dan rekening tidak pernah diisi bawaan. */
export function initialProfil(a: Account, saved: Profil | null): Profil {
  const demo = a.provider === "demo";
  const base: Profil = {
    person: a.name,
    business: a.business,
    phone: a.whatsapp,
    address: a.address,
    nib: a.nib ?? "",
    docs: [],
    jabatan: a.jabatan,
    email: a.email,
    kota: demo ? (a.address.split(",").pop()?.trim() ?? "") : "",
    provinsi: a.province,
  };
  return saved ? { ...base, ...saved } : base;
}
