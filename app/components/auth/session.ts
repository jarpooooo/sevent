"use client";

import { useSyncExternalStore } from "react";

/**
 * Sesi login DUMMY. Tidak ada server, password, atau token: peran yang dipilih disimpan di
 * localStorage browser, dan navbar serta akses halaman mengikuti peran itu.
 */
export type Role = "umkm" | "pabrik";

export type Account = {
  role: Role;
  name: string;
  initials: string;
  /** teks pada chip akun di navbar */
  chip: string;
  kind: string;
  email: string;
  whatsapp: string;
  address: string;
  province: string;
};

export const ACCOUNTS: Record<Role, Account> = {
  umkm: {
    role: "umkm",
    name: "Sari Jahit",
    initials: "SJ",
    chip: "Sari Jahit · UMKM",
    kind: "UMKM penjahit",
    email: "sari@jahit.contoh",
    whatsapp: "+62 8xx-xxxx-xxxx",
    address: "Jl. Contoh No. 12, Bantul",
    province: "DI Yogyakarta",
  },
  pabrik: {
    role: "pabrik",
    name: "Pabrik Contoh",
    initials: "PC",
    chip: "Pabrik Contoh · Pabrik",
    kind: "Pabrik",
    email: "kontak@pabrik.contoh",
    whatsapp: "+62 8xx-xxxx-xxxx",
    address: "Jl. Industri Contoh No. 3, Kota Yogyakarta",
    province: "DI Yogyakarta",
  },
};

const KEY = "cl-session-v1";

let raw: string | null | undefined;
let current: Role | null = null;
const subs = new Set<() => void>();

function read(): Role | null {
  if (typeof window === "undefined") return null;
  const r = window.localStorage.getItem(KEY);
  if (r === raw) return current;
  raw = r;
  current = r === "umkm" || r === "pabrik" ? r : null;
  return current;
}

function subscribe(cb: () => void) {
  subs.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    subs.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

/**
 * undefined = belum diketahui (server dan hidrasi), null = belum login, "umkm" | "pabrik" = login.
 * Server dan render pertama klien sama (undefined), jadi tidak ada beda HTML saat hidrasi.
 */
export function useRole(): Role | null | undefined {
  return useSyncExternalStore(subscribe, read, () => undefined);
}

export function login(role: Role) {
  window.localStorage.setItem(KEY, role);
  subs.forEach((f) => f());
}

let justLoggedOut = false;

export function logout() {
  justLoggedOut = true;
  setTimeout(() => (justLoggedOut = false), 1500);
  window.localStorage.removeItem(KEY);
  subs.forEach((f) => f());
}

/** Dibaca sekali oleh RoleGuard: setelah keluar, halaman akun mengarah ke beranda, bukan ke halaman masuk. */
export function takeLogoutFlag() {
  const v = justLoggedOut;
  justLoggedOut = false;
  return v;
}

/** Tujuan menu "halaman kerja" tiap peran. */
export const HOME_OF: Record<Role, string> = { umkm: "/katalog", pabrik: "/lot-saya" };
