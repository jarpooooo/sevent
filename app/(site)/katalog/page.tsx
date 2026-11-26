import type { Metadata } from "next";
import RoleGuard from "../../features/auth/RoleGuard";
import KatalogView from "../../features/katalog/KatalogView";
import { getLots } from "../../lib/data/lots";

export const metadata: Metadata = {
  title: "Katalog lot | Kainara",
  description:
    "Lihat lot sisa produksi tekstil dari pabrik: harga tetap regional atau lelang nasional, beli per kilo.",
};

export default async function KatalogPage() {
  // Data lot dibaca di server (ber-cache) dan dikirim sebagai props; bundel klien tidak memuat data contoh.
  const lots = await getLots();
  return (
    <main>
      <RoleGuard mode="not-pabrik">
        <KatalogView lots={lots} />
      </RoleGuard>
    </main>
  );
}
