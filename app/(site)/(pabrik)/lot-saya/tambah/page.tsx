import type { Metadata } from "next";
import TambahLotView from "../../../../features/pabrik/TambahLotView";

export const metadata: Metadata = {
  title: "Tambah lot | Kainara",
  description: "Isi data lot dan unggah bukti lapangan. Lot tampil di Katalog setelah Kami memeriksa. Contoh demo.",
};

export default function TambahLotPage() {
  return (
    <main>
      <TambahLotView />
    </main>
  );
}
