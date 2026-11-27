"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { HOME_OF, takeLogoutFlag, useRole } from "./session";

/**
 * Pembatas akses untuk demo (bukan keamanan sungguhan).
 *  - "not-pabrik": halaman pembeli. Terbuka untuk tamu dan UMKM; pabrik dialihkan ke Lot saya.
 *  - "pabrik"    : halaman pabrik. UMKM dialihkan ke Katalog, tamu ke halaman masuk.
 *  - "admin"     : panel admin. UMKM dan pabrik dialihkan ke halaman kerjanya, tamu ke halaman masuk.
 *  - "login"     : halaman akun. Tamu dialihkan ke halaman masuk.
 */
export default function RoleGuard({
  mode,
  children,
}: {
  mode: "not-pabrik" | "pabrik" | "admin" | "login";
  children: React.ReactNode;
}) {
  const role = useRole();
  const router = useRouter();

  let to: string | null = null;
  if (mode === "not-pabrik" && role === "pabrik") to = HOME_OF.pabrik;
  if (mode === "not-pabrik" && role === "admin") to = HOME_OF.admin;
  if (mode === "pabrik" && role === "umkm") to = HOME_OF.umkm;
  if (mode === "pabrik" && role === "admin") to = HOME_OF.admin;
  if (mode === "admin" && (role === "umkm" || role === "pabrik")) to = HOME_OF[role];
  if ((mode === "pabrik" || mode === "admin" || mode === "login") && role === null) to = "/masuk";

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
