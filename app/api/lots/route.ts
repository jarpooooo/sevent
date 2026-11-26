import { NextRequest, NextResponse } from "next/server";
import { getLots } from "../../lib/data/lots";
import { type LotFilter, filterLots } from "../../lib/domain/lots";
import { CATEGORIES } from "../../lib/domain/types";

/**
 * GET /api/lots?model=tetap|lelang&category=Baju|Celana|Kain&unit=kg|pcs&q=teks
 * Daftar lot, disaring di server. Bisa dipakai klien lain (aplikasi, mitra) selain halaman web ini.
 */
export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  const model = p.get("model");
  const category = p.get("category");
  const unit = p.get("unit");

  const filter: LotFilter = {
    model: model === "tetap" || model === "lelang" ? model : "semua",
    category: CATEGORIES.find((c) => c === category) ?? "semua",
    unit: unit === "kg" || unit === "pcs" ? unit : "semua",
    q: p.get("q") ?? undefined,
  };

  const lots = filterLots(await getLots(), filter);
  return NextResponse.json(
    { count: lots.length, lots },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" } },
  );
}
