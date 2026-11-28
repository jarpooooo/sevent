import type { Metadata } from "next";
import { Suspense } from "react";
import { ListPesanan } from "../../../features/admin/ListViews";

export const metadata: Metadata = { title: "Pesanan | Admin Kainara", description: "Dashboard admin Kainara. Demo, data contoh." };

export default function Page() {
  return (
    <Suspense>
      <ListPesanan />
    </Suspense>
  );
}
