import type { Metadata } from "next";
import MasukView from "../features/auth/MasukView";

export const metadata: Metadata = {
  title: "Masuk atau daftar | Kainara",
  description: "Masuk atau daftar sebagai UMKM penjahit atau pabrik di Kainara.",
};

export default function MasukPage() {
  return <MasukView />;
}
