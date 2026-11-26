import type { Metadata } from "next";
import RoleGuard from "../../features/auth/RoleGuard";
import LotSayaView from "../../features/pabrik/LotSayaView";

export const metadata: Metadata = {
  title: "Lot saya | Kainara",
  description: "Kelola lot sisa produksi pabrikmu. Demo, data contoh.",
};

export default function LotSayaPage() {
  return (
    <main>
      <RoleGuard mode="pabrik">
        <LotSayaView />
      </RoleGuard>
    </main>
  );
}
