import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import LotDetail from "../../../../features/umkm/katalog/LotDetail";
import { getLot, getLots } from "../../../../lib/data/lots";
import { relatedLots } from "../../../../lib/domain/lots";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return (await getLots()).map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const lot = await getLot(slug);
  if (!lot) return { title: "Lot tidak ditemukan | Kainara" };
  return {
    title: `${lot.title} | Katalog Kainara`,
    description: `${lot.notes} Contoh demo.`,
  };
}

async function Lot({ params }: { params: Params }) {
  const { slug } = await params;
  const lot = await getLot(slug);
  if (!lot) notFound();
  return <LotDetail lot={lot} related={relatedLots(await getLots(), lot)} />;
}

export default function LotPage({ params }: { params: Params }) {
  return (
    <main>
        <Suspense fallback={<div className="min-h-svh" />}>
          <Lot params={params} />
        </Suspense>
    </main>
  );
}
