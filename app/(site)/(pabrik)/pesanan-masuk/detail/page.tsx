import type { Metadata } from "next";
import { Suspense } from "react";
import PesananDetailView from "../../../../features/pabrik/PesananDetailView";

export const metadata: Metadata = {
  title: "Pesanan masuk, detail | Kainara",
  description: "Siapkan pesanan, isi data dokumen, dan pantau Compliance Lock. Demo, data contoh.",
};

export default function PesananMasukDetailPage() {
  return (
    <main>
      <Suspense>
        <PesananDetailView />
      </Suspense>
    </main>
  );
}
