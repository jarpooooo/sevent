import { NextResponse } from "next/server";
import { getLot } from "../../lib/data/lots";
import { quote } from "../../lib/domain/pricing";

/**
 * POST /api/quote  { "slug": "...", "qty": 25, "pickup": "ambil" | "kirim" }
 * Menghitung dan memvalidasi pesanan di server dengan aturan yang sama dengan layar checkout:
 * jumlah utuh, minimal MOQ, tidak melebihi stok, komisi 2% (ditanggung pabrik), harga lelang saat ini.
 * Jalur penulisan pesanan nanti memanggil fungsi yang sama sebelum menyimpan.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Isi permintaan bukan JSON yang valid." }, { status: 400 });
  }
  const { slug, qty, pickup } = (body ?? {}) as { slug?: unknown; qty?: unknown; pickup?: unknown };
  if (typeof slug !== "string" || typeof qty !== "number" || (pickup !== "ambil" && pickup !== "kirim")) {
    return NextResponse.json(
      { error: "Isi slug (teks), qty (angka), dan pickup ('ambil' atau 'kirim')." },
      { status: 400 },
    );
  }
  const lot = await getLot(slug);
  if (!lot) return NextResponse.json({ error: "Lot tidak ditemukan." }, { status: 404 });

  const q = quote(lot, qty, pickup);
  if (!q.ok) return NextResponse.json({ errors: q.errors }, { status: 422 });
  return NextResponse.json({ lot: { slug: lot.slug, code: lot.code, title: lot.title, unit: lot.unit }, ...q });
}
