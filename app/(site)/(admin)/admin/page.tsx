import type { Metadata } from "next";
import AdminView from "../../../features/admin/AdminView";

export const metadata: Metadata = {
  title: "Panel admin | Kainara",
  description: "Verifikasi akun UMKM dan pabrik, serta konfirmasi penerimaan dari kurir. Demo, data contoh.",
};

export default function AdminPage() {
  return (
    <main>
      <AdminView />
    </main>
  );
}
