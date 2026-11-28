import type { Metadata } from "next";
import RoleGuard from "../../features/auth/RoleGuard";

/** Area pabrik: lot, pesanan masuk, tagihan komisi. UMKM dialihkan ke Katalog, tamu ke halaman masuk. */
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RoleGuard mode="pabrik">{children}</RoleGuard>;
}
