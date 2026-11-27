import RoleGuard from "../../features/auth/RoleGuard";

/** Area akun: profil. Tamu dialihkan ke halaman masuk. */
export default function Layout({ children }: { children: React.ReactNode }) {
  return <RoleGuard mode="login">{children}</RoleGuard>;
}
