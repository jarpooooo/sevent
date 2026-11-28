import type { Metadata } from "next";
import EximView from "../../../features/exim/EximView";

export const metadata: Metadata = {
  title: "Pemeriksaan EXIM | Kainara",
  description: "Pemeriksaan persyaratan pengeluaran barang dari pabrik. Demo, data contoh.",
};

export default function EximPage() {
  return (
    <main>
      <EximView />
    </main>
  );
}
