import type { Metadata } from "next";
import AlurKerja from "../../../features/publik/alur-kerja/AlurKerja";

export const metadata: Metadata = {
  title: "Alur kerja | Kainara",
  description: "Alur UMKM penjahit dan pabrik di Kainara, dari daftar sampai bahan tiba.",
};

export default function AlurKerjaPage() {
  return (
    <main>
      <AlurKerja />
    </main>
  );
}
