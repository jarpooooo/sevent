import type { Metadata } from "next";
import AlurKerja from "../../components/AlurKerja";

export const metadata: Metadata = {
  title: "Alur kerja — ClearanceLoop",
  description: "Alur UMKM penjahit dan pabrik di ClearanceLoop, dari daftar sampai bahan tiba.",
};

export default function AlurKerjaPage() {
  return (
    <main>
      <AlurKerja />
    </main>
  );
}
