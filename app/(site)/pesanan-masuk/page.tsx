import type { Metadata } from "next";
import RoleGuard from "../../features/auth/RoleGuard";
import PesananMasukView from "../../features/pabrik/PesananMasukView";

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
