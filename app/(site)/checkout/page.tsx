import type { Metadata } from "next";
import RoleGuard from "../../components/auth/RoleGuard";
import { Suspense } from "react";
import CheckoutView from "../../components/CheckoutView";

export const metadata: Metadata = {
  title: "Checkout — ClearanceLoop",
  description: "Pilih cara terima dan cek rincian pembayaran lotmu. Demo, belum ada transaksi.",
};

export default function CheckoutPage() {
  return (
    <main>
      <RoleGuard mode="not-pabrik">
        <Suspense fallback={<div className="min-h-svh" />}>
          <CheckoutView />
        </Suspense>
      </RoleGuard>
    </main>
  );
}
