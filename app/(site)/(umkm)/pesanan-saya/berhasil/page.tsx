import type { Metadata } from "next";
import { Suspense } from "react";
import BerhasilView from "../../../../features/umkm/pesanan/BerhasilView";

export const metadata: Metadata = {
  title: "Pesanan | Kainara",
  description: "Transfer langsung ke pabrik dan unggah bukti. Demo, belum ada transaksi sungguhan.",
};

export default function Page() {
  return (
    <main>
      <Suspense fallback={null}>
        <BerhasilView />
      </Suspense>
    </main>
  );
}
