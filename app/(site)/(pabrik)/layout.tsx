import RoleGuard from "../../features/auth/RoleGuard";

/** Area pabrik: lot, pesanan masuk, tagihan komisi. UMKM dialihkan ke Katalog, tamu ke halaman masuk. */
export default function Layout({ children }: { children: React.ReactNode }) {
  return <RoleGuard mode="pabrik">{children}</RoleGuard>;
}
