import type { Metadata } from "next";
import { Suspense } from "react";
import EximPesananView from "../../../../features/exim/EximPesananView";

export const metadata: Metadata = {
  title: "Periksa pesanan | Kainara",
  description: "Klasifikasi, dokumen pengeluaran, dan kewajiban fiskal satu pesanan. Demo, data contoh.",
};

export default function EximPesananPage() {
  return (
    <main>
      <Suspense>
        <EximPesananView />
      </Suspense>
    </main>
  );
}
