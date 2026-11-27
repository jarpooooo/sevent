import type { Metadata } from "next";
import { Suspense } from "react";
import BayarView from "../../../../features/umkm/pesanan/BayarView";

export const metadata: Metadata = {
  title: "Pesanan | Kainara",
  description: "Bayar lewat virtual account PJP. Demo, belum ada transaksi sungguhan.",
};

export default function Page() {
  return (
    <main>
      <Suspense fallback={null}>
        <BayarView />
      </Suspense>
    </main>
  );
}
