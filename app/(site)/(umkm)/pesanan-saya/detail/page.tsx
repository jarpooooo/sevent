import type { Metadata } from "next";
import { Suspense } from "react";
import DetailPesananView from "../../../../features/umkm/pesanan/DetailPesananView";

export const metadata: Metadata = {
  title: "Detail pesanan | Kainara",
  description: "Perjalanan pesanan, pengiriman, dan komplain. Demo, belum ada transaksi sungguhan.",
};

export default function DetailPesananPage() {
  return (
    <main>
      <Suspense fallback={null}>
        <DetailPesananView />
      </Suspense>
    </main>
  );
}
