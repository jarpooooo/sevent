import type { Metadata } from "next";
import { ListAkun } from "../../../features/admin/ListViews";

export const metadata: Metadata = { title: "Umkm | Admin Kainara", description: "Dashboard admin Kainara. Demo, data contoh." };

export default function Page() {
  return <ListAkun kind="umkm" />;
}
