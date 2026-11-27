import type { Metadata } from "next";
import { Suspense } from "react";
import PratinjauView from "../../../features/dokumen/PratinjauView";

export const metadata: Metadata = {
  title: "Pratinjau dokumen | Kainara",
  description: "Pratinjau invoice, laporan kepabeanan, dan rekonsiliasi, dengan unduhan PDF atau DOCX. Demo, data contoh.",
};

export default function DokumenPage() {
  return (
    <main>
      <Suspense>
        <PratinjauView />
      </Suspense>
    </main>
  );
}
