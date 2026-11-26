import type { Metadata } from "next";
import RoleGuard from "../../components/auth/RoleGuard";
import KatalogView from "../../components/KatalogView";

export const metadata: Metadata = {
  title: "Katalog lot — ClearanceLoop",
  description:
    "Lihat lot sisa produksi tekstil dari pabrik: harga tetap regional atau lelang nasional, beli per kilo.",
};

export default function KatalogPage() {
  return (
    <main>
      <RoleGuard mode="not-pabrik">
        <KatalogView />
      </RoleGuard>
    </main>
  );
}
