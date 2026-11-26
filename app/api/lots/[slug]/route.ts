import { NextResponse } from "next/server";
import { getLot } from "../../../lib/data/lots";

/** GET /api/lots/{slug}: satu lot, atau 404 bila tidak ada. */
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lot = await getLot(slug);
  if (!lot) return NextResponse.json({ error: "Lot tidak ditemukan." }, { status: 404 });
  return NextResponse.json(lot, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" },
  });
}
