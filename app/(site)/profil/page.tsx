import type { Metadata } from "next";
import RoleGuard from "../../components/auth/RoleGuard";
import ProfilView from "../../components/ProfilView";

export const metadata: Metadata = {
  title: "Profil — ClearanceLoop",
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
