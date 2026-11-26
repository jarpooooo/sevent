import type { Metadata } from "next";
import RoleGuard from "../../components/auth/RoleGuard";
import LotSayaView from "../../components/pabrik/LotSayaView";

export const metadata: Metadata = {
  title: "Lot saya — ClearanceLoop",
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
