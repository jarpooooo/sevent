import type { Metadata } from "next";
import RoleGuard from "../../features/auth/RoleGuard";
import ProfilView from "../../features/profil/ProfilView";

export const metadata: Metadata = {
  title: "Profil | Kainara",
  description: "Akun, verifikasi usaha, alamat, dan notifikasi. Demo, data contoh.",
};

export default function ProfilPage() {
  return (
    <main>
      <RoleGuard mode="login">
        <ProfilView />
      </RoleGuard>
    </main>
  );
}
