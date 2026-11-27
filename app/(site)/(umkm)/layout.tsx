import RoleGuard from "../../features/auth/RoleGuard";

/** Area UMKM: katalog, lelang, checkout, pesanan. Terbuka untuk tamu dan UMKM; pabrik dialihkan ke Lot saya. */
export default function Layout({ children }: { children: React.ReactNode }) {
  return <RoleGuard mode="not-pabrik">{children}</RoleGuard>;
}
