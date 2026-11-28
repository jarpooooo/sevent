import type { Metadata } from "next";
import AdminShell from "../features/admin/AdminShell";
import RoleGuard from "../features/auth/RoleGuard";

export const metadata: Metadata = { robots: { index: false, follow: false } };

/** Area admin: dashboard dengan sidebar kiri, tanpa navbar atas. Peran lain dialihkan, tamu ke halaman masuk. */
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard mode="admin">
      <AdminShell>{children}</AdminShell>
    </RoleGuard>
  );
}
