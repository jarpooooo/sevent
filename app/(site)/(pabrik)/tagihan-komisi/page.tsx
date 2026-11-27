import type { Metadata } from "next";
import TagihanKomisiView from "../../../features/pabrik/TagihanKomisiView";

export const metadata: Metadata = {
  title: "Tagihan komisi | Kainara",
  description: "Penjualan dan komisi 2% per pesanan. Kami mencatat komisi dan menagihnya ke pabrik per periode. Contoh demo.",
};

export default function TagihanKomisiPage() {
  return (
    <main>
        <TagihanKomisiView />
    </main>
  );
}
