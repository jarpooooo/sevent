import type { Metadata } from "next";
import PesananView from "../../../features/umkm/pesanan/PesananView";

export const metadata: Metadata = {
  title: "Pesanan saya | Kainara",
  description: "Pantau pesanan dari bayar sampai bahan tiba. Demo, belum ada transaksi sungguhan.",
};

export default function PesananPage() {
  return (
    <main>
        <PesananView />
    </main>
  );
}
