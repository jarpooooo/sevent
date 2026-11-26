"use client";

import { useEffect } from "react";
import { PENDING_ROLE_KEY } from "./google-auth-keys";
import { login, logout, readSession } from "./session";

/**
 * Menjaga sesi lokal tetap selaras dengan Firebase Auth (login Google).
 * Modul Firebase hanya dimuat bila pengguna sedang memakai sesi Google atau baru kembali dari redirect,
 * sehingga pengunjung biasa tidak menanggung beban JS Firebase saat membuka beranda.
 */
export default function AuthSync() {
  useEffect(() => {
    const existing = readSession();
    const hasPendingRedirect = !!window.sessionStorage.getItem(PENDING_ROLE_KEY);
    if (existing?.provider !== "google" && !hasPendingRedirect) return;

    let active = true;
    let unsub: (() => void) | undefined;

    (async () => {
      try {
        const mod = await import("./google-auth");
        if (!active) return;

        if (hasPendingRedirect) {
          const redirected = await mod.completeGoogleRedirect();
          if (active && redirected) {
            login(redirected.role, {
              uid: redirected.uid,
              name: redirected.name,
              email: redirected.email,
              photoURL: redirected.photoURL,
              provider: "google",
            });
          }
        }

        unsub = mod.subscribeGoogleAuth(
          existing?.role ?? "umkm",
          (profile) => {
            if (!active) return;
            login(profile.role, {
              uid: profile.uid,
              name: profile.name,
              email: profile.email,
              photoURL: profile.photoURL,
              provider: "google",
            });
          },
          () => {
            if (!active) return;
            // Hanya bersihkan sesi bila sebelumnya memang sesi Google; sesi akun demo tetap dibiarkan.
            if (readSession()?.provider === "google") logout();
          },
        );
      } catch {
        /* biarkan sesi lokal bekerja bila Firebase belum tersedia */
      }
    })();

    return () => {
      active = false;
      unsub?.();
    };
  }, []);

  return null;
}
