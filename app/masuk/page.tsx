import type { Metadata } from "next";
import MasukView from "../features/auth/MasukView";

export const metadata: Metadata = {
  title: "Masuk atau daftar — ClearanceLoop",
  description: "Masuk atau daftar sebagai UMKM penjahit atau pabrik di ClearanceLoop.",
};

export default function MasukPage() {
  return <MasukView />;
}
