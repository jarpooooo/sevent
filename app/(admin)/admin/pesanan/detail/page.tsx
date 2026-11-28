import type { Metadata } from "next";
import { Suspense } from "react";
import { DetailPesanan } from "../../../../features/admin/Details";

export const metadata: Metadata = { title: "Detail pesanan | Admin Kainara", description: "Dashboard admin Kainara. Demo, data contoh." };

export default function Page() {
  return (
    <Suspense>
      <DetailPesanan />
    </Suspense>
  );
}
