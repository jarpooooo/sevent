import type { Metadata } from "next";
import { Suspense } from "react";
import RoleGuard from "../../features/auth/RoleGuard";
import CheckoutView from "../../features/pesanan/CheckoutView";
import { getLots } from "../../lib/data/lots";

export const metadata: Metadata = {
  title: "Checkout | Kainara",
  description: "Pilih cara terima dan cek rincian pembayaran lotmu. Demo, belum ada transaksi.",
};

export default async function CheckoutPage() {
  const lots = await getLots();
  return (
    <main>
      <RoleGuard mode="not-pabrik">
        <Suspense fallback={<div className="min-h-svh" />}>
          <CheckoutView lots={lots} />
        </Suspense>
      </RoleGuard>
    </main>
  );
}
