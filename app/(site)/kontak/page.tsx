import type { Metadata } from "next";
import KontakView from "../../components/KontakView";

export const metadata: Metadata = {
  title: "Kontak — ClearanceLoop",
  description: "Tulis ke kami: penjahit yang cari bahan, atau pabrik yang punya sisa produksi.",
};

export default function KontakPage() {
  return (
    <main>
      <KontakView />
    </main>
  );
}
