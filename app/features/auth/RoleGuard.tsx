"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { HOME_OF, takeLogoutFlag, useRole } from "./session";

/**
 * Pembatas akses untuk demo (bukan keamanan sungguhan).
 *  - "not-pabrik": halaman pembeli. Terbuka untuk tamu dan UMKM; pabrik dialihkan ke Lot saya.
 *  - "pabrik"    : halaman pabrik. UMKM dialihkan ke Katalog, tamu ke halaman masuk.
 *  - "login"     : halaman akun. Tamu dialihkan ke halaman masuk.
 */
export default function RoleGuard({
  mode,
  children,
}: {
  mode: "not-pabrik" | "pabrik" | "login";
  children: React.ReactNode;
}) {
  const role = useRole();
  const router = useRouter();

  let to: string | null = null;
  if (mode === "not-pabrik" && role === "pabrik") to = HOME_OF.pabrik;
  if (mode === "pabrik" && role === "umkm") to = HOME_OF.umkm;
  if ((mode === "pabrik" || mode === "login") && role === null) to = "/masuk";

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
