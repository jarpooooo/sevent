import type { Metadata } from "next";
import ProfilView from "../../../features/akun/ProfilView";

export const metadata: Metadata = {
  title: "Profil | Kainara",
  description: "Akun, verifikasi usaha, alamat, dan notifikasi. Demo, data contoh.",
};

export default function ProfilPage() {
  return (
    <main>
        <ProfilView />
    </main>
  );
}
