"use client";

import { useMemo, useSyncExternalStore } from "react";

/**
 * Sesi login. Mendukung dua jalur:
 *  - Login Google sungguhan (Firebase Auth + Firestore users/{uid}, provider: "google").
 *  - Akun demo lokal tanpa server (provider: "demo").
 * Navbar, profil, checkout, dan pembatas halaman mengikuti sesi ini.
 */
export type Role = "umkm" | "pabrik";
export type AuthProviderKind = "google" | "demo";

export type Account = {
  role: Role;
  provider: AuthProviderKind;
  uid?: string;
  name: string;
  initials: string;
  photoURL?: string;
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
    provider: "demo",
    name: "Sari Jahit",
    initials: "SJ",
    chip: "Sari Jahit, UMKM",
    kind: "UMKM penjahit",
    email: "sari@jahit.contoh",
    whatsapp: "+62 8xx-xxxx-xxxx",
    address: "Jl. Contoh No. 12, Bantul",
    province: "DI Yogyakarta",
  },
  pabrik: {
    role: "pabrik",
    provider: "demo",
    name: "Pabrik Contoh",
    initials: "PC",
    chip: "Pabrik Contoh, Pabrik",
    kind: "Pabrik",
    email: "kontak@pabrik.contoh",
    whatsapp: "+62 8xx-xxxx-xxxx",
    address: "Jl. Industri Contoh No. 3, Kota Yogyakarta",
    province: "DI Yogyakarta",
  },
};

const KEY = "cl-session-v1";

/** Sesi tersimpan. Akun demo hanya menyimpan peran; login Google menyimpan uid, nama, email, dan foto. */
export type SessionData = {
  role: Role;
  provider?: AuthProviderKind;
  uid?: string;
  name?: string;
  email?: string;
  photoURL?: string;
};

let raw: string | null | undefined;
let current: SessionData | null = null;
const subs = new Set<() => void>();

function parse(r: string | null): SessionData | null {
  if (!r) return null;
  if (r === "umkm" || r === "pabrik") return { role: r, provider: "demo" };
  try {
    const j = JSON.parse(r) as SessionData;
    return j.role === "umkm" || j.role === "pabrik" ? j : null;
  } catch {
    return null;
  }
}

export function readSession(): SessionData | null {
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
  return useSyncExternalStore(subscribe, readSession, () => undefined);
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

/** Akun yang ditampilkan: data contoh peran, ditimpa profil Google bila login lewat Firebase Auth. */
export function useAccount(): Account | null | undefined {
  const s = useSession();
  return useMemo(() => {
    if (s === undefined) return undefined;
    if (!s) return null;
    const base = ACCOUNTS[s.role];
    const provider: AuthProviderKind = s.provider ?? (s.email || s.uid ? "google" : "demo");
    if (!s.name) return { ...base, provider };
    return {
      ...base,
      provider,
      uid: s.uid,
      name: s.name,
      initials: initialsOf(s.name) || base.initials,
      photoURL: s.photoURL,
      chip: `${s.name}, ${s.role === "umkm" ? "UMKM" : "Pabrik"}`,
      email: s.email ?? base.email,
    };
  }, [s]);
}

export function login(
  role: Role,
  profile?: { uid?: string; name?: string; email?: string; photoURL?: string; provider?: AuthProviderKind },
) {
  const data: SessionData = {
    role,
    provider: profile?.provider ?? (profile?.name || profile?.uid ? "google" : "demo"),
    ...(profile?.uid ? { uid: profile.uid } : {}),
    ...(profile?.name ? { name: profile.name } : {}),
    ...(profile?.email ? { email: profile.email } : {}),
    ...(profile?.photoURL ? { photoURL: profile.photoURL } : {}),
  };
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
