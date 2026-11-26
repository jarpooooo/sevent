import type { Metadata } from "next";
import RoleGuard from "../../components/auth/RoleGuard";
import PencairanDanaView from "../../components/pabrik/PencairanDanaView";

export const metadata: Metadata = {
  title: "Pencairan dana — ClearanceLoop",
  description: "Dana penjualan yang ditahan PJP dan yang sudah diteruskan. Demo, data contoh.",
};

export default function PencairanDanaPage() {
  return (
    <main>
      <RoleGuard mode="pabrik">
        <PencairanDanaView />
      </RoleGuard>
    </main>
  );
}
