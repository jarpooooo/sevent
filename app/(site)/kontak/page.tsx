import type { Metadata } from "next";
import KontakView from "../../features/kontak/KontakView";

export const metadata: Metadata = {
  title: "Kontak | Kainara",
  description: "Tulis ke kami: penjahit yang cari bahan, atau pabrik yang punya sisa produksi.",
};

export default function KontakPage() {
  return (
    <main>
      <KontakView />
    </main>
  );
}
