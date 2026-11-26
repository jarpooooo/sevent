import type { Metadata } from "next";
import { Suspense } from "react";
import RoleGuard from "../../features/auth/RoleGuard";
import CheckoutView from "../../features/pesanan/CheckoutView";
import { getLot } from "../../lib/data/lots";

export const metadata: Metadata = {
  title: "Checkout — ClearanceLoop",
  description: "Pilih cara terima dan cek rincian pembayaran lotmu. Demo, belum ada transaksi.",
};

type SearchParams = Promise<{ lot?: string; qty?: string }>;

/** Query dibaca di server; lot diambil dari lapisan data (ber-cache), bukan dari bundel klien. */
async function Content({ searchParams }: { searchParams: SearchParams }) {
  const { lot, qty } = await searchParams;
  const data = lot ? await getLot(lot) : undefined;
  return <CheckoutView lot={data} qty={Number(qty) || 0} />;
}

export default function CheckoutPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main>
      <RoleGuard mode="not-pabrik">
        <Suspense fallback={<div className="min-h-svh" />}>
          <Content searchParams={searchParams} />
        </Suspense>
      </RoleGuard>
    </main>
  );
}
