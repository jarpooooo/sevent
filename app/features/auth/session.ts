"use client";

import { useMemo, useSyncExternalStore } from "react";

/**
 * Sesi login. Akun dummy: tanpa server, password, atau token; peran yang dipilih disimpan di
 * localStorage browser. Login Google (Firebase Auth, lihat app/lib/auth.ts) mengisi sesi yang sama
 * dengan nama dan email. Navbar dan akses halaman mengikuti peran di sesi ini.
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

/** Sesi tersimpan. Akun dummy hanya punya peran; login Firebase menambah nama dan email Google. */
export type SessionData = { role: Role; name?: string; email?: string };

let raw: string | null | undefined;
let current: SessionData | null = null;
const subs = new Set<() => void>();

function parse(r: string | null): SessionData | null {
  if (!r) return null;
  if (r === "umkm" || r === "pabrik") return { role: r }; // format lama
  try {
    const j = JSON.parse(r) as SessionData;
    return j.role === "umkm" || j.role === "pabrik" ? j : null;
  } catch {
    return null;
  }
}

function read(): SessionData | null {
  if (typeof window === "undefined") return null;
  const r = window.localStorage.getItem(KEY);
  if (r === raw) return current;
  raw = r;
  current = parse(r);
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

/** undefined = belum diketahui (server dan hidrasi), null = belum login. Snapshot stabil selama sesi tak berubah. */
export function useSession(): SessionData | null | undefined {
  return useSyncExternalStore(subscribe, read, () => undefined);
}

export function useRole(): Role | null | undefined {
  const s = useSession();
  return s === undefined ? undefined : (s?.role ?? null);
}

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

/** Akun yang ditampilkan: data contoh peran, ditimpa nama dan email Google bila login lewat Firebase. */
export function useAccount(): Account | null | undefined {
  const s = useSession();
  return useMemo(() => {
    if (s === undefined) return undefined;
    if (!s) return null;
    const base = ACCOUNTS[s.role];
    if (!s.name) return base;
    return {
      ...base,
      name: s.name,
      initials: initialsOf(s.name) || base.initials,
      chip: `${s.name} · ${s.role === "umkm" ? "UMKM" : "Pabrik"}`,
      email: s.email ?? base.email,
    };
  }, [s]);
}

export function login(role: Role, profile?: { name?: string; email?: string }) {
  const data: SessionData = { role, ...(profile?.name ? profile : {}) };
  window.localStorage.setItem(KEY, JSON.stringify(data));
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
