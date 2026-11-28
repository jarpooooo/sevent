"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { HOME_OF, takeLogoutFlag, useRole } from "./session";

/**
 * Pembatas akses untuk demo (bukan keamanan sungguhan).
 *  - "not-pabrik": halaman pembeli. Terbuka untuk tamu dan UMKM; pabrik, admin, dan EXIM dialihkan ke halaman kerjanya.
 *  - "pabrik"    : halaman pabrik. Peran lain dialihkan ke halaman kerjanya, tamu ke halaman masuk.
 *  - "admin"     : panel admin. Sama seperti di atas.
 *  - "login"     : halaman akun. Tamu dialihkan ke halaman masuk.
 */
type Mode = "not-pabrik" | "pabrik" | "admin" | "login";

export default function RoleGuard({ mode, children }: { mode: Mode; children: React.ReactNode }) {
  const role = useRole();
  const router = useRouter();

  let to: string | null = null;
  if (role === null) {
    if (mode !== "not-pabrik") to = "/masuk";
  } else if (role && mode !== "login") {
    const ok = mode === "not-pabrik" ? role === "umkm" : role === mode;
    if (!ok) to = HOME_OF[role];
  }

  useEffect(() => {
    if (!to) return;
    // Baru saja keluar dari halaman akun: pulang ke beranda, bukan ke halaman masuk
    router.replace(to === "/masuk" && takeLogoutFlag() ? "/" : to);
  }, [to, router]);

  // Halaman pembeli tampil langsung (isi dirender server); halaman login/pabrik menunggu peran diketahui
  const wait = mode === "not-pabrik" ? false : role === undefined;
  if (to || wait) return <div className="min-h-svh" aria-hidden="true" />;
  return <>{children}</>;
}
