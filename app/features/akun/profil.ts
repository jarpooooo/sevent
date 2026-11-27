"use client";

import { useSyncExternalStore } from "react";
import type { Role } from "../auth/session";

/** Data profil yang diisi pengguna. Disimpan di browser (demo tanpa server); berkas hanya dicatat namanya. */
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

/** NIB berisi 13 digit. */
export const nibValid = (v: string) => /^\d{13}$/.test(v.replace(/[\s.-]/g, ""));
export const phoneValid = (v: string) => /^(\+62|62|0)8\d{7,12}$/.test(v.replace(/[\s-]/g, ""));
