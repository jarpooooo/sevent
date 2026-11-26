import type { Metadata } from "next";
import RoleGuard from "../../../components/auth/RoleGuard";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import LotDetail from "../../../components/LotDetail";
import { findLot, LOTS, relatedLots } from "../../../components/katalog/lots";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return LOTS.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const lot = findLot(slug);
  if (!lot) return { title: "Lot tidak ditemukan — ClearanceLoop" };
  return {
    title: `${lot.title} — Katalog ClearanceLoop`,
    description: `${lot.notes} Contoh demo.`,
  };
}

async function Lot({ params }: { params: Params }) {
  const { slug } = await params;
  const lot = findLot(slug);
  if (!lot) notFound();
  return <LotDetail lot={lot} related={relatedLots(lot)} />;
}

export default function LotPage({ params }: { params: Params }) {
  return (
    <main>
      <RoleGuard mode="not-pabrik">
        <Suspense fallback={<div className="min-h-svh" />}>
          <Lot params={params} />
        </Suspense>
      </RoleGuard>
    </main>
  );
}
