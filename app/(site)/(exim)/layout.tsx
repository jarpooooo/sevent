import RoleGuard from "../../features/auth/RoleGuard";

/** Area EXIM: memeriksa persyaratan pengeluaran barang. Peran lain dialihkan, tamu ke halaman masuk. */
export default function Layout({ children }: { children: React.ReactNode }) {
  return <RoleGuard mode="exim">{children}</RoleGuard>;
}
