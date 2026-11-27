import type { Metadata } from "next";
import PesananMasukView from "../../../features/pabrik/PesananMasukView";

export const metadata: Metadata = {
  title: "Pesanan masuk | Kainara",
  description: "Pesanan UMKM atas lot pabrikmu. Demo, data contoh.",
};

export default function PesananMasukPage() {
  return (
    <main>
        <PesananMasukView />
    </main>
  );
}
