import type { Metadata } from "next";
import { Suspense } from "react";
import { DetailAkun } from "../../../../features/admin/Details";

export const metadata: Metadata = { title: "Detail pabrik | Admin Kainara", description: "Dashboard admin Kainara. Demo, data contoh." };

export default function Page() {
  return (
    <Suspense>
      <DetailAkun kind="pabrik" />
    </Suspense>
  );
}
