import type { Metadata } from "next";
import RoleGuard from "../../features/auth/RoleGuard";

/** Area akun: profil. Tamu dialihkan ke halaman masuk. */
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RoleGuard mode="login">{children}</RoleGuard>;
}
