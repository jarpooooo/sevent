import RoleGuard from "../../features/auth/RoleGuard";

/** Area admin: verifikasi akun dan konfirmasi kurir. Pabrik dan UMKM dialihkan, tamu ke halaman masuk. */
export default function Layout({ children }: { children: React.ReactNode }) {
  return <RoleGuard mode="admin">{children}</RoleGuard>;
}
