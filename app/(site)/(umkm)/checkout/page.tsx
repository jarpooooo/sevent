import type { Metadata } from "next";
import { Suspense } from "react";
import CheckoutView from "../../../features/umkm/pesanan/CheckoutView";
import { getLots } from "../../../lib/data/lots";

export const metadata: Metadata = {
  title: "Checkout | Kainara",
  description: "Pilih cara terima dan cek rincian pembayaran lotmu. Demo, belum ada transaksi.",
};

export default async function CheckoutPage() {
  const lots = await getLots();
  return (
    <main>
        <Suspense fallback={<div className="min-h-svh" />}>
          <CheckoutView lots={lots} />
        </Suspense>
    </main>
  );
}
