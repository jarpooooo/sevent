import type { Metadata } from "next";
import RoleGuard from "../../components/auth/RoleGuard";
import PesananView from "../../components/PesananView";

export const metadata: Metadata = {
  title: "Pesanan saya — ClearanceLoop",
  description: "Pantau pesanan dari bayar sampai bahan tiba. Demo, belum ada transaksi sungguhan.",
};

export default function PesananPage() {
  return (
    <main>
      <RoleGuard mode="not-pabrik">
        <PesananView />
      </RoleGuard>
    </main>
  );
}
