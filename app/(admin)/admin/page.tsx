import type { Metadata } from "next";
import Ringkasan from "../../features/admin/Ringkasan";

export const metadata: Metadata = { title: "Ringkasan | Admin Kainara", description: "Dashboard admin Kainara. Demo, data contoh." };

export default function Page() {
  return <Ringkasan />;
}
