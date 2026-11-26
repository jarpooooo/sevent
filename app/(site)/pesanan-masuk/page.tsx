import type { Metadata } from "next";
import RoleGuard from "../../components/auth/RoleGuard";
import PesananMasukView from "../../components/pabrik/PesananMasukView";

export const metadata: Metadata = {
  title: "Pesanan masuk — ClearanceLoop",
  description: "Pesanan UMKM atas lot pabrikmu. Demo, data contoh.",
};

export default function PesananMasukPage() {
  return (
    <main>
      <RoleGuard mode="pabrik">
        <PesananMasukView />
      </RoleGuard>
    </main>
  );
}
